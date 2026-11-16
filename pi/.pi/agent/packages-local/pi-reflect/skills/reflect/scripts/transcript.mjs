import { readFileSync, realpathSync } from "node:fs";
import { sdk } from "./pi-sdk.mjs";

const args = process.argv.slice(2);
const fixture = args[0] === "--file" && args.length === 2;
if (args.length && !fixture) throw new Error("Usage: transcript.mjs [--file <explicit-fixture>]");
const file = fixture ? args[1] : process.env.PI_SESSION_FILE;
if (!file) throw new Error("No PI_SESSION_FILE: use the visible conversation digest; do not guess another session.");
const header = JSON.parse(readFileSync(file, "utf8").split("\n", 1)[0]);
if (header.type !== "session") throw new Error("Not a Pi session transcript.");
if (!fixture) {
  if (!process.env.PI_SESSION_ID || header.id !== process.env.PI_SESSION_ID) throw new Error("Active session ID mismatch.");
  if (realpathSync(header.cwd) !== realpathSync(process.cwd())) throw new Error("Active session cwd mismatch.");
}
const manager = sdk.SessionManager.open(file);
const branch = manager.getBranch();
const output = [];
for (const entry of branch) {
  if (entry.type === "compaction" || entry.type === "branch_summary") {
    output.push(`[${entry.id}] ${entry.type}: ${entry.summary}`);
    continue;
  }
  if (entry.type !== "message" || entry.message.role === "system") continue;
  const m = entry.message;
  const blocks = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
  const parts = (blocks || []).flatMap((b) => {
    if (b.type === "text") return [b.text];
    if (b.type === "toolCall") return [`toolCall ${b.name}: ${JSON.stringify(b.arguments)}`];
    return []; // Never emit hidden reasoning, images, or system prompts.
  });
  let text = parts.join("\n");
  if (m.role === "toolResult" && text.length > 3000) text = text.slice(0, 3000) + "\n[tool output truncated; inspect this entry if needed]";
  output.push(`[${entry.id}] ${m.role}${m.toolName ? ` (${m.toolName})` : ""}: ${text}`);
}
const digest = output.join("\n\n");
const limit = 80000;
console.log(JSON.stringify({ source: realpathSync(file), sessionId: header.id, cwd: header.cwd,
  leafId: manager.getLeafId(), branchEntries: branch.length, fixture: !!fixture, truncated: digest.length > limit }));
console.log(digest.length > limit ? "[Earlier branch text omitted; inspect cited source entries as needed]\n" + digest.slice(-limit) : digest);
