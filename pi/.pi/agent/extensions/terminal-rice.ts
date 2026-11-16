import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import path from "node:path";

const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const DEFAULT_MIN_NOTIFY_MS = 15_000;

export type NotifyMode = "smart" | "always" | "off";

export function formatTerminalTitle(cwd: string, sessionName?: string, spinnerFrame?: string): string {
  const folder = path.basename(cwd) || cwd;
  const base = sessionName ? `π · ${sessionName} · ${folder}` : `π · ${folder}`;
  return spinnerFrame ? `${spinnerFrame} ${base}` : base;
}

export function buildEscapeSequence(
  title: string,
  body: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const cleanTitle = title.replace(/[\x00-\x1f\x7f-\x9f;]/g, " ").trim() || "π";
  const cleanBody = body.replace(/[\x00-\x1f\x7f-\x9f;]/g, " ").trim();
  const isKitty = Boolean(env.KITTY_WINDOW_ID || env.TERM === "xterm-kitty");

  const raw = isKitty
    ? `\x1b]99;i=1:d=0;${cleanTitle}\x1b\\\x1b]99;i=1:p=body;${cleanBody}\x1b\\`
    : `\x1b]777;notify;${cleanTitle};${cleanBody}\x07`;

  if (env.TMUX) {
    return `\x1bPtmux;${raw.replace(/\x1b/g, "\x1b\x1b")}\x1b\\`;
  }
  return raw;
}

export function shouldNotifyTurn(mode: NotifyMode, elapsedMs: number, thresholdMs = DEFAULT_MIN_NOTIFY_MS): boolean {
  if (mode === "off") return false;
  if (mode === "always") return true;
  return elapsedMs >= thresholdMs;
}

export default function terminalRice(pi: ExtensionAPI) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let frameIndex = 0;
  let turnStartedAt: number | null = null;
  let notifyMode: NotifyMode = "smart";

  function stopSpinner(ctx: ExtensionContext): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    frameIndex = 0;
    if (ctx.hasUI) {
      ctx.ui.setTitle(formatTerminalTitle(ctx.cwd, pi.getSessionName()));
    }
  }

  function startSpinner(ctx: ExtensionContext): void {
    stopSpinner(ctx);
    if (!ctx.hasUI) return;

    timer = setInterval(() => {
      const frame = BRAILLE_FRAMES[frameIndex % BRAILLE_FRAMES.length];
      ctx.ui.setTitle(formatTerminalTitle(ctx.cwd, pi.getSessionName(), frame));
      frameIndex += 1;
    }, 80);
  }

  pi.registerCommand("notify", {
    description: "Configure completion notifications: smart (>=15s), always, off, or status",
    getArgumentCompletions(prefix) {
      const actions = ["smart", "always", "off", "status"];
      const matches = actions
        .filter((action) => action.startsWith(prefix.trim().toLowerCase()))
        .map((action) => ({ value: action, label: action }));
      return matches.length > 0 ? matches : null;
    },
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase() || "status";
      if (action === "smart" || action === "on") notifyMode = "smart";
      else if (action === "always") notifyMode = "always";
      else if (action === "off") notifyMode = "off";
      else if (action !== "status") {
        ctx.ui.notify("Usage: /notify [smart|always|off|status]", "warning");
        return;
      }

      const label =
        notifyMode === "smart"
          ? "smart (turns >= 15s)"
          : notifyMode === "always"
            ? "always (every turn)"
            : "off";
      ctx.ui.notify(`Terminal notifications: ${label}`, "info");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    stopSpinner(ctx);
  });

  pi.on("agent_start", async (_event, ctx) => {
    turnStartedAt = Date.now();
    startSpinner(ctx);
  });

  pi.on("agent_end", async (_event, ctx) => {
    const elapsedMs = turnStartedAt !== null ? Date.now() - turnStartedAt : 0;
    turnStartedAt = null;
    stopSpinner(ctx);

    if (ctx.hasUI && shouldNotifyTurn(notifyMode, elapsedMs)) {
      const folder = path.basename(ctx.cwd) || "workspace";
      const secs = Math.round(elapsedMs / 1000);
      process.stdout.write(buildEscapeSequence("π", `Finished in ${folder} (${secs}s)`));
    }
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    turnStartedAt = null;
    stopSpinner(ctx);
  });
}
