import { afterEach, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import teachRuntime, { findTeachingRoot, pendingEvidence, saveFeedback, serveLesson } from "../extensions/teach-runtime.ts";

const roots = [], running = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "pi-teach-")); roots.push(root);
  mkdirSync(join(root, "lessons")); mkdirSync(join(root, "assets")); mkdirSync(join(root, "material"));
  writeFileSync(join(root, "MISSION.md"), "# Mission: test");
  writeFileSync(join(root, "lessons/0001-test.html"), "<!doctype html><link rel=stylesheet href=/assets/teach.css><h1>Lesson</h1>");
  writeFileSync(join(root, "assets/teach.css"), "body{color:black}");
  writeFileSync(join(root, "material/note.txt"), "human source");
  return root;
}
const answer = () => ({ id: randomUUID(), attempt: randomUUID(), kind: "answer", question: "explain-step", answer: "My explanation" });
async function launch(root, callback = () => {}) { const runtime = await serveLesson(root, "0001-test.html", ["material/note.txt"], callback); running.push(runtime); return runtime; }
const post = (url, body, origin = url) => fetch(url + "/api/events", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
afterEach(async () => { for (const runtime of running.splice(0)) await runtime.close(); for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

test("finds a teaching workspace from a nested directory", () => {
  const root = fixture(); mkdirSync(join(root, "work/deep"), { recursive: true });
  expect(findTeachingRoot(join(root, "work/deep"))).toBe(root);
});
test("serves only the active lesson, named assets, and explicitly registered materials", async () => {
  const root = fixture(), { url } = await launch(root);
  expect(await (await fetch(url)).text()).toContain("Lesson");
  expect(await (await fetch(url + "/assets/teach.css")).text()).toContain("color:black");
  expect(await (await fetch(url + "/material/0")).text()).toBe("human source");
  expect((await fetch(url + "/MISSION.md")).status).toBe(404);
  expect((await fetch(url + "/material/1")).status).toBe(404);
});
test("records immutable answer evidence with lesson and material hashes", async () => {
  const root = fixture(), received = [], { url } = await launch(root, event => received.push(event));
  const event = answer(); expect((await post(url, event)).status).toBe(200); expect((await post(url, event)).status).toBe(200);
  expect(received).toHaveLength(1); expect(received[0].lesson.sha256).toHaveLength(64); expect(received[0].materials[0].sha256).toHaveLength(64);
  expect(pendingEvidence(root)).toEqual([event.id + ".json"]);
  expect((await post(url, { ...event, answer: "changed" })).status).toBe(409);
  saveFeedback(root, event.id, "Specific feedback", "One next action");
  expect(pendingEvidence(root)).toEqual([]);
  expect((await (await fetch(url + "/api/feedback/" + event.id)).json()).next).toBe("One next action");
  expect(() => saveFeedback(root, event.id, "overwrite", "next")).toThrow();
});
test("records hint context and keeps evidence when Pi callback fails", async () => {
  const root = fixture(), { url } = await launch(root, () => { throw Error("offline"); });
  const event = answer(), hint = { ...event, id: randomUUID(), kind: "hint", answer: "" };
  await post(url, hint); expect((await post(url, event)).status).toBe(200);
  const saved = JSON.parse(readFileSync(join(root, "evidence/events", event.id + ".json"), "utf8"));
  expect(saved.hintUsed).toBe(true); expect(readdirSync(join(root, "evidence/events"))).toHaveLength(2);
});
test("rejects foreign origins, malformed ids, and unregistered source paths", async () => {
  const root = fixture(), { url } = await launch(root);
  expect((await post(url, answer(), "https://example.com")).status).toBe(403);
  expect((await post(url, { ...answer(), id: "../../bad" })).status).toBe(400);
  await expect(serveLesson(root, "../MISSION.md", [], () => {})).rejects.toThrow();
  await expect(serveLesson(root, "0001-test.html", ["../outside"], () => {})).rejects.toThrow();
});
test("extension queues answer assessment and stops the page on session switch", async () => {
  const root = fixture(), tools = new Map(), handlers = new Map(), messages = [];
  teachRuntime({ registerTool(tool) { tools.set(tool.name, tool); }, registerCommand() {}, on(name, handler) { handlers.set(name, handler); }, sendMessage(message, options) { messages.push({ message, options }); } });
  const opened = await tools.get("teach_open_lesson").execute("id", { lesson: "0001-test.html", materials: ["material/note.txt"] }, null, null, { cwd: root });
  const event = answer(); await post(opened.details.url, event);
  expect(messages).toHaveLength(1); expect(messages[0].options).toEqual({ triggerTurn: true, deliverAs: "followUp" });
  expect((await handlers.get("before_agent_start")({ systemPrompt: "base" }, { cwd: root })).systemPrompt).toContain(event.id);
  await handlers.get("session_before_switch")(); await expect(fetch(opened.details.url)).rejects.toThrow();
});
