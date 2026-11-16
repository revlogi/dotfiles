# Note Guide: Concept Extraction and Writing

## 1. Goal

A good Concept Note lets a reader return months later and:

1. Recall the concept's **essence** from Core Idea in ten seconds.
2. Reconstruct key conclusions through the mechanism and examples.
3. Know when to use it and where mistakes arise.
4. See their understanding at the time and remaining questions.
5. Follow links to what it depends on, what it enables, and what it is confused with — and reach it again from a domain map.

Explain the concept directly in the body, not the learning process. Avoid “you recorded…” or “the user answered…”. Put technical conditions in the body.

## 2. Concept Granularity

- **One note corresponds to one mechanism or answers one question.** Split material requiring two independent mechanisms; keep different examples, applicability conditions, and substeps together.
- **A problem is not a concept.** Put LeetCode numbers and assignment problems in the corresponding pattern note's examples. Create a note named after a transferable pattern only when the problem itself embodies one.
- **Aggregate across sources.** Merge items about the same mechanism across dates and files (141 + 142 → Floyd cycle detection; five advanced-algebra entries → minimal polynomial).
- **Actively identify connections.** Debugging records and error lists often describe pitfalls in a process. For example, CUDA kernel bounds checks address extra threads introduced by rounding the grid up; put them in that note's pitfalls.
- **Isolated facts do not warrant notes** (e.g., the three permission digits in `chmod`). Defer them or incorporate them into a future reference sheet.

## 3. Core Idea

State the concept's **most important relationship** in 1–2 sentences inside a `> [!abstract] Core Idea` callout. It must be understandable without surrounding context.

Apply three tests; rewrite if any fails:

1. **Why test**: does it explain why things work this way, what problem is solved, or why the relationship holds—not just what it is or its parts?
2. **Deletion test**: remove any sentence whose deletion costs the reader nothing. Always remove filler such as “helps understand…” or “is an important…”.
3. **Confusion test**: what is this most easily confused with (SIMT vs SIMD, inclusive vs exclusive, necessary vs sufficient)? Does Core Idea or Pitfalls resolve that confusion?

| Weak | Strong |
|---|---|
| Grid, block, and thread organize CUDA parallel work; block threads form 32-thread warps executing via SIMT. Distinguishing them helps understand task division. | Grid → Block → Thread is the programmer's **logical decomposition**: a block is the largest cooperation unit with shared memory and mutual synchronization, and the unit assigned to an SM. A warp (32 threads) is the hardware's **actual execution unit**; its threads share an instruction stream, so divergent branch paths execute serially. |
| Functor lifts `a -> b` to `f a -> f b` and obeys identity and composition laws. | A Functor is a type constructor that lets you transform values without changing the surrounding structure: `fmap` lifts `a -> b` to `f a -> f b`, and its two laws formalize this value-only transformation. |

AI may synthesize Core Idea from reliable references. Whether the user understands it belongs only in My Understanding.

## 4. Body Modules

Only Core Idea, Connections, My Understanding, and References are fixed template components. Select other modules by concept type; do not add empty sections just to fill a checklist.

| Type | Typical modules, in order |
|---|---|
| Mathematics | Definition → key theorem/characterization (with a one-sentence proof idea) → examples and counterexamples → common misuse |
| Algorithms/data structures | Trigger signals (when to think of it) → core invariant/principle → steps and complexity → examples (prefer problems the user has solved) → pitfalls |
| Computer systems | Model → mechanism → typical code or workflow → failure modes/common bugs |
| Programming languages | Types/semantics → laws or rules → contrasting examples → pitfalls |

Writing requirements:

