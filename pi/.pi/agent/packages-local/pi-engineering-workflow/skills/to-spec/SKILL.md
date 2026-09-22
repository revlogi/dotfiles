---
name: to-spec
description: Convert an already clarified code-change discussion into a durable, independently readable specification. Use when established decisions need to survive a fresh implementation session; it synthesizes rather than starts a new requirements interview.
---

# To Spec

Turn the established conversation into a specification that a fresh agent session can implement.

Read repository instructions, the relevant code and docs, and [the specification format](../../references/spec-format.md). Reconcile claims from the conversation with the current repository. Preserve confirmed user decisions and identify any contradiction.

If a missing decision would materially change scope, behavior, or architecture, ask only for that decision. Otherwise record bounded uncertainty without reopening the interview.

Use the user's destination or the repository's established spec location. If neither exists, write `docs/specs/<descriptive-slug>.md`; create only the required directories. Do not publish to an external issue tracker unless the user explicitly requests it.

After writing, reread the document as if no conversation were available. Correct missing context, unverifiable paths, vague acceptance criteria, and implementation detail that is not required to preserve the design. Report the path and recommend `/to-tickets` when the work spans multiple independently verifiable slices, otherwise `/implement <spec-path>`.
