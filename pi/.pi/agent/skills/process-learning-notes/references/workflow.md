# Workflow: Triage, Linking, Questions, Review, and Maps

Use the English labels below for new records; recognize their legacy Chinese equivalents listed in `SKILL.md` when reading or updating existing records. Preserve existing note headings and verbatim learner evidence.

## 1. TRIAGE

### 1.1 Split Items and Deduplicate

When Sources come from `00-Inbox/flomo/`, Flomo Sync creates tag-based subdirectories and may duplicate a record with multiple tags. Deduplicate by frontmatter `slug` first; if content differs, retain both versions and flag the differences.

Treat a line or phrase as one item; split a line containing independent knowledge points. Record `S<n> L<line-number>` and a verbatim excerpt, preserving original typos. Number Sources first: `S1 = filename`. Include grouping headings without colons (e.g., `cuda programming`, `leetcode`) in the line range of the first item below them, so every line is accounted for.

### 1.2 Scan for Errors and Ambiguity

Check each item and record findings in the disposition table's ⚠ column:

| Type | Example | Action |
|---|---|---|
| Problem number/name mismatches description | `230 find elements visible from the right` (right-side view is 199; 230 is kth smallest in a BST) | Correct directly with evidence when confident; otherwise ask which problem was intended |
| Misused terminology | `rank 1 -> vector cross product` (a rank-$1$ matrix is a column vector times a row vector, $uv^\top$) | Suggest the likely meaning; ask for clarification only if it changes the body |
| Typo | `124 find minimum path sum … max with 0` (should be maximum) | Correct directly |
| Necessary but insufficient condition | `verify minimal polynomial -> substitute A` ($p(A)=0$ is only necessary) | Do not label it an error; add the missing condition in My Understanding |

Document corrections as “original record → correction → evidence.” If the original may simply be shorthand, write “interpreted as X” rather than marking it wrong.

### 1.3 Group into Candidate Concepts

