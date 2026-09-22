# Pi Teach

A stateful teaching package adapted from Matt Pocock's `/teach` skill. It produces rich HTML lessons, optionally grounds them in local `materials/` or registered legacy `material/` roots, and records browser answers as evidence for concise learning records.

From a teaching workspace containing `MISSION.md`, `RESOURCES.md`, `lessons/`, and `assets/`, start Pi and run:

```text
/teach continue
```

The generated lesson covers explanation and checking in one page. Keep Pi running for answer assessment and feedback. `/teach-page` shows the current URL; `/teach-page stop` stops the local page service. For an existing lesson, use `/teach-page 0001-topic.html materials/source.pdf` with paths relative to the workspace root.

Development:

```bash
npm ci
npm run check
```
