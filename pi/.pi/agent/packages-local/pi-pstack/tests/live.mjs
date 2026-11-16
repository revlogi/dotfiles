import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Opt-in model-backed tests. Uses the real global Pi setup; artifacts stay in /tmp.
// Override PI_BIN, PSTACK_MODEL, PSTACK_PROVIDER, or PSTACK_CASE to rerun a subset.
const pi = process.env.PI_BIN || "pi";
const provider = process.env.PSTACK_PROVIDER || process.env.PI_PROVIDER || "openai-codex";
const model = process.env.PSTACK_MODEL || process.env.PI_MODEL || "gpt-6.1-sol";
const root = await mkdtemp(join(tmpdir(), "pi-pstack-live-"));
const repo = join(root, "repo");
const plain = join(root, "no-git");
await mkdir(repo);
await mkdir(plain);

const files = {
  "queue.hpp": `#pragma once
#include <algorithm>
#include <string>
#include <vector>
class Queue {
  std::vector<std::string> items_;
public:
  static constexpr int capacity = 17;
  bool push(std::string item) {
    if (items_.size() >= capacity) return false;
    items_.push_back(std::move(item));
    return true;
  }
  std::vector<std::string> frontBatch(int limit) const {
    const auto n = std::min(items_.size(), static_cast<std::size_t>(limit));
    return {items_.begin(), items_.begin() + n};
  }
  void ack(int count) { items_.erase(items_.begin(), items_.begin() + count); }
};
`,
  "sender.cpp": `#include "queue.hpp"
struct Transport {
  virtual bool send(const std::vector<std::string>& batch) = 0;
};
constexpr int batch_limit = 16;
bool flush(Queue& queue, Transport& transport) {
  auto batch = queue.frontBatch(batch_limit);
  if (batch.empty()) return true;
  if (!transport.send(batch)) return false;
  queue.ack(static_cast<int>(batch.size()));
  return true;
}
`,
  "README.md": "# Sender\n\nQueue stores items in insertion order. A successful flush removes the sent prefix.\nA failed send leaves all queued items available for retry.\n",
};
for (const [name, content] of Object.entries(files)) await writeFile(join(repo, name), content);
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" });
git("init", "-q");
git("add", ".");
const commit = (message) => git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
  "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "-qm", message);
commit("feat: add ordered batch sender");
files["sender.cpp"] = files["sender.cpp"].replace("batch_limit = 16", "batch_limit = 2");
files["README.md"] += "\n## Provider contract\n\nThe provider rejects requests containing more than two items. We cap batches at two to avoid rejected requests, not to improve throughput.\nNo rationale for the queue capacity is recorded here.\n";
for (const [name, content] of Object.entries(files)) {
  await writeFile(join(repo, name), content);
  await writeFile(join(plain, name), content);
}
git("add", ".");
commit("fix: cap batches at the provider limit\n\nThe provider rejects more than two items per request. This is a compatibility constraint, not a performance optimization.");

