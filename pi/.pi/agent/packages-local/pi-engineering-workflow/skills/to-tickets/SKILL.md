---
name: to-tickets
description: Split a specification or settled plan into dependency-aware, self-contained implementation tickets sized for fresh sessions. Use when a change needs several independently verifiable implementation slices.
---

# To Tickets

Read the source spec or settled plan, repository instructions, relevant module boundaries, and [the ticket format](../../references/ticket-format.md).

Decompose by observable vertical outcomes. Keep tightly coupled changes together when separating them would require speculative interfaces or leave the repository in a broken intermediate state. Each ticket must fit one focused session and include enough context that its implementer need not recover the original conversation.

Build an acyclic dependency graph. Mark initially executable tickets `ready` and dependent tickets `blocked`. Ensure the set covers every acceptance criterion exactly enough to expose omissions without duplicating ownership.

Prefer the repository's established issue storage. Otherwise create local Markdown tickets under `docs/tickets/<spec-slug>/`. Do not create or update GitHub, Linear, or another external tracker unless the user explicitly asks.

After writing, audit the set for horizontal layers, missing integration behavior, circular dependencies, oversized tickets, and acceptance criteria with no owner. Report the created tickets in executable order and identify the first `ready` ticket for `/implement`.
