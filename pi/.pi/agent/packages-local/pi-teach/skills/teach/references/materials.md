# Materials

Materials are optional human-authored sources supplied or chosen by the learner. They anchor knowledge without dictating the presentation of every lesson.

Register them in `RESOURCES.md` under `## Knowledge`:

```markdown
- Local material root: `materials/`
  Human-authored course sources. Use for: the curriculum sequence and definitions.
- [CS 70 Note 7](material/notes/n07.pdf)
  Public-key cryptography, RSA correctness, and its security assumption. Use for: RSA lessons; cite PDF and printed page.
```

An existing `material/` directory is valid when registered; do not rename or copy it just to obtain `materials/`. Add or copy source files only when the learner explicitly asks. Keep local materials read-only during ordinary teaching. Never place an AI summary in a material root as if it were a primary source.

For each lesson:

1. Locate the relevant source by index, table of contents, heading, search, or metadata before reading it in depth.
2. For PDFs, inspect both extracted text and relevant rendered pages. For video, use timestamped transcripts and inspect frames when visuals carry meaning.
3. Cite exact file and location in the HTML. Use brief quotations only where seeing the author's wording matters; otherwise explain and link to the source.
4. Pass every local source used to `teach_open_lesson`. The runtime snapshots its hash with the answer evidence and exposes only those files from the page.
5. Keep solution manuals delayed until the learner has attempted the problem unless the learner explicitly requests otherwise.

Separate the source's claim from mentor explanation and outside context. If the current source has changed since an evidence hash, assess the historical answer against its recorded lesson/source context rather than silently applying the new version.
