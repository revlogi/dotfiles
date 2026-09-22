---
name: code-review
description: Review a selected change along separate spec-fidelity and code-quality axes using independent read-only contexts when available. Use for a requested review or when the implement skill hands off completed work.
---

# Code Review

Review the change from a fixed, reproducible snapshot. Do not modify code during the review pass.

## Pin the review input

Resolve the baseline supplied by the user. For a Git repository, use the requested ref or the merge-base with the repository's main branch, and include staged, unstaged, and untracked work relevant to the task. Confirm the ref and inspect the resulting change before continuing. For a non-Git directory, use the task's recoverable before/after snapshot; if none exists, state that the review can inspect current files but cannot reliably isolate the change.

Locate the requirements source in this order: explicit path, source ticket, linked spec, relevant local spec. If none exists, skip the spec axis and say why. Locate repository instructions and documented coding standards.

Read [the review standards](../../references/review-standards.md). Prepare two bounded review briefs containing the pinned change and only the sources each reviewer needs:

1. **Spec reviewer:** find missing or partial requirements, incorrect behavior, and unrequested scope. Cite the requirement and changed line for each finding.
2. **Standards reviewer:** find violations of repository rules and actionable smell heuristics. Cite the rule or name the heuristic and changed line.

Run the briefs in independent read-only contexts when the environment provides sub-agents. Otherwise use two fresh, no-session Pi processes with only `read,grep,find,ls` enabled. Place the fixed diff and briefs in a safely created temporary directory and pass those files to each process; do not expose credentials or machine-local state. If independent contexts cannot run, perform the two passes sequentially and disclose that limitation.

Present `Spec` and `Standards` findings separately without merging or reranking them. Every finding must meet the evidence format in the review standards. Verify reported paths and lines against the pinned change, discard unsupported findings, and end with finding counts plus any coverage or verification limitation.
