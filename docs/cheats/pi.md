# Pi Coding Agent

Launch with `o` (or `pi`) in Zsh. Open this sheet with `dot cheats pi` or `Ctrl-f ?` in tmux.

## Input and navigation

| Keys | Action |
| --- | --- |
| `Enter` | Send message |
| `Shift-Enter` / `Ctrl-j` / `Ctrl-n` | Insert newline |
| `Ctrl-g` | Edit current prompt in Neovim (`externalEditor`) |
| `Ctrl-p` | Cycle enabled models (`gpt-6.1-sol`, `gpt-5.6-sol`, `gpt-5.6-terra`, `local-mlx`) |
| `Shift-Tab` | Cycle thinking level (`off` / `minimal` / `low` / `medium` / `high`) |
| `Esc Esc` | Open session tree (`/tree`) to branch or rewind |
| `Esc` | Interrupt current turn / close overlay |
| `@path` | Attach file or fuzzy-complete workspace path |

## Custom commands and extensions

| Command | Action |
| --- | --- |
| `/commit [files or hint]` | Inspect `git status`/`diff`/`log`, stage, commit, and explain changes + message rationale |
| `/changes [show / clear]` | Inspect or clear session file edits tracked by `change-log.ts` (`Δ N files`) |
| `/safety [on / off / status]` | Toggle destructive shell command confirmation (`🛡 guard`) |
| `/notify [smart / always / off / status]` | Configure Kitty/tmux completion notifications (`smart` notifies on turns `>= 15s`) |
| `/btw <question>` | Ask a side question in a popup without polluting main session context |
| `/answer` | Extract questions from the last assistant message into an interactive Q&A |

## Engineering workflow (`pi-engineering-workflow`)

| Command | Action |
| --- | --- |
| `/grill-with-docs [goal]` | Stress-test requirements against codebase and domain docs before coding |
| `/to-spec [output path]` | Distill agreed design decisions into an actionable specification |
| `/to-tickets [spec path]` | Break a spec into self-contained implementation tickets |
| `/implement [ticket]` | Execute a ticket or spec with verification |
| `/code-review [target]` | Review changes independently for spec fidelity and code quality |

## Personal skills

| Skill command | When to use |
| --- | --- |
| `/skill:commit` | Stage, commit, and explain version changes and commit message choices |
| `/skill:process-learning-notes` | Triage flomo notes into linked Obsidian `30-Concepts/` notes, build domain maps (MOCs), or run review/connect rounds |
| `/skill:python-style` | Write or refactor Python with `uv`, `Ruff`, and `basedpyright` basic conventions |
| `/skill:english-anki-Add` | Capture English vocabulary/sentences into Anki with preview and deduplication |

## Maintenance

```sh
dot edit pi                     # Edit pi/.pi/agent/settings.json
stow --no-folding -t ~ pi       # Deploy new skills, prompts, or extensions
dot check pi                    # Run TypeScript typecheck and Bun tests
dot check links                 # Verify Stow symlinks and local state isolation
```
