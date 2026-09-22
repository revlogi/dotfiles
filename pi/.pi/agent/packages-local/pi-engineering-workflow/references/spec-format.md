# Specification format

A spec must stand alone when read in a fresh session. Prefer the repository's established format. Otherwise include the sections that carry information for this change:

1. **Problem** — observable deficiency or opportunity and who it affects.
2. **Outcome** — behavior that will be true when complete.
3. **Non-goals** — nearby work deliberately outside scope.
4. **Current behavior** — relevant code paths and constraints found in the repository.
5. **Proposed behavior** — user-visible flows, module boundaries, data or API changes, and failure behavior.
6. **Acceptance criteria** — observable, testable statements.
7. **Verification** — tests, type checks, builds, manual checks, or migration validation.
8. **Open questions** — unresolved decisions that block or materially alter implementation.

Use paths and symbol names verified in the repository. State uncertainty instead of inventing facts. Link any relevant `CONTEXT.md` entries and ADRs. Avoid prescribing line-by-line implementation when the interface and behavior provide enough direction.

