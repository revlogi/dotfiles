# Reflect + pi-memory for Pi

## Installed resources

- Maintained `npm:pi-memory` (tested 0.4.2), installed by `pi install npm:pi-memory` under `~/.pi/agent/npm/node_modules/pi-memory/`. No fork or retrieval dependency.
- This local package: `~/.pi/agent/packages-local/pi-reflect/`, symlinked to `~/dotfiles/pi/.pi/agent/packages-local/pi-reflect/`.
- Only Reflect and its four reviewer/synthesis references were taken from the pstack standalone mirror. Existing pi-pstack and other skills are unchanged. No poteto-mode, skill-creator, subagent, tracker, qmd, or database was installed.

Run `/reload` in an already-open Pi session, or start a new session. Invoke:

```text
/skill:reflect
/skill:reflect focus on the debugging and verification work
```

Reflect is explicitly invoked, not automatically triggered. Review proposals, then reply e.g. `Approve memory IDs 1 and 3 only`. Nothing in the reflected transcript itself can authorize changes. Skill approval is separate from memory approval; structural fixes are recommendations until separately approved.

## Memory configuration

`memory-policy.ts` delegates every tool and hook to the **installed upstream** extension, registering it once. The upstream package's direct extension resource is filtered out in `~/.pi/agent/settings.json`; this local package loads it instead. Do not re-enable both resources.

At session start, before upstream's own handler, the policy sets:

- `PI_MEMORY_EXIT_SUMMARY=0`: no automatic LLM exit summaries, including real quit.
- `PI_MEMORY_SUMMARIZE_TRANSITIONS=0`: no transition summaries.
- `PI_MEMORY_SNAPSHOT=stable`: stable per-session prompt snapshot, not per-turn search/injection.
- `PI_MEMORY_QMD_UPDATE=off`, `PI_MEMORY_NO_SEARCH=1`: no background indexing or per-prompt retrieval.

pi-memory's original Markdown filenames and formatting are retained:

```text
~/.pi/agent/memory/projects/<project-name>-<sha256-path-prefix>/
  MEMORY.md
  SCRATCHPAD.md          # only if used
  daily/                # no exit summaries; explicit daily writes still possible
  recovery/             # recoverable deletions
```

Scope is the canonical Git top-level directory, or the canonical cwd outside Git. Subdirectories of one repository share memory; unrelated projects do not. Symlinks resolve to the same scope. A new Git worktree, moved repository, or different non-Git working directory gets a distinct scope. The hash distinguishes identically named projects; `memory_status` shows the authoritative location. There is no automatically injected global store. Global preferences continue to live in your existing AGENTS.md.

An explicit external `PI_MEMORY_DIR` overrides project scoping, principally for tests. Do not set it globally to one shared directory if you want project isolation. The policy does not mutate that variable, so `/reload` cannot accidentally treat a derived directory as a user override.

Upstream exposes no project-scoping configuration. This small shim therefore calls its exported `_setBaseDir` helper before upstream initializes the session. This is a **private upstream testing API**: the shim fails visibly if it disappears. Re-run tests after updates. All actual storage, tools and injection remain upstream code.

## Ordinary memory use

Reflect is optional. In a normal session:

- Save: `Remember this project decision: …` authorizes `memory_write` (`target: long_term`, `mode: append`). Otherwise propose durable writes first.
- Recall/inspect: ask Pi to call `memory_status`, then `memory_read` (`target: long_term`). Files are also plain Markdown and can be inspected locally.
- Correct: approve a focused local Markdown edit, or approve replacing a particular entry via `memory_forget` then `memory_write`. Read first. Avoid whole-file overwrites that might drop other entries.
- Delete: `memory_forget` with `target: long_term` and a **unique** `match`. Matching is case-insensitive substring matching over complete stamped entries; a broad phrase can remove multiple entries.
- Undo deletion: `memory_restore` with `recoveryId` returned by `memory_forget`.
- Permanent erasure: recoverable deletion retains the full removed text in `recovery/<id>.json`. After confirming you no longer need recovery, delete that specific JSON too. Also consider session transcripts/backups containing tool arguments. Recovery is not secure erasure.

Without qmd, `memory_search` is registered but returns installation guidance, **not search results**. Use `memory_read` or a local text search restricted to the active directory. Do not install qmd just because the tool suggests it. Upstream may also show optional-qmd guidance on startup; this is informational, not a failed core setup.

Context is bounded by upstream: long-term memory up to 4K characters, scratchpad up to 2K, today's/yesterday's daily tails up to 3K each, with a 16K total cap. Normal use keeps daily/scratchpad empty and curated MEMORY.md near 4K. Existing session snapshots do not refresh on ordinary writes or external edits; `memory_read` sees current disk state. Start a fresh session to refresh injection. Deletion/restore and compaction are explicit refresh boundaries.

Upstream's compaction handoff remains enabled: it copies open scratchpad items / recent daily context if present. With both empty it writes nothing, as tested. This is not the disabled exit-summary LLM call. Avoid using daily logs as an automatic session archive.

Operational memories are private local runtime data, ignored by the agent `.gitignore`. They are never routed to Obsidian, flomo or Concept Notes. Approval is a skill/instruction boundary, not a new filesystem permission sandbox. Other tools can still write files when explicitly instructed.

## Adaptations from upstream Reflect

- Retained judgment, tooling, divergent lenses, evidence checks, adversarial-transcript warning, synthesis, durability/duplicate checks, existing-skill-first and structural enforcement preference.
- Replaced newest-file guessing with live `PI_SESSION_FILE` / `PI_SESSION_ID` validation and Pi's active-branch SessionManager. The helper omits system messages and hidden reasoning, bounds output and labels truncation; no cross-project scan. In-memory sessions use the visible-context digest fallback.
- Run the three perspectives sequentially on the current model; no Cursor `Task`, pstack model routing, default model slugs, skill-authoring dependency or external services. Same-model perspectives are not independent confirmation.
- Four destinations: memory, skill changes, structural fixes, discard. Skill-used restrictions apply to skill edits, not factual memory.
- Explicit approval for all durable writes and skill edits. Removed automatic backlog filing and package-cache editing/copying. No external writes or extra skills by default.

The session helper is read-only for current v3 transcripts. It uses the installed Pi SDK, not a bundled host copy. For an explicitly supplied safe fixture: `node skills/reflect/scripts/transcript.mjs --file /path/to/session.jsonl`. This marks the input as a fixture, not the active session.

## Maintenance and verification

```bash
cd ~/.pi/agent/packages-local/pi-reflect
npm test
npm run test:live  # opt-in model calls using PI_PROVIDER/PI_MODEL from Pi, or Codex defaults
```

Tests use temporary Markdown stores and remove test memory, including deletion recovery records. Live traces/fixture sessions remain in a printed temporary artifact directory for auditing; they contain synthetic data only. For package updates use `pi update npm:pi-memory`, then rerun the tests and `/reload`. Do not run an unreviewed broad package update just for this integration.

See [VERIFICATION.md](VERIFICATION.md) for the installation's actual test results and limitations, [upstream.json](upstream.json) for source pins/hashes, and [LICENSE](LICENSE) for the retained MIT notice.
