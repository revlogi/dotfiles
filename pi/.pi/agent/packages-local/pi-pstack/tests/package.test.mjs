import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sdk, expandPromptTemplate } from "./pi-sdk.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const names = ["how", "teach", "unslop", "why"];
const text = (path) => readFile(join(root, path), "utf8");
const manifest = JSON.parse(await text("package.json"));

async function markdownFiles(dir) {
  const paths = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) paths.push(...await markdownFiles(path));
    else if (item.name.endsWith(".md")) paths.push(path);
  }
  return paths;
}

test("Pi loads exactly four valid, independently discoverable skills", () => {
  const result = sdk.loadSkillsFromDir({ dir: join(root, "skills"), source: "test" });
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.skills.map((s) => s.name).sort(), names);
  assert.ok(result.skills.every((s) => !s.disableModelInvocation));
  assert.ok(!manifest.dependencies && !manifest.pi.extensions);
  assert.equal(manifest.pi.skills.length, 4);
  assert.equal(manifest.pi.prompts.length, 4);
});

test("all local Markdown links resolve", async () => {
  for (const file of await markdownFiles(root)) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      await assert.doesNotReject(realpath(resolve(dirname(file), target)), `${file}: ${target}`);
    }
  }
});

test("upstream epistemics and optional service playbooks remain byte-identical", async () => {
  const upstream = JSON.parse(await text("upstream.json"));
  for (const [path, hash] of Object.entries(upstream.files)) {
    if (path === "skills/why/references/epistemics.md" ||
        (path.includes("/sources/") && !path.endsWith("code-archaeology.md"))) {
      assert.equal(createHash("sha256").update(await readFile(join(root, path))).digest("hex"), hash, path);
    }
  }
  assert.match(await text("LICENSE"), /Copyright \(c\) 2026 Lauren Tan/);
});

test("native package discovery loads skills and alias arguments from another project", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "pi-pstack-package-"));
  try {
    await writeFile(join(sandbox, "settings.json"), JSON.stringify({ packages: [root] }));
    const loader = new sdk.DefaultResourceLoader({
      cwd: tmpdir(), agentDir: sandbox, noExtensions: true, noThemes: true, noContextFiles: true,
    });
    await loader.reload();
    assert.deepEqual(loader.getSkills().diagnostics, []);
    assert.deepEqual(loader.getPrompts().diagnostics, []);
    assert.deepEqual(loader.getSkills().skills.map((s) => s.name).sort(), names);
    const prompts = loader.getPrompts().prompts;
    assert.deepEqual(prompts.map((p) => p.name).sort(), names);
    // Test the host's real prompt expansion, including default and literal arguments.
    for (const name of names) {
      assert.match(expandPromptTemplate(`/${name}`, prompts), new RegExp(`follow the \\x60${name}\\x60 skill`));
      const expanded = expandPromptTemplate(`/${name} parser $1 $ARGUMENTS`, prompts);
      assert.ok(expanded.includes("parser $1 $ARGUMENTS"));
      assert.ok(!expandPromptTemplate(`/${name}`, prompts).includes("${ARGUMENTS"));
    }
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});

test("deployed global resources have no new name collisions", {
  skip: !process.env.PSTACK_GLOBAL_TEST,
}, async () => {
  const loader = new sdk.DefaultResourceLoader({
    cwd: tmpdir(), agentDir: join(homedir(), ".pi/agent"), noContextFiles: true,
  });
  await loader.reload();
  for (const result of [loader.getSkills(), loader.getPrompts()]) {
    assert.deepEqual(result.diagnostics.filter((d) =>
      /pi-pstack|\b(how|why|teach|unslop)\b/.test(JSON.stringify(d))), []);
  }
  assert.deepEqual(loader.getExtensions().errors, []);
  const extensions = loader.getExtensions().extensions;
  for (const name of names) {
    const skills = loader.getSkills().skills.filter((s) => s.name === name);
    const prompts = loader.getPrompts().prompts.filter((p) => p.name === name);
    assert.equal(skills.length, 1, name);
    assert.equal(prompts.length, 1, name);
    assert.equal(await realpath(skills[0].baseDir), join(root, "skills", name));
    for (const extension of extensions) assert.ok(!extension.commands.has(name), `command collision: ${name}`);
  }
  for (const name of ["process-learning-notes", "commit", "python-style"]) {
    assert.ok(loader.getSkills().skills.some((s) => s.name === name), `preserved ${name}`);
  }
});
