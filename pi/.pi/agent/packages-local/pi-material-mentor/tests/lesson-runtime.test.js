import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { startLesson, saveFeedback, validateLesson, renderLesson } from "../extensions/lesson-runtime.ts";
import interactiveLessons, { pendingEvidence } from "../extensions/interactive-lessons.ts";

const roots = [];
const running = [];
const lesson = {
  title: "值与引用", objective: "对照材料，预测修改是否影响原值",
  sources: [{ path: "material/source.md", location: "§1", excerpt: "复制值会产生独立副本。" }],
  explanation: "区分复制出的副本与同一个对象的引用。",
  questions: [{ id: "predict", prompt: "修改副本后，原值是否变化？为什么？", hint: "想想两个名字是否指向同一存储位置。", source: 0 }],
};
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "mentor-test-"));roots.push(root);
  mkdirSync(join(root, "material"));mkdirSync(join(root, "lessons"));
  writeFileSync(join(root, "material/source.md"), lesson.sources[0].excerpt);
  writeFileSync(join(root, "lessons/one.json"), JSON.stringify(lesson));
  return root;
}
async function launch(root, callback = () => {}) {
  const server = await startLesson(root, "one.json", callback);running.push(server);return server;
}
function post(url, event, origin = url) {
  return fetch(url + "/events", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(event) });
}
const answer = () => ({ id: randomUUID(), attempt: randomUUID(), kind: "answer", question: "predict", value: "原值不变，因为副本有独立存储。" });
afterEach(async () => {
  for (const server of running.splice(0)) await server.close();
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});
test("captures hint context, deduplicates retries, returns persisted feedback", async () => {
  const root = fixture(), received = [];
  const { url } = await launch(root, event => received.push(event));
  const event = answer();
  const hint = { ...event, id: randomUUID(), kind: "hint", value: "" };
  expect((await post(url, hint)).status).toBe(200);
  expect(received.length).toBe(0);
  expect((await post(url, event)).status).toBe(200);
  expect((await post(url, event)).status).toBe(200);
  expect(received.length).toBe(1);
  expect(received[0].hintUsed).toBe(true);
  expect(readdirSync(join(root, "learning/events")).length).toBe(2);
  expect((await post(url, { ...event, value: "changed" })).status).toBe(409);
  expect((await fetch(url + "/feedback/" + event.id)).status).toBe(202);
  saveFeedback(root, event.id, "解释符合原文；这是有提示练习。", "尝试一个不看提示的新例子。");
  const result = await (await fetch(url + "/feedback/" + event.id)).json();
  expect(result.feedback).toContain("有提示");
  expect(() => saveFeedback(root, event.id, "overwrite", "next")).toThrow();
});
test("preserves evidence if the agent is unavailable; position is a separate event", async () => {
  const root = fixture();
  const { url } = await launch(root, () => { throw Error("agent unavailable"); });
  const event = { ...answer(), kind: "position", question: "position", value: "读完 §1" };
  expect((await post(url, event)).status).toBe(200);
  const saved = JSON.parse(readFileSync(join(root, "learning/events", event.id + ".json"), "utf8"));
  expect(saved.kind).toBe("position");
  expect(saved).not.toHaveProperty("mastery");
  const snapshot = JSON.parse(readFileSync(join(root, "learning/lessons", saved.revision + ".json"), "utf8"));
  expect(snapshot.lesson.sources[0].location).toBe("§1");
  expect(snapshot.sources[0].hash).toHaveLength(64);
});
test("page views do not create evidence and served source bytes are stable", async () => {
  const root = fixture();const { url } = await launch(root);
  expect((await fetch(url)).status).toBe(200);
  writeFileSync(join(root, "material/source.md"), "changed");
  expect(await (await fetch(url + "/source/0")).text()).toBe(lesson.sources[0].excerpt);
  expect(readdirSync(join(root, "learning/events"))).toEqual([]);
});
test("rejects foreign origin, path injection and unknown questions without writing evidence", async () => {
  const root = fixture();const { url } = await launch(root);
  expect((await post(url, answer(), "https://example.com")).status).toBe(403);
  expect((await post(url, { ...answer(), id: "../../escape" })).status).toBe(400);
  expect((await post(url, { ...answer(), question: "missing" })).status).toBe(400);
  expect((await fetch(url + "/material/source.md")).status).toBe(404);
  expect(readdirSync(join(root, "learning/events"))).toEqual([]);
});
test("rejects lesson/source symlink escapes and redirected evidence directories", async () => {
  const root = fixture(), outside = fixture();
  symlinkSync(join(outside, "material/source.md"), join(root, "material/escape.md"));
  const escaped = { ...lesson, sources: [{ ...lesson.sources[0], path: "material/escape.md" }] };
  writeFileSync(join(root, "lessons/one.json"), JSON.stringify(escaped));
  await expect(startLesson(root, "one.json", () => {})).rejects.toThrow("escapes");
  await expect(startLesson(root, "../material/source.md", () => {})).rejects.toThrow("escapes");
  writeFileSync(join(root, "lessons/one.json"), JSON.stringify(lesson));
  symlinkSync(outside, join(root, "learning"));
  await expect(startLesson(root, "one.json", () => {})).rejects.toThrow("symlink");
});
test("rejects ambiguous question ids and renders source text without executable markup", () => {
  expect(() => validateLesson({ ...lesson, questions: [lesson.questions[0], lesson.questions[0]] })).toThrow();
  expect(() => validateLesson({ ...lesson, questions: [{ ...lesson.questions[0], id: "position" }] })).toThrow();
  const html = renderLesson({ ...lesson, title: "<script>alert(1)</script>" });
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("<script>alert(1)</script>");
  expect(html).not.toContain(lesson.questions[0].hint);
});

test("Pi extension queues assessment, discovers pending work and closes on session switch", async () => {
  const root = fixture();writeFileSync(join(root, "COURSE.md"), "# Test course");
  const tools = new Map(), handlers = new Map(), messages = [];
  interactiveLessons({
    registerTool(tool) { tools.set(tool.name, tool); },
    registerCommand() {},
    on(name, handler) { handlers.set(name, handler); },
    sendMessage(message, options) { messages.push({ message, options }); },
  });
  const ctx = { cwd: root };
  try {
    const opened = await tools.get("mentor_open_lesson").execute("open", { manifest: "one.json" }, null, null, ctx);
    const url = opened.details.url;
    const event = answer();
    await post(url, { ...event, id: randomUUID(), kind: "hint", value: "" });
    await post(url, event);
    expect(messages.length).toBe(1);
    expect(messages[0].options).toEqual({ triggerTurn: true, deliverAs: "followUp" });
    expect(pendingEvidence(root)).toEqual([event.id + ".json"]);
    const injected = await handlers.get("before_agent_start")({ systemPrompt: "base" }, ctx);
    expect(injected.systemPrompt).toContain(event.id);
    await tools.get("mentor_feedback").execute("feedback", { eventId: event.id, feedback: "Specific diagnosis", next: "One next task" }, null, null, ctx);
    expect(pendingEvidence(root)).toEqual([]);
    expect((await fetch(url + "/feedback/" + event.id)).status).toBe(200);
    await handlers.get("session_before_switch")();
    await expect(fetch(url)).rejects.toThrow();
  } finally { await handlers.get("session_shutdown")(); }
});

test("pending discovery reports malformed evidence instead of silently skipping it", async () => {
  const root = fixture();await launch(root);
  writeFileSync(join(root, "learning/events", randomUUID() + ".json"), "{broken");
  expect(() => pendingEvidence(root)).toThrow();
});
