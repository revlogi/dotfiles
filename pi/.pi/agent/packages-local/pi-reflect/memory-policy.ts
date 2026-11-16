import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { basename, join } from "node:path";
import { getAgentDir, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Load the installed upstream, not a fork or a second copy. Its direct package
// resource is disabled in settings so each tool/event is registered exactly once.
export default async function (pi: ExtensionAPI) {
  const upstream = await import(join(getAgentDir(), "npm/node_modules/pi-memory/index.ts"));
  if (typeof upstream._setBaseDir !== "function") {
    throw new Error("pi-memory no longer exports _setBaseDir; review memory-policy.ts before upgrading.");
  }
  const override = process.env.PI_MEMORY_DIR;
  pi.on("session_start", async (_event, ctx) => {
    let scope = realpathSync(ctx.cwd);
    try {
      scope = realpathSync(execFileSync("git", ["-C", scope, "rev-parse", "--show-toplevel"], {
        encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 2000,
      }).trim());
    } catch { /* Without Git, the exact working directory is the scope. */ }
    const key = `${basename(scope).replace(/[^a-zA-Z0-9._-]/g, "_")}-${createHash("sha256").update(scope).digest("hex").slice(0, 16)}`;
    const memoryDir = override || join(getAgentDir(), "memory/projects", key);
    process.env.PI_MEMORY_EXIT_SUMMARY = "0";
    process.env.PI_MEMORY_SUMMARIZE_TRANSITIONS = "0";
    process.env.PI_MEMORY_SNAPSHOT = "stable";
    process.env.PI_MEMORY_QMD_UPDATE = "off";
    process.env.PI_MEMORY_NO_SEARCH = "1";
    // Upstream resolves paths at module load. Reset them before its session_start
    // handler so /new, /resume, /reload and SDK cwd changes select the right scope.
    upstream._setBaseDir(memoryDir);
  });
  upstream.default(pi);
}
