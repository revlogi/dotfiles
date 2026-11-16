import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, mkdir, rm, realpath } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { sdk } from "../skills/reflect/scripts/pi-sdk.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const helper = join(root, "skills/reflect/scripts/transcript.mjs");
async function open(cwd, agentDir) {
  const loader = new sdk.DefaultResourceLoader({ cwd, agentDir, noContextFiles: true, noThemes: true });
  await loader.reload();
  assert.deepEqual(loader.getExtensions().errors, []);
  const { session } = await sdk.createAgentSession({ cwd, agentDir, resourceLoader: loader,
    sessionManager: sdk.SessionManager.inMemory(cwd) });
  await session.bindExtensions({});
  const extension = loader.getExtensions().extensions.find(e => e.tools.has("memory_write"));
  const ctx = session.extensionRunner.createContext();
  const call = async (name, args = {}) => extension.tools.get(name).definition.execute("test", args, undefined, undefined, ctx);
  return { session, loader, call, ctx };
}
const text = r => r.content.filter(c => c.type === "text").map(c => c.text).join("\n");

test("installed global resources register memory exactly once and preserve existing skills", async () => {
  const loader = new sdk.DefaultResourceLoader({ cwd: process.cwd(), agentDir: join(homedir(), ".pi/agent"), noContextFiles: true });
  await loader.reload();
  assert.deepEqual(loader.getExtensions().errors, []);
  assert.deepEqual(loader.getSkills().diagnostics, []);
  assert.deepEqual(loader.getPrompts().diagnostics, []);
  const exts = loader.getExtensions().extensions;
  for (const name of ["memory_write", "memory_read", "memory_forget", "memory_restore", "memory_status", "memory_search", "scratchpad"])
    assert.equal(exts.filter(e => e.tools.has(name)).length, 1, name);
  const skills = loader.getSkills().skills;
  assert.equal(skills.filter(s => s.name === "reflect").length, 1);
  assert.ok(skills.find(s => s.name === "reflect").disableModelInvocation);
  for (const name of ["how", "why", "teach", "unslop", "process-learning-notes", "commit", "python-style"])
    assert.ok(skills.some(s => s.name === name), name);
  assert.ok(!exts.some(e => e.commands.has("reflect")));
});

test("upstream tools persist across fresh SDK sessions, forget/restore, no exit summaries", async () => {
  const temp = await mkdtemp(join(tmpdir(), "pi-memory-unit-"));
  const old = process.env.PI_MEMORY_DIR;
  process.env.PI_MEMORY_DIR = join(temp, "memory");
  try {
    await writeFile(join(temp, "settings.json"), JSON.stringify({ packages: [root] }));
    let s = await open(temp, temp);
    const saved = await s.call("memory_write", { target: "long_term", content: "#lesson TEST-UNIQUE-718 verified fixture only", mode: "append" });
    assert.match(text(saved), /Appended/);
    assert.match(text(await s.call("memory_status")), /EXIT_SUMMARY: disabled/);
    assert.match(text(await s.call("memory_status")), /QMD_UPDATE: off/);
    await s.session.extensionRunner.emit({ type: "session_shutdown", reason: "quit" });
    s.session.dispose();
    s = await open(temp, temp);
    assert.match(text(await s.call("memory_read", { target: "long_term" })), /TEST-UNIQUE-718/);
    const forgot = await s.call("memory_forget", { target: "long_term", match: "TEST-UNIQUE-718" });
    assert.doesNotMatch(text(await s.call("memory_read", { target: "long_term" })), /TEST-UNIQUE-718/);
    const recoveryId = forgot.details.recoveryId;
    assert.ok(recoveryId);
    await s.call("memory_restore", { recoveryId });
    assert.match(text(await s.call("memory_read", { target: "long_term" })), /TEST-UNIQUE-718/);
    await s.session.extensionRunner.emit({ type: "session_before_compact" });
    await s.session.extensionRunner.emit({ type: "session_shutdown", reason: "quit" });
    s.session.dispose();
    await assert.rejects(readFile(join(temp, "memory/daily", new Date().toISOString().slice(0,10) + ".md")), /ENOENT/);
  } finally {
    if (old === undefined) delete process.env.PI_MEMORY_DIR; else process.env.PI_MEMORY_DIR = old;
    await rm(temp, { recursive: true, force: true });
  }
});

test("repository subdirectories share scope; unrelated cwd stays isolated across reloads", async () => {
  const temp = await mkdtemp(join(tmpdir(), "pi-memory-scope-"));
  const old = process.env.PI_MEMORY_DIR;
  delete process.env.PI_MEMORY_DIR;
  const paths = [];
  try {
    const repo = join(temp, "repo"), sub = join(repo, "sub"), other = join(temp, "other");
    await mkdir(sub, { recursive: true }); await mkdir(other);
    execFileSync("git", ["init", "-q", repo]);
    await writeFile(join(temp, "settings.json"), JSON.stringify({ packages: [root] }));
    for (const cwd of [repo, sub, other, repo]) {
      const s = await open(cwd, temp);
      const status = await s.call("memory_status");
      paths.push(status.details.dir);
      s.session.dispose();
    }
    assert.ok(paths.every(Boolean));
    assert.equal(paths[0], paths[1]); assert.equal(paths[0], paths[3]); assert.notEqual(paths[0], paths[2]);
  } finally {
    if (old !== undefined) process.env.PI_MEMORY_DIR = old;
    for (const path of new Set(paths)) await rm(path, { recursive: true, force: true });
    await rm(temp, { recursive: true, force: true });
  }
});

test("transcript helper validates live identity and follows branch without thinking/system data", async () => {
  const temp = await mkdtemp(join(tmpdir(), "pi-transcript-test-"));
  try {
    const m = sdk.SessionManager.create(temp, temp);
    const first = m.appendMessage({ role: "user", content: "opening fixture", timestamp: Date.now() });
    m.appendMessage({ role: "user", content: "abandoned branch", timestamp: Date.now() });
    m.branch(first);
    m.appendMessage({ role: "assistant", content: [{ type: "thinking", thinking: "SECRET-THINKING" }, { type: "text", text: "active branch" }], timestamp: Date.now() });
    const file = m.getSessionFile();
    const run = (env = {}) => execFileSync("node", [helper], { cwd: temp, encoding: "utf8",
      env: { ...process.env, PI_SESSION_FILE: file, PI_SESSION_ID: m.getSessionId(), ...env }, stdio: ["ignore", "pipe", "pipe"] });
    const digest = run();
    assert.match(digest, /opening fixture/); assert.match(digest, /active branch/);
    assert.doesNotMatch(digest, /abandoned branch|SECRET-THINKING/);
    assert.throws(() => run({ PI_SESSION_ID: "wrong" }), /ID mismatch/);
    assert.throws(() => run({ PI_SESSION_FILE: "" }), /No PI_SESSION_FILE/);
    assert.match(execFileSync("node", [helper, "--file", file], { encoding: "utf8" }), /"fixture":true/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test("Reflect links resolve and includes explicit approval and separate destinations", async () => {
  const skill = join(root, "skills/reflect/SKILL.md");
  const content = await readFile(skill, "utf8");
  for (const [, link] of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) await realpath(resolve(dirname(skill), link));
  for (const term of ["**Memory:**", "**Skill:**", "**Structural:**", "**Discard:**", "then **stop**", "Obsidian", "memory_write"])
    assert.ok(content.includes(term), term);
});
