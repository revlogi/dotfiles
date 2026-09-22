# Ticket format

Tickets are vertical slices sized for one fresh agent session. Each should produce observable progress rather than one architectural layer with no usable behavior.

Prefer the repository's issue system when the user identifies one. Otherwise write local Markdown under `docs/tickets/<spec-slug>/`, or under an established local issue directory. Use stable filenames such as `001-short-title.md`.

Each ticket contains:

- **Status:** `ready`, `blocked`, `in-progress`, or `done`.
- **Blocked by:** ticket identifiers, or `none`.
- **Spec:** path or URL to the source specification.
- **Outcome:** one independently meaningful result.
- **Context:** only the facts a fresh session needs, with paths to authoritative docs.
- **Scope:** included and excluded behavior.
- **Acceptance criteria:** observable completion conditions.
- **Verification:** exact known commands plus any necessary manual behavior checks.
- **Completion notes:** initially empty; later record material implementation choices and verification evidence.

Dependencies form an acyclic graph. A ticket is `ready` only when every dependency is `done`. Avoid placeholder integration tickets by making early slices cross real boundaries and exercise feedback loops.

