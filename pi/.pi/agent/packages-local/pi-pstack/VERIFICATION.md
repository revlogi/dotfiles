# Verification

Verified on 2026-10-29. No user repository changes were committed or pushed.

## Discovery and compatibility

- All four skills passed the Agent Skills `quick_validate.py` validator.
- Five package tests passed, including real Pi package discovery and alias argument expansion, relative Markdown links, upstream attribution/reference integrity, and global collision checks from an unrelated directory.
- Discovery tests passed with both the global Pi 1.3.0 SDK and the existing agent-local 0.84.2 SDK. Live tests used `/opt/homebrew/bin/pi` (1.3.0) explicitly; npm's PATH can otherwise select the agent-local executable.
- Global discovery found exactly one skill and one short alias for each name, with no conflicting extension commands. Existing personal skills remained present. No extension-load errors were reported.
- `pi list` resolved the new local package through its global symlink.
- Final `dot check`: **26 passed, 0 failed, 0 skipped**, including existing Pi typechecks/tests and a Stow deployment dry run. The new package's dependency-free tests are run separately because `dot check` only invokes packages with a `check` script and a TypeScript toolchain.

## Model-backed behavior

Used the actual global configuration and `openai-codex/gpt-6.1-sol` at low reasoning. Each scenario ran in a new no-session Pi process, except the deliberate three-prompt interaction test. Temporary C++ fixtures provided known mechanics and two commits with explicit rationale. No MCP or project configuration was loaded; the real global extensions and selected skills were loaded. The allowed model tools were read, bash, grep, find, and ls.

| Scenario | Verified result |
|---|---|
| Unslop, verbose prose | Removed filler while preserving a 30-second stale-data caveat and citation |
| Unslop, technical prose | Preserved vector terminology, `O(n)`, `reserve(n)`, and an exact quoted statement that the improvement was unmeasured |
| How, narrow function | Explained prefix selection and empty/bounded behavior with source citations |
| How, natural-language subsystem request | Automatically loaded How and traced ownership, success, failure, and retry consequences |
| Why, documented change | Used Git and README evidence to reject the user's performance hypothesis; identified the provider compatibility requirement |
| Why, undocumented constant | Reported the rationale for capacity 17 as unknown instead of inventing a performance or sizing story |
| Why, no Git | Used direct local documentation and clearly bounded the missing historical/external evidence |
| Teach, composed explanation | Actually loaded How, Why, and Unslop; combined a concrete A/B/C trace with rationale and failure guarantees |
| Teach, detailed request | Delivered the requested explanation immediately without a quiz, curriculum, mastery record, or knowledge-base write; retained the unknown rationale |
| How → Why → Teach, same session | Preserved mechanics and rationale and reused prior investigation; the Teach step loaded its own instructions and Unslop without rereading the target or rerunning Git |

All ten scenarios were verified. Initial full run: **10/10 passed**. Manual review then found estimated line numbers in one detailed explanation; How and Why now require verification against numbered search output. The live harness also checks that numbered output was consulted.

Strengthened full run: **9/10 automated checks passed**. The remaining no-Git case actually completed successfully after two recovered provider-overload errors, but the harness incorrectly rejected any intermediate error. The harness was fixed to require a successful final state and reject unrecovered retries/aborts. A focused no-Git rerun then **passed**. The strengthened full suite was not rerun a third time after this harness-only correction.

Manual review of the strengthened responses confirmed that the previously incorrect `ack` location was now cited as `queue.hpp:18`. Responses distinguished documented intent from code-derived behavior and did not claim that a local retry queue guarantees exactly-once remote delivery. The fixtures' contents and Git status remained unchanged in every completed run.

Artifacts (temporary, machine-local):

- Initial full run: `/var/folders/j_/44h1_f557l39v_0kpr_q04zm0000gn/T/pi-pstack-live-uX4p7b`
- Strengthened full run: `/var/folders/j_/44h1_f557l39v_0kpr_q04zm0000gn/T/pi-pstack-live-mulYl9`
- Focused rerun: `/var/folders/j_/44h1_f557l39v_0kpr_q04zm0000gn/T/pi-pstack-live-dAH5y1`

Each directory contains prompts in JSON events, final responses, stderr, and a `results.json`. These artifacts can be removed by normal temporary-file cleanup. `tests/live.mjs` regenerates the fixtures and tests.

## Review and fixes

Two independent, no-session, read-only Pi reviewers inspected a pinned package snapshot for requirements fidelity and standards. The spec reviewer found no actionable issues. The standards reviewer found one low-severity documentation issue: README referred to a results document not yet present. This file resolves that finding. Subsequent numbered-citation guidance and harness corrections were reviewed locally and checked as described above.

Other test-harness fixes made during verification: close child stdin to prevent CLI startup waiting for input, and locate the installed SDK without depending on npm's overridden global prefix. No production extension or model settings were changed to make the tests pass.

## Limits

- These tests exercise one model on small synthetic C++ examples, not every language, codebase, provider, or possible prompt. Structural and semantic spot checks do not prove that every future citation will be correct.
- Private PRs, team chat, issue trackers, observability, and warehouse integrations were not live-tested because no such sources were needed or connected for these cases. Their upstream playbooks remain optional reference material.
- File-writing behavior for an explicitly requested Unslop file edit was not exercised; the tested investigations and rewrites were read-only. Skills are instructions, not a sandbox; bash remains capable of writes, and existing guards still apply.
- Existing unmatched-model startup warnings were observed and left unchanged. Tests explicitly selected the authenticated Codex provider/model; this integration does not fix unrelated model configuration.
- This is a versioned, locally adapted upstream snapshot. Updates require the deliberate comparison described in `NOTICE.md`, not automatic replacement by `pi update`.
