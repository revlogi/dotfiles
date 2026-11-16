# Explorer Prompt Template

In Pi, use this as a sequential exploration checklist. Fill in the angle mentally; no subagent or separate prompt is required.

---

Investigate one slice of the subsystem at a time. Don't try to cover everything. Focus on the current angle and go deep enough to answer the question.

## Question

> {QUESTION}

## Your Exploration Angle

{EXPLORATION_ANGLE}

## Output

### Components Found
The key types, services, classes, and abstractions. For each: name, file path, and a one-sentence description of what it does.

### Flow
The execution flow step by step. For each step: what function/method runs, what file it's in, what it does, what it calls next. Include the data that flows between steps.

### Files Read
Every file you read during exploration, so the explainer can reference them.

### Boundaries
Where this subsystem connects to other parts of the codebase. The inputs and outputs.

### Non-Obvious Things
Anything surprising, historically motivated, or easy to get wrong. Things that look like they should work one way but work another.

### Open Questions
Anything you couldn't fully trace or understand. Be honest about gaps.