- **Prefer the user's original problem or scenario** (e.g., Find Repeats rather than an invented “keep positive numbers” example). Verify and cite problem specifications when available. Only use generic examples when specifications cannot be found, stating assumptions.
- Keep examples small enough to calculate by hand; demonstrate the mechanism with intermediate results.
- Minimize formulas, type signatures, and code. Include full derivations only when the derivation itself is essential to understanding. If Sources do not specify a language, prefer C, C++, Python, or Haskell.
- **Use Obsidian LaTeX (MathJax) for all math**: `$...$` for inline formulas, symbols, and complexity (e.g., `$m_A$`, `$(x-\lambda)^s$`, `$uv^\top$`, `$O(n \log n)$`); `$$...$$` for standalone derivations or core equations. Do not substitute plain text or Unicode superscripts/subscripts (e.g., `m_A`, `uvᵀ`, `x²`) for LaTeX. Inside Markdown tables, use `\mid` or `\lvert x \rvert` instead of bare `|` to avoid splitting cells.
- Write 1–3 Recall questions requiring reconstruction of mechanisms or judgments about applicability, not memorized definitions.

### 4.1 Connections: Typed Links

Connections is required. It turns separate notes into a network: a later reader (or review) should be able to move from this note to what it depends on and what it explains.

Format, one link per line, relation first (bold), then one sentence on the **specific** relationship:

```markdown
## Connections

- **prerequisite** [[Exclusive Scan]]: step 2 computes each kept element's output index as the exclusive prefix sum of the keep flags.
- **contrasts with** [[Reduction]]: both combine with an associative operator, but reduction keeps only the total while scan keeps every prefix.
```

Relation vocabulary and the paired relation written in the target note:

| Relation (in this note) | Meaning | Reverse entry (in target note) | 中文 |
|---|---|---|---|
| **prerequisite** | The target must be understood first | **enables** | 前置 ↔ 支撑 |
| **enables** | This is a prerequisite of the target | **prerequisite** | 支撑 ↔ 前置 |
| **generalizes** | The target is a special case of this | **special case of** | 推广 ↔ 特例 |
| **special case of** | This is a special case of the target | **generalizes** | 特例 ↔ 推广 |
| **contrasts with** | Easily confused or a meaningful alternative | **contrasts with** | 对比 |
| **applies** | Uses the target as a tool | **applied in** | 应用 ↔ 被应用于 |
| **applied in** | Is used as a tool by the target | **applies** | 被应用于 ↔ 应用 |
| **same pattern as** | Same structure in a different setting | **same pattern as** | 同构 |

Rules:

