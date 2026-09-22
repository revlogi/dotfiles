# Domain documentation

Use durable domain documentation only for knowledge that will help later work.

## `CONTEXT.md`

Maintain a compact glossary of project-specific terms. Each entry should define one term in the language used by the code and explain distinctions that prevent ambiguity. Preserve existing structure and terminology unless the discussion explicitly replaces it.

Do not record the current task, temporary implementation notes, generic programming terms, or guesses. If a root `CONTEXT.md` would become too broad, use the repository's existing context map or the nearest module-level context document.

## Architecture decision records

Write an ADR only for a decision that is costly to reverse, constrains future work, or is otherwise surprising without its rationale. Follow the repository's existing ADR location and numbering. If none exists, use `docs/adr/NNNN-short-title.md` with:

- status and date;
- context and forces;
- decision;
- consequences, including accepted tradeoffs.

Do not create an ADR for ordinary implementation details. Never overwrite an accepted ADR to hide history; add a superseding record when the decision changes.

