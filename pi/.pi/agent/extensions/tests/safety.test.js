import { describe, expect, test } from "bun:test";

import { classifyDangerousCommand } from "../bash-guard.ts";
import { buildEscapeSequence, formatTerminalTitle, shouldNotifyTurn } from "../terminal-rice.ts";

describe("bash guard", () => {
  test.each([
    ["sudo brew update", "privileged command"],
    ["rm -rf build", "file deletion"],
    ["git reset --hard HEAD~1", "destructive Git operation"],
    ["find . -name '*.tmp' -delete", "recursive find deletion"],
    ["dd if=image.iso of=/dev/disk4", "raw device or file overwrite"],
  ])("classifies %s", (command, reason) => {
    expect(classifyDangerousCommand(command)).toBe(reason);
  });

  test.each(["git status", "npm test", "rmatrix", "printf 'rm -rf /'"])("allows %s", (command) => {
    expect(classifyDangerousCommand(command)).toBeUndefined();
  });
});

describe("terminal rice", () => {
  test("formats idle and spinning terminal titles", () => {
    expect(formatTerminalTitle("/Users/me/dotfiles")).toBe("π · dotfiles");
    expect(formatTerminalTitle("/Users/me/dotfiles", "refactor", "⠋")).toBe("⠋ π · refactor · dotfiles");
  });

  test("evaluates smart, always, and off notification thresholds", () => {
    expect(shouldNotifyTurn("smart", 4000)).toBe(false);
    expect(shouldNotifyTurn("smart", 15000)).toBe(true);
    expect(shouldNotifyTurn("always", 500)).toBe(true);
    expect(shouldNotifyTurn("off", 60000)).toBe(false);
  });

  test("builds Kitty OSC 99 and wraps tmux passthrough when in tmux", () => {
    const kittySeq = buildEscapeSequence("π", "Done", { KITTY_WINDOW_ID: "1" });
    expect(kittySeq).toContain("\x1b]99;i=1:d=0;π\x1b\\");

    const tmuxSeq = buildEscapeSequence("π", "Done", { KITTY_WINDOW_ID: "1", TMUX: "/tmp/tmux-501/default,1,0" });
    expect(tmuxSeq.startsWith("\x1bPtmux;\x1b\x1b]99;")).toBe(true);
    expect(tmuxSeq.endsWith("\x1b\\")).toBe(true);
  });
});
