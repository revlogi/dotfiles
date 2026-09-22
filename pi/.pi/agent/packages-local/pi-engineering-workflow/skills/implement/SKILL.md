---
name: implement
description: Implement a selected code-change ticket, specification, or bounded task with repository checks and a review handoff. Use when durable requirements already identify the work to build.
---

# Implement

Implement the selected work completely within its stated scope.

Read repository instructions, the source ticket or spec, linked domain docs, relevant code, and tests. If the target is a ticket, verify that each `Blocked by` dependency is done before editing, then mark it `in-progress`. If several ready tickets exist and none is selected, choose only when the user's intent makes the choice unambiguous.

Establish the smallest useful feedback loop at a stable behavior seam. For changed behavior or bug fixes, observe a meaningful failing test or check before the fix when practical. Do not add tests that merely mirror implementation details. Implement in small coherent increments and run focused checks while working.

Preserve unrelated changes. Follow the repository's validation instructions and run the full required checks once the implementation is complete. Do not claim success for a command that did not finish successfully. Do not commit, push, publish, deploy, or close an external issue unless the user explicitly asks.

Update a local ticket to `done` only after its acceptance criteria and required checks pass. Record completion notes, changed behavior, and exact verification results. If verification remains blocked, leave the ticket `in-progress` and explain the blocker.

Finish by reading and following [the code-review skill](../code-review/SKILL.md) against the change, using the ticket or spec as the requirements source. Fix confirmed findings within scope, rerun affected checks, and report the implementation, verification, and remaining risks.