const tests = [
  {
    id: "unslop-prose", cwd: repo,
    prompts: ["/unslop Rewrite only this prose: Certainly! It is important to note that the cache serves as a pivotal mechanism, ensuring that repeated requests can leverage stored results. The lookup may be stale for up to 30 seconds [spec §2]."],
    check: (s) => {
      assert.match(s, /30 seconds/); assert.match(s, /stale/i); assert.match(s, /spec §2/);
      assert.doesNotMatch(s, /Certainly|pivotal|It is important to note/);
    },
  },
  {
    id: "unslop-precision", cwd: repo,
    prompts: ["/skill:unslop Tighten this paragraph, preserving the literal quotation and inline code: Additionally, the vector stores n elements and provides an O(n) scan. The API surface includes `reserve(n)`. The author wrote \"This may reduce allocations; we have not measured it.\" It is important to note that the improvement is unverified."],
    check: (s) => {
      assert.match(s, /vector/); assert.match(s, /O\(n\)/); assert.match(s, /`reserve\(n\)`/);
      assert.ok(s.includes('"This may reduce allocations; we have not measured it."'));
      assert.doesNotMatch(s, /It is important to note|Additionally/);
    },
  },
  {
    id: "how-narrow", cwd: repo,
    prompts: ["/how How does Queue::frontBatch work? Explain its boundary behavior without changing files."],
    check: (s) => { assert.match(s, /min|smaller|at most/i); assert.match(s, /empty|zero|0/i); assert.match(s, /queue\.hpp/); },
  },
  {
    id: "how-natural", cwd: repo,
    prompts: ["How does this subsystem work when A, B, and C are queued and flush is called once? Walk me through ownership and what happens if sending fails. Do not change anything."],
    check: (s, calls) => {
      assert.match(s, /sender\.cpp/); assert.match(s, /fail/i); assert.match(s, /queue|retain|remain/i);
      assert.ok(calls.some((c) => c.toolName === "read" && /skills\/how\/SKILL\.md$/.test(c.args.path)));
    },
  },
  {
    id: "why-direct", cwd: repo,
    prompts: ["/why Why is batch_limit two rather than sixteen? I assume it was a performance optimization. Investigate the actual evidence."],
    check: (s, calls) => {
      assert.match(s, /reject|provider.*limit|compatibility/i); assert.match(s, /not.*performance|rather than.*performance/i);
      assert.match(s, /README\.md|[a-f0-9]{7,40}/);
      assert.ok(calls.some((c) => c.toolName === "bash" && /git (log|show|blame)/.test(c.args.command)));
    },
  },
  {
    id: "why-unknown", cwd: repo,
    prompts: ["/why Why is Queue::capacity exactly 17? Check local code, Git, and docs. Do not invent a reason, and do not use the network."],
    check: (s) => { assert.match(s, /17/); assert.match(s, /unknown|not.*document|no.*rationale|cannot.*determine|not.*record/i); },
  },
  {
    id: "why-no-git", cwd: plain,
    prompts: ["/skill:why Why is batch_limit two? This copy has no Git history or external service access. Use whatever evidence exists locally."],
    check: (s) => { assert.match(s, /reject|provider/i); assert.match(s, /README\.md/); assert.match(s, /no.*[Gg]it|history.*unavailable|not.*[Gg]it|[Gg]it.*unavailable/); },
  },
  {
    id: "teach-compose", cwd: repo,
    prompts: ["/teach Teach me this sender so I can safely change it. Explain one flush with A, B, C queued, why two items are sent, and what failure preserves. Keep it under 300 words."],
    check: (s, calls) => {
      assert.match(s, /reject|provider/i); assert.match(s, /fail/i); assert.match(s, /C/);
      for (const name of ["how", "why", "unslop"]) {
        assert.ok(calls.some((c) => c.toolName === "read" && c.args.path?.endsWith(`/skills/${name}/SKILL.md`)), `Teach loads ${name}`);
      }
    },
  },
  {
    id: "teach-detail", cwd: plain,
    prompts: ["/skill:teach I want a detailed walkthrough now, not a quiz or a one-sentence preview. Build a mental model of the queue and flush protocol, including boundaries and why batches stop at two. Then tell me whether we know why capacity is 17."],
    check: (s) => {
      assert.match(s, /17/); assert.match(s, /unknown|not.*document|no.*rationale|not.*record/i);
      assert.match(s, /reject|provider/i); assert.ok(s.split(/\s+/).length > 100);
      assert.doesNotMatch(s, /say it back|quiz|mastery:|curriculum/i);
    },
  },
  {
    id: "how-why-teach-chain", cwd: repo,
    prompts: [
      "/how Explain one flush with A, B, C queued in under 150 words.",
      "/why Why cap that batch at two? Use local evidence and history only, under 180 words.",
      "/teach Use the mechanics and rationale we just established to explain how to change batching safely. Do not repeat the investigation unless evidence is missing. Under 220 words.",
    ],
    check: (s) => { assert.match(s, /provider|reject/i); assert.match(s, /fail|ack|success/i); },
  },
];

async function snapshot(dir) {
  const entries = [];
  for (const name of (await readdir(dir)).sort()) {
    if (name === ".git") continue;
    entries.push([name, createHash("sha256").update(await readFile(join(dir, name))).digest("hex")]);
  }
  return JSON.stringify(entries);
}
const before = new Map([[repo, await snapshot(repo)], [plain, await snapshot(plain)]]);

