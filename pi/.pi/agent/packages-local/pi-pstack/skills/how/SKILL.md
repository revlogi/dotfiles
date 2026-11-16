---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

## Pi execution

Use the current session and model. No subagent extension, pstack model settings, or other pstack mode is required. Explorer and explainer are roles you perform sequentially, not tools to call. Do not launch nested Pi processes. Read only the reference files needed for the chosen path.

Investigation is read-only by default. Use `read` for files and `bash` with `rg`, `find`, or `ls` for discovery; use dedicated read-only search tools if available. Do not edit code, run mutating setup scripts, or change external state to explain it. Distinguish observed runtime results from behavior inferred by reading code. Cite important mechanics with file paths and line ranges. Verify line numbers against numbered search output (for example `rg -n '^' <file>`, or an available search tool); do not estimate them from an unnumbered `read` result. Use `../why/SKILL.md` only when historical motivation is part of the question; do not infer author intent from code.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): explore and explain in one pass using `references/explainer-prompt.md`, without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## 2. Explore (complex only)

Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem. Read `references/explorer-prompt.md` and investigate each angle yourself. Keep concise findings with citations; avoid repeating shared discovery or expanding into unrelated subsystems.

## 3. Synthesize (complex only)

Read `references/explainer-prompt.md` and synthesize the collected findings yourself. Resolve contradictions against the code. Reuse relevant findings already gathered in this conversation instead of redoing the investigation.

## 4. Present

Present the explanation directly, scaled to the question. A narrow question may need only a few paragraphs; do not force a full architecture report. Include meaningful gaps or gotchas, not an annotated listing of every function.

## Output format

The explanation uses the sections defined in `references/explainer-prompt.md`, dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
