# Verification

Verified on 2026-10-29 with installed Pi CLI 1.3.0, pi-memory npm 0.4.2 and the existing `openai-codex/gpt-6.1-sol` model. The installed documentation/settings mention newer versions in places; validation used the actual installed runtime, not those version claims.

## Successful checks

1. `pi install npm:pi-memory` completed. `pi list` shows the upstream npm package plus the local integration. Published npm code was inspected, including its no-op-for-consumers postinstall script. The Git checkout has a few unreleased changes; installation uses the npm release, not those changes.
2. `node --test tests/integration.test.mjs`: **5/5 passed**, rerun after the final support-script/test-cleanup edits.
   - Actual global resource discovery: no extension errors, skill diagnostics or prompt diagnostics. Exactly one registration for each of `memory_write`, `memory_read`, `memory_forget`, `memory_restore`, `scratchpad`, `memory_search`, `memory_status`. One explicit-only Reflect skill. Existing engineering, pstack, learning and English skills retained.
   - Real upstream tools in two fresh SDK sessions: temporary approved write, subsequent read, forget, restore. Session shutdown did not produce a daily exit summary. Empty daily/scratchpad compaction did not create a handoff log. Temporary memory removed, including recovery data.
   - Canonical repository root/subdirectory share a namespace; unrelated directory differs; a new loader/session returns to the original namespace correctly. Temporary scope directories removed. These are runtime reconstruction checks, not a TUI key-by-key `/reload` test.
   - Transcript helper: validates ID and cwd, fails on missing/wrong live identity, follows the active branch, excludes the abandoned branch and hidden reasoning. Explicit fixture mode works.
   - Reflect local reference links and routing/approval/separation instructions checked.
3. `node tests/live.mjs`: **all four model-backed CLI phases passed**. Test artifacts:
   `/var/folders/j_/44h1_f557l39v_0kpr_q04zm0000gn/T/pi-reflect-live-2OkLWC/`
   - Resumed a safe synthetic session and invoked `/skill:reflect` with mutation tools available. Read all four references and used the live transcript helper. Proposed memory, skill and structural findings; discarded noise, unsupported hypotheses and a fake quoted approval. No memory/skill mutation calls before live approval; memory file absent; maintained/local skill Markdown hashes unchanged.
   - Resumed again with explicit approval for only the memory candidate. Called upstream `memory_write`, read back, and preserved project scope, qualified verification status and rationale. No skill edits.
   - A fresh CLI session recalled the unique generated cache path and lock-namespace rationale from the saved memory.
   - Another fresh CLI session used `memory_forget` to remove the test entry. Test-only memory and recovery payloads were then removed. Synthetic transcripts/traces remain in the temporary artifact directory for inspection, not in operational memory.
4. Active **real installation session** transcript helper verified its own `PI_SESSION_FILE`, session ID `01a1881f-79c3-720b-8a8f-2fc8d2ac1978` and `/Users/liuguangxi/dotfiles/pi` cwd, returned active-branch metadata, and labeled bounded/truncated output. The temporary real-session digest was removed after inspection.
5. Existing pi-pstack suite with `PSTACK_GLOBAL_TEST=1`: **5/5 passed**, including original four-skill discovery and global collision check. No existing skill contents changed.
6. Separate fresh read-only Pi spec-fidelity and code-quality review processes examined a fixed local snapshot. Both reported **no actionable findings**. This is a non-Git directory; original source hashes and observed initial configuration were the recoverable baseline, not a Git diff.
7. No qmd installed. No vector/database/retrieval service, subagent extension, automatic reflection hook, knowledge-base store, or learning-state integration added. No operational test memory remained in `~/.pi/agent/memory/` after cleanup.

## Boundaries and remaining limitations

- The current already-running agent needs `/reload` or a fresh start to obtain newly registered tools and Reflect. Actual registration/function was verified in fresh runtimes; tools cannot be injected into an already-running model turn by editing settings alone.
- `memory_search` is registered but **not functional search without optional qmd**. Read/file search is the supported lightweight recall path. No semantic retrieval was tested or claimed.
- Project scoping uses an exported **private** upstream `_setBaseDir` helper; updates require revalidation. Worktrees/moves and different non-Git working directories intentionally have separate scopes. No global cross-project memory overlay is injected.
- Memory approval is an instruction/skill contract, not a new security/permission sandbox. Tests demonstrate compliant behavior on this fixture, not proof against all models/prompts.
- No substantive real skill improvement was applied or approved in this installation. The fixture verified proposed diff + no-change behavior; skill-specific future changes need their own approval and tests.
- Upstream fixed prompt limits/truncation remain. Keep curated memory small. Stable injection does not include ordinary new writes until the next snapshot boundary; explicit reads do.
- Upstream compaction handoffs remain for explicit daily/scratchpad use. Disabled exit summaries do not disable those handoffs. No high-volume daily-log or full upstream qmd/evaluation suite was run.
- Markdown read/modify/write storage has upstream concurrency limitations: avoid simultaneous writers to one scope. Multiple concurrent SDK sessions in one process are not a supported isolation target because upstream uses module-level state; normal separate Pi processes have separate runtimes.
- npm audit reports one high-severity vulnerable package (`undici@8.10.0`, multiple advisories) in the **existing pi-web-access** dependency tree. pi-memory adds no runtime dependency. No broad audit fix or unrelated package update was performed.