async function run(test) {
  const stem = join(root, test.id);
  const started = Date.now();
  const args = ["--mode", "json", "--no-session", "--no-mcp", "--no-approve", "--offline",
    "--provider", provider, "--model", model, "--thinking", "low",
    "--tools", "read,bash,grep,find,ls", ...test.prompts];
  let stdout = "", stderr = "";
  const child = spawn(pi, args, {
    cwd: test.cwd, env: { ...process.env, PI_OFFLINE: "1" }, stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.setEncoding("utf8").on("data", (s) => { stdout += s; });
  child.stderr.setEncoding("utf8").on("data", (s) => { stderr += s; });
  const timeout = setTimeout(() => child.kill("SIGTERM"), 240_000);
  let status;
  try {
    status = await new Promise((resolve, reject) => {
      child.on("error", reject); child.on("close", (code, signal) => resolve({ code, signal }));
    });
  } finally { clearTimeout(timeout); }
  await writeFile(`${stem}.jsonl`, stdout);
  await writeFile(`${stem}.stderr`, stderr);
  try {
    assert.equal(status.code, 0, `${status.signal || ""}\n${stderr}`);
    const events = stdout.trim().split("\n").filter(Boolean).map((s) => JSON.parse(s));
    const calls = events.filter((e) => e.type === "tool_execution_start");
    const errors = events.filter((e) => e.type === "tool_execution_end" && e.isError);
    const messages = events.filter((e) => e.type === "message_end" && e.message.role === "assistant").map((e) => e.message);
    // A provider overload may be recovered by Pi's automatic retry. Require a
    // successful final state, not the absence of every intermediate error.
    assert.equal(messages.at(-1)?.stopReason, "stop");
    assert.ok(!events.some((e) => e.type === "agent_settled" && e.aborted));
    assert.ok(!events.some((e) => e.type === "auto_retry_end" && !e.success));
    const finals = messages.filter((m) => m.stopReason === "stop" && !m.content.some((c) => c.type === "toolCall"));
    const answers = finals.map((m) => m.content.filter((c) => c.type === "text").map((c) => c.text).join("\n"));
    assert.ok(answers.length >= test.prompts.length, "all prompts answered");
    const answer = answers.at(-1);
    await writeFile(`${stem}.md`, answers.join("\n\n---\n\n"));
    assert.ok(calls.every((c) => ["read", "bash", "grep", "find", "ls"].includes(c.toolName)));
    assert.ok(!calls.some((c) => /\bpi\s+(?:-p|--print)\b/.test(JSON.stringify(c.args))));
    test.check(answer, calls);
    if (!test.id.startsWith("unslop")) {
      assert.ok(calls.some((c) => c.toolName === "grep" ||
        (c.toolName === "bash" && /\brg\b[^\n]*(?:-n|--line-number)|\bgit\s+blame\b/.test(c.args.command))),
      "source line citations checked against numbered output");
    }
    return { id: test.id, passed: true, seconds: (Date.now() - started) / 1000, toolCalls: calls.length, toolErrors: errors.length,
      recoveredRetries: events.filter((e) => e.type === "auto_retry_end" && e.success).length };
  } catch (error) {
    return { id: test.id, passed: false, seconds: (Date.now() - started) / 1000, error: String(error) };
  }
}

console.log(`Artifacts: ${root}\nModel: ${provider}/${model}`);
const selected = tests.filter((t) => !process.env.PSTACK_CASE || t.id.includes(process.env.PSTACK_CASE));
assert.ok(selected.length, "no matching test case");
const results = [];
// Two concurrent sessions keep costs and service pressure bounded.
for (let i = 0; i < selected.length; i += 2) {
  for (const result of await Promise.all(selected.slice(i, i + 2).map(run))) {
    results.push(result); console.log(JSON.stringify(result));
  }
}
for (const [dir, original] of before) assert.equal(await snapshot(dir), original, `read-only: ${dir}`);
assert.equal(git("status", "--porcelain"), "");
await writeFile(join(root, "results.json"), JSON.stringify({ provider, model, results, readOnly: true }, null, 2));
process.exitCode = results.every((r) => r.passed) ? 0 : 1;
