# Learning records

Store decision-grade teaching insights in sequential `learning-records/NNNN-slug.md` files.

```markdown
# Short title of what was established

One to three sentences: what the learner demonstrated or explicitly reported, and why it changes future lessons.

**Evidence:** `evidence/events/<uuid>.json`, lesson and source location when useful.
```

Create a record when the learner demonstrates non-trivial understanding, states relevant prior knowledge with its depth, corrects a misconception, or changes the mission. Coverage, page opens, activity logs, and definitions already in a glossary do not qualify.

Evidence can establish different things:

- A correct response after hints or reveal shows supported practice.
- An unaided explanation plus prediction or application may establish independent understanding, but absence of a recorded hint alone is not proof that no outside help was used.
- Reading position and prior experience are self-reports. Label them as such.

When later evidence contradicts an earlier record, create a new record and mark the old one `Status: superseded by LR-NNNN`. Do not erase the history. Keep raw browser events immutable and separate from these interpretations.
