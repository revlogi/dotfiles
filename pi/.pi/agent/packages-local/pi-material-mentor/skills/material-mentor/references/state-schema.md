# Learning state contract

Run Pi from one course root. Keep these files visible to Obsidian and portable to other tools.

```text
course-root/
├── COURSE.md
├── PROGRESS.md
├── CONCEPTS.md
├── QUESTIONS.md
├── material/
├── concepts/
├── sessions/
├── lessons/                 # authored lesson manifests
└── learning/
    ├── lessons/             # immutable lesson revisions + source hashes
    ├── events/              # immutable learner submissions and hint requests
    └── feedback/            # one assessment per answer/position event
```

## Ownership

| Path | Primary owner | Agent behavior |
|---|---|---|
| `material/` | Human / author | Read-only unless explicitly asked to import or edit material. |
| `COURSE.md` | Shared | Preserve source and goal; update confirmed position and next target. |
| `PROGRESS.md` | Agent | Record mastery only with dated, observable evidence. |
| `QUESTIONS.md` | Shared | Append unresolved questions and parked tangents; never silently delete. |
| `CONCEPTS.md` | Shared | Maintain a sparse map of links, not prose notes. |
| `concepts/` | Learner | Create or rewrite a note only on explicit request. |
| `sessions/` | Agent | Save compact learning state, never a transcript. |
| `lessons/` | Agent | Small source-grounded teaching companions, not primary material. |
| `learning/` | Runtime | Preserve immutable evidence and feedback; do not rewrite events. |

## Automatic evidence reconciliation

Browser submissions are durable evidence; COURSE/PROGRESS/session notes are interpretations. A page submission starts a Pi assessment turn automatically. At the start of any later course operation, inspect unassessed answer/position events (no matching `learning/feedback/<id>.json`), in timestamp order, and related hint events. Read their exact lesson revision and source location. Reconcile them before selecting new work. Malformed or Syncthing conflict files require explicit repair; never silently treat them as assessed.

If a source has changed since the recorded hash, distinguish the stored excerpt/lesson from the current source. Do not silently assess an old answer against changed assumptions or claim that the original version was verified from the current file.

After assessing an event, update supported Markdown state and append a compact session entry linked to the event ID, then call `mentor_feedback` last. On retry, look for that ID before appending again. Merge concept evidence; do not duplicate it. The feedback file marks a completed assessment, not automatic mastery. Preserve newer human corrections and resolve contradictory evidence explicitly. Do not start another Pi writer on the same course before synchronization completes.

Keep three things distinct:

- **Observed response:** the actual explanation/prediction/artifact supplied, with source, date, event link, and hint context. A correct response with the answer visible is supported practice, not independent retrieval.
- **Self-report:** an explicitly stated reading position, prior experience or work completed outside Pi. Label it as self-report; it may guide the next check but does not establish `solid`.
- **Teaching decision:** one concrete misconception or verified strength that changes the next task, and one next action. Keep this in the existing PROGRESS/session/COURSE files rather than introducing another parallel summary database.

Page opens, reading time, scrolling and unsubmitted typing are not recorded. The agent cannot see work in other applications unless the learner submits an answer or points to an artifact it can inspect. No recorded hint is not proof that no help was used. Hint events alone need no mastery update or feedback file.

If inference is interrupted, raw evidence remains and the next course turn resumes assessment. Do not claim that memory summaries were updated until the writes succeed. `/checkpoint` is optional, not required for browser evidence capture. No whole-session transcript collection or background surveillance.

## Mastery vocabulary

- `not-started`: no evidence yet.
- `developing`: recognized or explained with hints; evidence is partial.
- `solid`: independently explained and successfully predicted or applied.
- `review`: previously solid but due for retrieval, or contradicted by recent evidence.

Avoid percentages. Record exactly what the learner did and what remains uncertain.

Multiple-choice checks provide recognition evidence. Even a fully correct `/check` remains
`developing` unless the same concept is supported by independent explanation or authentic
application. Independently solved discussion/homework problems and proofs, or verified design,
implementation, testing, and transfer work, may support `solid` when the evidence is specific.

## When to write

Write state at a natural checkpoint after a completed check or review, a learner-confirmed position change, an intentionally parked exploration branch, or an explicitly ended session. Keep it compact:

- Update `COURSE.md` only for a confirmed current position or next target.
- Update `PROGRESS.md` with status, dated evidence, and source location.
- Append unresolved or intentionally deferred branches to `QUESTIONS.md`.
- Update `CONCEPTS.md` only with small links between encountered concepts.
- Create or update `sessions/YYYY-MM-DD.md` with material read, demonstrated understanding, misconceptions corrected, weak points, and the next action.

Use only the learner's demonstrated understanding as mastery evidence. Label useful self-reports as such in COURSE/session notes; keep uncertain mastery unconfirmed. Preserve learner-authored text, and leave `PROGRESS.md` unchanged when there is no observable mastery evidence. Never write a polished replacement textbook or create a concept note on the learner's behalf.

## Evidence row

Use the table in `PROGRESS.md`:

```markdown
| Concept | Status | Evidence | Source | Last checked |
|---|---|---|---|---|
| Ownership of stored values | developing | Distinguished list-node ownership; still missed caller-owned values in a lifetime scenario. | `material/ch05.md` §5.4 | 2026-08-18 |
```

Merge evidence for the same concept instead of creating near-duplicate rows. Keep evidence to one or two concrete sentences.

## Session note

Use `sessions/YYYY-MM-DD.md`. If multiple sessions occur on one date, append a new `## Session HH:MM` section.

```markdown
# 2026-08-18

## Material

- `material/ch05.md` §5.1–§5.4

## Demonstrated

- Explained why the representation is opaque without hints.

## Fixed

- Previously assumed `List_push` copied the stored value.

## Still developing

- Lifetime of caller-owned values.

## Parked

- Compare intrusive and non-intrusive lists.

## Next

- Read §5.5 and trace the destroy callback contract.
```

Omit empty sections. Preserve any learner-written text already in the file.
