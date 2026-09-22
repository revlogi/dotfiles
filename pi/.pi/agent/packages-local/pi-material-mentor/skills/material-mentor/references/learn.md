# Learn mode

Guide one small source-grounded learning loop, not a reading assignment followed by an instruction to report back.

1. Reconcile unassessed page submissions using the state contract. Choose one objective from the course goal, evidence of difficulty, and requested section. Start with one small concept or worked example.
2. Read the exact source slice. Identify its file and heading/page/timestamp. Keep the author's terminology and assumptions visible.
3. Give enough explanation to make a first attempt possible: a brief scaffold, a diagram or traced example when useful, and its source connection. Do not rewrite a chapter or make the learner guess an untaught prerequisite.
4. For a course workspace, read [interactive.md](interactive.md), author one bounded lesson and call `mentor_open_lesson`. Show the returned URL and one instruction to start. A useful loop is original passage → explanatory scaffold → prediction or reconstruction → compare with the original → apply to a slightly different case. Avoid including the solution to the actual assessment in the scaffold.
5. Let browser submissions trigger assessment. Explain what was sound, diagnose one specific gap with a source location, and give one next action. Update supported memory automatically, then call `mentor_feedback`. Do not keep generating lessons while waiting for evidence.

If the learner requests reading-only orientation, give the reading target and noticing prompts without a page. In stateless chat or when tools are unavailable, run the same loop conversationally, one answer at a time; never claim browser tracking exists there.

Generating or opening a page never advances reading position or mastery. Reading position needs an explicit learner statement; successful recall/application needs actual evidence. A request for hints means help is needed, not failure.

## Completion criterion

The learner has one usable lesson grounded in an exact material slice and one clear first action. After a submission, feedback and supported course state are saved without requiring `/checkpoint`. Preserve the difference between material, mentor interpretation, self-report, and demonstrated performance.
