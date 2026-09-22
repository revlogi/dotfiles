# HTML lesson authoring

The lesson is the teaching experience, not a report about the source. Build a clear path from motivation through knowledge to practice and feedback. Use as many sections as the objective needs; avoid a fixed card schema.

## Required contract

- Save lessons as `lessons/NNNN-slug.html`, incrementing the highest number. Do not rewrite a completed lesson; create a new revision and link them.
- Link `../assets/teach.css` and `../assets/teach.js`. Add `data-teach-lesson` to `<body>`.
- Include a visible objective tied to the mission, exact source citations, the author's relevant assumptions, a substantive explanation, at least one worked example or explorable representation, and effortful practice.
- Link registered local sources as `/material/0`, `/material/1`, in the same order passed to `teach_open_lesson`. They work while the local service runs.
- End with a next action and an invitation to ask Pi about anything unclear.
- Make the page responsive, keyboard usable, printable, and legible without color. Prefer semantic HTML and inline SVG. Do not load remote scripts, fonts, trackers, or media.

## Reusable interaction contract

Use ordinary inline JavaScript for deterministic simulators and immediate local checks. Use the shared bridge for answers that need Pi:

```html
<form class="teach-response" data-teach-response data-question-id="proof-transfer">
  <label for="proof-transfer">Explain the missing step...</label>
  <textarea id="proof-transfer" name="answer" required></textarea>
  <div class="actions"><button type="submit">Send to Pi</button></div>
  <p data-teach-status role="status"></p>
  <div data-teach-feedback hidden></div>
</form>
```

Record a disclosed hint by adding `data-teach-hint` to `<details>` or a button. Give hints in layers when useful; do not reveal the complete answer as the first hint. Local multiple-choice feedback should explain why, not only mark correct/incorrect. If its result should influence future teaching, include an explicit "record this attempt" action or follow it with an open response sent to Pi.

Lesson-specific scripts may manipulate the page and compute deterministic results, but must not call the evidence API directly. The shared bridge owns submission identity, retry behavior, save status, and feedback polling. Treat browser feedback as asynchronous: the answer is durable once saved even if the model is temporarily unavailable.

## Quality check

Open the actual page through `teach_open_lesson`. Inspect the complete desktop page and a narrow viewport. Exercise every control, one answer submission, material links, printing, and feedback display. Check that explanation precedes retrieval, source and mentor claims are distinguishable, the lesson produces a tangible win, and the resulting learning record would change what is taught next.
