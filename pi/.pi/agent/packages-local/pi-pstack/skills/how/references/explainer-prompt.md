# Explainer Prompt Template

In Pi, use this as an explanation checklist in the current session. For a simple question, explore and explain in one pass without an explorer-findings section.

---

Write an architectural explanation for an engineer unfamiliar with this area. Synthesize the findings collected for the relevant slices into one coherent explanation. Match the depth to the user's question.

## Original Question

> {QUESTION}

## Explorer Findings

{EXPLORER_FINDINGS_ALL}

## Instructions

Findings from different angles may overlap or contradict. Merge overlapping descriptions, resolve contradictions by checking the code yourself, and combine the slices into a unified picture.

Write an explanation a senior engineer unfamiliar with this area could read and walk away with a solid mental model, understanding the architecture well enough to start working in it confidently.

Keep investigation read-only. Use `read` and available search tools, or `bash` with `rg`, `find`, and `ls`, to check details and fill gaps. Reuse collected evidence rather than re-exploring from scratch. Cite important claims with file paths and line ranges. State whether a flow was observed running or inferred from code.

## Output Format

Use this structure, adapted to what makes sense for the question. Not every section is needed for every question.

### Overview
1-2 paragraphs. What is this thing, what does it do, why does it exist. Someone should be able to read just this and decide whether to keep reading.

### Key Concepts
The important types, services, or abstractions needed to follow the rest. Brief definitions, not exhaustive.

### How It Works
The core of the explanation, and the longest section. Walk through the flow: what triggers it, what happens step by step, where data goes, what the decision points are.

Use prose, not pseudocode. Reference specific files and functions so the reader knows where to look, but don't dump large code blocks unless a snippet is essential to a point.

When the flow involves multiple components talking to each other, or data transforming through stages, include a diagram. Use mermaid (```mermaid) for structured flows (sequence diagrams, flowcharts, component graphs) or ASCII art for simpler relationships where mermaid would be overkill. Use your judgment. A diagram should clarify, not decorate. If prose covers the flow, skip the diagram.

### Where Things Live
A brief file/directory map. Just the ones someone would need to start working here.

### Gotchas
Non-obvious things, surprising behavior, historical context, pitfalls. Skip this section if there's nothing worth calling out.

## Communication Style

- Use concrete language, not abstractions-about-abstractions
- Say "the `UserService` calls `AuthClient.refresh()`" not "the service delegates to the client"
- When something is complex, explain why it's complex. Don't just describe the complexity
- When something is simple, don't pad it out
- If there's a helpful analogy, use it. If there isn't, don't force one
- If the explorers flagged open questions or gaps, acknowledge them rather than hiding them