Follow [note-guide §2](note-guide.md#2-concept-granularity): merge items about the same mechanism even across files (e.g., 141 + 142 → Floyd cycle detection). Use problems as examples in pattern notes rather than separate notes. Adjacent lines are not necessarily related.

Verify publicly available context (assignment specifications, problem numbers, API semantics) directly and cite it instead of asking the user.

### 1.4 Find Existing Notes

Prepare 2–4 search terms per candidate (Chinese/English names and common abbreviations), using only these targeted searches:

```bash
ls "<Vault>/30-Concepts" | rg -i "<term1>|<term2>"
rg -il --max-count 1 "^aliases:.*(<term1>|<term2>)" "<Vault>/30-Concepts"
```

For multiline `aliases` lists, use `rg -il -A5 "^aliases:" … | …` or inspect matching file headers. If a note matches, mark “Update [[existing note]]”; otherwise mark “New”.

### 1.5 Disposition Table

| Disposition | Meaning |
|---|---|
| New | Create a new Concept Note in this batch |
| Update [[X]] | Add examples, pitfalls, understanding, or sources to existing note X |
| Merge [[Y]] | Include as an example, pitfall, or substep of another candidate note in this batch |
| Deferred | Valuable but insufficient material (name only, no content), or an isolated lookup fact; specify what is missing |
| Discard | Progress updates, scheduling, or other content without knowledge |

Format:

```markdown
| Item | Source | ⚠ | Disposition | Target | Reason |
|---|---|---|---|---|---|
| 141 slow/fast pointers; 142 reset one to head, walk at equal speed | S1 L32; S4 L26 | | New | [[Floyd Cycle Detection]] | Same mechanism; 142 extends 141 |
```

Below the table, list this round's candidate concepts for user selection.

### 1.6 User Selection and Resumption

Call `ask_user` with `question: "Which concepts should I expand this round? (Space selects multiple.)"`, `allowMultiple: true`, and these `options`:

1. **Always put “Expand all” first**, with a description explaining that it expands all New / Update candidates in this batch with one selection.
2. One option per New / Update candidate, describing its source-item count and a brief reason.

Explain deferred items in `context`. Mark unselected candidates “Deferred (not selected this round)” in `_triage-YYYY-MM-DD.md`.

**Resume unexpanded items**: when the user asks to continue the remaining items or expand particular concepts, read the corresponding `_triage-*.md` in `00-Inbox/concept-drafts/`. Change expanded candidates from Deferred (not selected this round) to New or Update, preserving the record's existing label language. Do not re-triage the entire Source.

## 2. DRAFT

See [note-guide.md](note-guide.md). Finish all drafts before asking questions so each question can include relevant draft excerpts.

## 3. LINK

A note that links to nothing is hard to find again and adds nothing to the others. Linking is a required step, done after drafting (so link sentences can reference the finished Core Idea) and before questions (so a question can target a relationship).

### 3.1 Find Candidates

For each drafted note, collect candidates from:

1. **This batch**: other drafted notes and Merge targets.
2. **Same domain**: the domain's `MOC — <Domain>.md` entries, or `rg -l "^domain: <domain>" "<Vault>/30-Concepts"`.
3. **Key terms**: 2–4 terms from the draft's Core Idea and Mechanism (Chinese/English names, the operation or invariant involved), searched across Concepts:
   ```bash
   rg -il "<term1>|<term2>" "<Vault>/30-Concepts" --glob '!MOC — *'
   ```
4. **Relations that commonly exist**: what the reader must know first; what this is a special case or generalization of; what it is most easily confused with (from the Core Idea confusion test); where it is applied.

Read only candidates' frontmatter, Core Idea, and Connections — not entire notes — unless deciding the relation requires more.

### 3.2 Choose Typed Links

Use the relation vocabulary in [note-guide §4.1](note-guide.md#41-connections-typed-links). Keep a link only if you can state the specific relationship in one sentence that would teach the reader something. Aim for at least two per new note; one strong link beats three vague ones. If no existing note fits a clearly needed relation (e.g., an unwritten prerequisite), add it as a red link only when the concept is clearly worth creating, and list it under the map's Open Threads.

### 3.3 Reverse Links

For every new link `A —relation→ B` where B already exists, prepare the paired entry in B's Connections (relation pairs in note-guide §4.1). Present all reverse links as minimal diffs with the other existing-note diffs in FINALIZE; apply only after confirmation. Do not rewrite B's other content. Links between two notes in the same batch are written in both drafts directly.

### 3.4 Map Placement

For each new or substantially updated note, choose its domain map:

- **Map exists**: propose a one-line entry in the right section, in learning order (see [note-guide §9](note-guide.md#9-maps-of-content-mocs)).
- **No map, and the domain will have ≥ 3 concept notes after this batch**: draft `MOC — <Domain>.md` in the draft directory, including the existing notes of that domain.
- **Otherwise**: note “no map yet (n notes)” in the batch record; do not create a map for one or two notes.
- A note that bridges domains belongs to one primary map; mention it under the other map's Cross-Domain Bridges.

## 4. ASK

### 4.1 Select Questions

Candidate questions:

1. **Disambiguation**: low-confidence ⚠ items and draft assumptions phrased as “interpreted as X”. Ask only if the answer changes the body and cannot be looked up.
2. **Self-explanation**: the user recorded a method or conclusion without the “why”, and that relationship is central to Core Idea. For example, after a note about resetting one pointer to the head after the meeting in problem 142, ask why equal-speed pointers meet at the cycle entry.

Prioritize disambiguation → questions covering multiple notes → low response burden. Default to at most three questions for the entire batch and one self-explanation question per note. Exceed this only if the user requests more.

Do not ask for pure terminology definitions (e.g., “What is Exclusive Scan?”), verifiable facts, answers that would not change a note, or relationships the user has already explained.

### 4.2 Write Questions

- **Ask about one relationship per question.** Avoid multipart prompts such as “What common feature connects them? Start with an example and identify what remains unclear.”
- **Anchor questions in the original wording or a concrete example.** Provide known premises without revealing the conclusion. For example: “The left and right subtree sums are 4 and 6, and the root prefix is 0. What is the right subtree's initial prefix, and why?” Not: “Why is the right subtree prefix the root prefix plus the left subtree sum?”
- **State current assumptions in disambiguation questions**: “The draft interprets ‘rank 1 -> vector cross product’ as a rank-1 matrix being a column vector times a row vector. Is that what you meant? If not, please clarify.”
- Say that “I don't know” or skipping is acceptable for every question.
- For batches, set `allowFreeform: true` on each entry and omit `options` to enter text input directly. Include one or two relevant draft sentences in `context`.

### 4.3 Handle Results

- `cancelled` or an entry marked `skipped`: record it as skipped, finalize using draft assumptions, and add the question to My Understanding's ❓ list.
- Partial batch answers: process answered questions normally and treat the rest as skipped.
- “Ask requires interactive mode”: list questions in conversation, end the turn, and wait for a reply.

Ask at most one follow-up, only when an answer reveals a **new ambiguity affecting the body**. Put understanding gaps directly in the ❓ list; do not keep questioning until the user gets it right.

## 5. Assessment and Feedback

Assess **only what the question actually asked**. Do not penalize omissions outside its scope.

| Mark | Meaning | Feedback |
|---|---|---|
| ✅ | Correctly explains the relationship asked about | Confirm in one sentence; add applicability conditions if necessary |
| ◐ | Correct direction but missing a key link | Identify that link and add it to ❓ |
| ✗ | A specific identifiable error | Correct with evidence, retaining the original response |
| — | Skipped, unknown, or not remembered | Do not grade; add the question to ❓ |

- A correct conclusion without the requested reason is ◐ (“Correct conclusion; reason not explained”).
- Uncertain phrasing (“I think…?”) does not lower the grade; feedback may confirm that the judgment is correct.
- Wording different from the standard formulation is not an error.
- Keep conversational and note feedback consistent; one line is enough.

## 6. Batch Record: `_triage-YYYY-MM-DD.md`

Write to the draft directory in this order: numbered Sources list, disposition table, this round's selections, links added (`[[A]] —relation→ [[B]]`, marking reverse links pending confirmation), map placements, verbatim questions and answers (including origin: `ask_user` / conversation / user-supplied historical answers), assessments, and created/updated files. This is the batch's only process record.

## 7. REVIEW: Concept Checks and State Evolution

Use when the user requests review, spot-checking, or a quiz, optionally specifying `domain`, tags, or notes.

### 7.1 Scan and Select

1. Scan `<Vault>/30-Concepts/*.md`, excluding `type: moc` maps. If the user also requests drafts, include non-`_triage` notes in `00-Inbox/concept-drafts/*.md`.
2. Filter by requested `domain`, tags, or filename; otherwise consider all notes.
3. Choose **2–3 notes**, with 2–4 total questions per round, in this priority order:
   - **First: `mastery: shaky` or containing `✗`** — prior misunderstanding or no self-explanation yet.
   - **Second: `mastery: partial` or containing `❓` / `◐`** — unresolved questions or incomplete understanding.
   - **Third**: empty or oldest `last_reviewed`.

### 7.2 Ask Questions (`ask_user`)

Ask one question per selected note (at most two):

- If My Understanding contains `✗`, use a different small scenario or boundary condition to test whether the misconception is corrected.
- If it contains `❓` or `◐`, ask directly about that gap.
- If already `solid`, select a Recall question.
- Call `ask_user` with `allowFreeform: true` and no preset options. Include only the concept name and minimal necessary premises in `context`; **do not include Core Idea or the answer**.

### 7.3 Assess and Update Notes in Place

After answers arrive, give conversational feedback following §5 (`✅ / ◐ / ✗` + reason), then **use `edit` directly on the reviewed notes**. User-initiated review does not require a second diff confirmation.

1. **Update My Understanding**, preserving its existing heading:
   - **An existing `❓` answered correctly (`✅`)**: remove that question and add:
     ```markdown
     - 💬 “Verbatim user response” (review, YYYY-MM-DD)
       ✅ One-sentence confirmation (question: …)
     ```
   - **An existing `◐` or `✗` answered correctly (`✅`)**: retain the original as learning history. Append this review's verbatim `💬` response and `✅` assessment underneath, explaining that the missing link or misconception is now resolved.
   - **A `◐` or `✗` response**: add the new verbatim response and assessment, retaining or updating the corresponding `❓`.
   - **Skipped (`—`)**: leave the original `❓` unchanged.
2. **Update frontmatter**:
   - Set `last_reviewed` to today's `YYYY-MM-DD` if at least one question about this note was answered.
   - Recompute `mastery` using [note-guide §7](note-guide.md#7-naming-and-frontmatter). For example, promote `partial` to `solid` when all `❓` are resolved and the core mechanism has a `✅` explanation.
3. End by listing each note's `mastery` change (e.g., `partial → solid`), remaining `❓`, and links added by connection questions.

## 8. CONNECT: Discovering Links Through Review

Recall strengthens single notes; connection questions strengthen the network and can produce new ideas. Use them inside a normal review round (one question replacing a quiz question) or as a dedicated round when the user asks to connect concepts (2–3 questions).

### 8.1 Choose Pairs

1. Build the existing link graph from Connections sections (`rg -o "\[\[[^]|#]+" <notes>` is enough; ignore links inside `sources` and References).
2. Candidate pairs: two notes with **no link in either direction**, preferably from **different domains** or different sections of one map.
3. Keep a pair only if you can see a plausible structural relation from their Core Ideas — a shared invariant, algebraic structure, the same algorithmic pattern, a trade-off with the same shape, or one serving as a tool for the other. Example kinds (not evidence about the vault): an associative operator in a parallel scan ↔ monoid/Functor laws; graph degree constraints ↔ counting arguments in another proof. Do not pick random pairs.
4. Prefer pairs where at least one note is `solid` or `partial`, so the user has something to build on. Avoid pairs already asked in a recent review (check My Understanding for `(connect, …)` entries).

### 8.2 Ask

One relationship per question, via `ask_user` with `allowFreeform: true`, no options. `context` contains both note titles and one neutral premise from each (not their Core Ideas, not the relation you suspect). Example:

> “[[X]] relies on property P; [[Y]] studies structure Q. Do you see a relationship between them — for example, one being a special case, a tool, or a contrast to the other? ‘No real relationship’ or ‘I don't know’ are acceptable answers.”

### 8.3 Assess and Record

Assess whether the stated relationship is **true and specific**, using §5 marks:

| Result | Action |
|---|---|
| ✅ A true, specific relationship | Add a typed link in **both** notes' Connections (direct edit; user-initiated review). Phrase the link sentence in the note's voice, not as a quote. Add a `💬 … (connect, YYYY-MM-DD)` + `✅` entry to My Understanding of the note whose mechanism the answer explains. |
| ◐ Right direction, missing the link that makes it hold | Add the link only if you can verify the full relationship; record the missing step as ❓ in the more relevant note. |
| ✗ A specific false relationship | Do not link. Correct with evidence; record under My Understanding if it reveals a misconception about either note's mechanism (this may affect `mastery`). |
| “No relationship” / — | If you agree, do nothing. If you see a real one, explain it in one or two sentences and add it as a ❓ (“How does X relate to Y?”) rather than a link the user has not engaged with. |

If the answer contains an **insight that belongs to neither note** (a general principle connecting both), draft a new concept note in the draft directory with links to both, and mention it in the summary. Connection answers update `last_reviewed` for the notes involved; `mastery` changes only per the rules in note-guide §7.

## 9. MAPS: Build and Refresh

Use when the user asks to create or tidy maps, or to link up existing notes (Mode D).

1. **Collect**: list concept notes of the domain (by `domain` frontmatter), reading frontmatter, Core Idea, and Connections.
2. **Order**: group notes into 2–5 sections (sub-topics or stages) and order each section by dependency — prerequisites first, then the notes that build on them. Use existing `prerequisite` / `enables` links where present.
3. **Annotate**: each entry gets one line on what the note contributes and why it is in this position (see note-guide §9). A bare list of links is not a map.
4. **Gaps**: list under Open Threads the concepts that the ordering requires but no note covers, plus related Deferred triage items.
5. **Links**: while ordering, propose missing typed links between notes (with reverse pairs) as diffs; this is often the most valuable output.
6. **Health report**: end by listing concept notes in no map, notes with no incoming links (orphans), and red links. Report only; fix them only when the user asks.