- Use the note's language for the sentence. In Chinese notes, the Chinese relation label may be used instead of the English one; keep whichever label style the note already uses.
- The sentence must say **what** connects them (the shared step, invariant, condition, or difference). “Related to X” or “see also” is not a connection.
- Link only notes in this batch, existing Concepts notes, or concepts clearly worth creating (red links, which also go to the map's Open Threads).
- Aim for at least two genuine links in a new note. If none exist yet, write “No strong existing link yet.” plus a ❓ about the missing relationship; never add filler links.
- Order links by usefulness: prerequisites first, then contrasts, then everything else.
- Legacy Connections entries without a relation label remain valid; add a label only when you are already editing that line.

## 5. My Understanding

Include only content the user actually expressed in Sources or responses (see the evidence principle in `SKILL.md`). Preserve existing headings, including `## 我的理解`, when editing historical notes.

```markdown
## My Understanding

- 💬 “cudaMemcpy should wait for the kernel to finish, right?” (Q1, 2026-10-25)
  ✅ In the same default stream, a synchronous D2H copy follows the kernel and returns only after the copy completes.
- 💬 “Verify minimal polynomial → substitute A” (S1 L22)
  ◐ $p(A)=0$ is only necessary; also verify that removing any irreducible factor makes it cease to annihilate $A$.
- ❓ How are dependencies established across streams?
```

These are illustrative examples, not evidence about the current user.

- Quote verbatim, preserving obvious typos if present, and identify the source.
- Use the marks in [workflow §5](workflow.md#5-assessment-and-feedback). If Sources merely record a fact without explanation, quote it with ◐ or no grade and state the missing “why”.
- Make ❓ entries specific, answerable, and important to the concept.
- If there is no user expression, write “No self-explanation recorded yet.” and add 1–2 ❓ questions.

## 6. Update Existing Notes

1. Read the entire existing note first.
2. Make minimal changes: add examples, pitfalls, My Understanding entries, and sources. Change Core Idea only if incorrect or clearly improvable, explaining why.
3. Do not reformat an entire note merely because it does not follow the template.
4. If old and new content conflict, retain both and flag what needs verification.
5. Show a unified diff; after confirmation, apply with `edit`. Append this batch's sources to `sources`.

## 7. Naming and Frontmatter

- Use the concept's common name as its filename (e.g., `Stream Compaction.md`, `Minimal Polynomial.md`). Put other-language names and abbreviations in `aliases`, which supports existing-note searches. Do not rename existing notes merely to match the language of these instructions.
- Use `domain` for the subject (e.g., `parallel-computing`, `linear-algebra`, `haskell`, `algorithms`, `cpp`); `tags` are optional.
- Compute `mastery` from My Understanding:
  - `shaky`: unresolved `✗` (a prior misconception), or no self-explanation recorded yet.
  - `partial`: no unresolved `✗`, at least one `✅` or `◐`, but remaining `◐` or `❓`.
  - `solid`: a `✅` explanation of the core mechanism, with no remaining `✗`, `◐`, or important `❓`.
- `last_reviewed`: today's `YYYY-MM-DD` if the user answered a question about this concept this round. Leave empty if questions were skipped or the note was extracted only from old records without new answers.
- `sources`: wikilinks to original flomo files (e.g., `"[[2026-10-25_09-21-10]]"`).
- `status: draft`. The user may change it to `reviewed` after review; organization mode does not change it.

## 8. Final Checklist

- [ ] Core Idea passes all three tests.
- [ ] Every module supports Core Idea without repeating the same relationship.
- [ ] The body contains no learning-process narrative or markers such as `[C1]`.
- [ ] Key facts are verified and cited in References; unverified ones are marked “(verification pending)”.
- [ ] Every My Understanding entry traces to the user's actual words.
- [ ] Every item in this batch has a disposition in `_triage`.
- [ ] Connections uses typed links with specific sentences; new notes have ≥ 2 genuine links or say why not.
- [ ] Reverse links for existing notes are prepared as diffs.
- [ ] Each new note has a map placement (existing MOC entry, new MOC draft, or “no map yet”).

## 9. Maps of Content (MOCs)

A map is a **structure note**: an ordered, annotated path through one domain, not an index. It answers “in what order should I revisit these notes, and why does each matter here?” Use the [MOC template](../assets/moc.md).

- **One per domain**, named `MOC — <Domain>.md` using the readable domain name (e.g., `MOC — Parallel Computing.md`, matching `domain: parallel-computing`). Put the slug and Chinese name in `aliases`.
- **Frontmatter**: `type: moc`, `domain`, `aliases`, `created`, `updated`. No `mastery`, `status`, or `last_reviewed`.
- **Scope**: a `> [!abstract] Scope` callout with 1–2 sentences on what the domain covers here and the central thread linking its notes.
- **Sections**: 2–5 sub-topics or stages. Inside each, a numbered list in learning order:
  ```markdown
  1. [[CUDA 执行模型]] — the grid/block/warp model every later note assumes.
  2. [[CUDA 合并访存与扇区覆盖]] — why warp-level access patterns decide memory throughput.
  ```
  The annotation states the note's contribution in this path, not a copy of its Core Idea.
- **Cross-Domain Bridges**: notes in other maps that this domain uses or shares a pattern with, each with one sentence.
- **Open Threads**: concepts the path needs but no note covers yet, and related Deferred items (with `_triage` file). These become candidates for future batches.
- Keep maps short; split a section into its own sub-map only when it exceeds ~12 entries, linking the sub-map from the parent.
- When updating a map, change only the affected entries and `updated`; do not reorder unrelated sections.
