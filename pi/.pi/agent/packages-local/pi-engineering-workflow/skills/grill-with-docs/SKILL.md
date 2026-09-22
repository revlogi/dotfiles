---
name: grill-with-docs
description: Clarify a proposed code change through a repository-grounded interview, while maintaining stable project terminology and architectural decisions. Use before implementation when requirements, boundaries, terminology, or design decisions need clarification.
---

# Grill With Docs

Reach shared understanding before implementation. Do not write production code or a full spec during this workflow.

## Explore

Read repository instructions, relevant code and tests, and existing `CONTEXT.md`, context maps, and ADRs. Search narrowly enough to make the next question concrete. Report any material mismatch between the request and the repository before interviewing.

## Interview

Ask one decision-bearing question at a time. Prefer a concrete recommendation with its tradeoff when the repository supports one. Follow each answer into consequences and edge cases; do not mechanically walk a questionnaire.

Resolve the branches that materially affect behavior, scope, interfaces, migration, failure handling, compatibility, testing, and rollout. Distinguish confirmed decisions from assumptions. Stop when remaining uncertainty does not change the proposed work, or when the user chooses to defer a named question.

## Maintain docs

Read [domain documentation](../../references/domain-docs.md) before changing domain docs. Update them during the conversation only after a term or decision is settled. Preserve unrelated content and follow existing locations and formats.

Finish with a concise agreed design, deferred questions, documentation changed, and the recommended next command: `/to-spec` for work that should survive a fresh session, otherwise `/implement`.
