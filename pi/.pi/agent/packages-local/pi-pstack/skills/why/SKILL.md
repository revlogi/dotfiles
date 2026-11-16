---
name: why
description: Investigate why code or a design decision took its current shape, using source, Git history, documentation, and available linked evidence. Use for design rationale, regressions, trade-offs, and unexplained thresholds. Separate documented reasons from inference and unknowns. Use how for runtime behavior.
---

# Why

Investigate the motivation and intent behind code. The companion `how` skill answers what the code does and how it works. `why` answers what forces led to its shape.

## Pi execution

Use the current session and model. Investigator and synthesizer are roles you perform sequentially, not tools to call. No subagent extension, pstack model settings, or other pstack mode is required. Do not launch nested Pi processes or change model configuration.

Investigation is read-only. Use `read` for files, `bash` for targeted search and Git inspection, and available read-only web or service tools when useful. Do not edit files, fetch/unshallow repositories, install integrations, authenticate services, or mutate external state without authorization. Tool availability is not permission to use write endpoints. Never bypass an active learning or safety guard.

Read `references/epistemics.md` in full before investigating. Keep its confidence language intact when sharing findings with Teach or editing prose with Unslop. Code behavior is not evidence of historical intent.

## 1. Understand the target

Identify the code, pattern, feature, decision, and question. If the referent is unclear, use conversation context to make a reasonable interpretation, state it briefly, and proceed. Ask only when the ambiguity prevents a useful investigation. If current mechanics are unclear, load `../how/SKILL.md` for a scoped trace; otherwise do not duplicate that work.

## 2. Establish a code anchor

Read the target and note file paths, line ranges, key symbols, nearby comments, and related tests. Check `git rev-parse --show-toplevel` before using history commands. Git, remotes, and `gh` are not guaranteed to exist or be usable.

For a Git checkout, start with bounded history:

```bash
git log -n 10 --oneline -- <file>
git blame -L <start>,<end> -- <file>
git show --format=fuller <commit> -- <file>
```

Trace beyond the last touch when needed: `git log --follow -n 20 -p -- <file>`, `git log -S '<text>' -- <file>`, or `git log -G '<pattern>' -- <file>`. Read substantive commit messages and patches, not subjects alone. Extract PR numbers and ticket IDs as leads. Distinguish current, historical, and uncommitted code. Note shallow history, missing objects, or absent repositories as limits rather than repeatedly running failing commands.

If a relevant GitHub remote and usable `gh` are available, inspect linked PR bodies, reviews, and comments with `gh pr view <number> --repo <owner/repo> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. Load the existing GitHub skill if needed. Use a public URL reader when appropriate if `gh` access is unavailable. Do not assume a merge number implies GitHub or invent PR/ticket links.

## 3. Investigate relevant evidence

Default to code, Git, local documentation, and directly linked PRs/issues. Follow the strongest leads, not an exhaustive search of every integration. Start with one or two sources beyond the code anchor when useful, widening if the answer remains unclear or the user requests a broad investigation. Reuse relevant evidence from this conversation.

Discover external sources from tools actually exposed to this session. Do not assume MCP servers, credentials, team chat, observability, or analytics access. Load `references/source-playbook.md` and only the relevant category playbook when needed. For defensive code, also read `references/sources/incident-postmortem.md` when an incident lead exists. The playbooks are search examples, not requirements to install their tools or to run every sample query.

Use `references/investigator-prompt.md` as a checklist for each source, keeping concise notes rather than printing intermediate investigator reports. Search accurately, quote verbatim, record queries and empty results, and retain contradictions. Follow cross-source leads once, without repeating searches.

Track coverage across these categories, even when several are unavailable:

1. Source control, code comments, and tests.
2. Issue/ticket tracker.
3. Long-form documents, including local README files and ADRs.
4. Real-time team chat.
5. Infrastructure observability.
6. Error/exception tracking.
7. Product analytics warehouse.

Mark sources **searched**, **no results**, **unavailable**, or **outside this investigation's scope**, with the actual reason. Unavailable is not the same as searched and empty. For a narrow answer, group unused categories into a concise coverage note; for a broad investigation, list each category separately. Never claim to have searched a service merely because a tool is present. A non-Git directory can still contain direct rationale in comments or docs.

## 4. Synthesize and present

Read `references/synthesizer-prompt.md`, then synthesize the findings yourself. Its evidence and confidence checks apply; its full report layout is optional for narrow questions. Verify citations against the actual content. Check file line numbers using numbered search output (for example `rg -n '^' <file>`, or an available search tool), not estimates from unnumbered text. Every Direct/Supported rationale needs an adjacent precise citation. Inferred/Speculative claims need explicit uncertainty and an evidence chain. Surface contradictions and concrete gaps, including missing history or inaccessible sources.

Lead with the best-supported answer. For larger investigations use the upstream sections as appropriate: The question, The code in question, What we found, What we can reasonably infer, Competing hypotheses, What we don't know, Sources consulted, Confidence summary. For small questions, a short answer plus evidence, unknowns, and source coverage is enough. Never invent a rationale to fill a section. Preserve the distinction between a technical consequence and a documented historical reason.

If the question precedes a code change, finish with concise **Preserve / Change / Avoid / Risk** constraints grounded in the findings, without implementing the change. Avoid recency bias: the last commit is not automatically the origin or the authoritative explanation.
