# Review standards

Review only the selected change and report findings that can cause incorrect behavior, unmet requirements, unsafe operation, or material maintenance cost. Do not report preferences already enforced by tooling.

Repository instructions and documented standards take precedence. In their absence, use these code-smell heuristics as judgement calls:

- names that conceal purpose;
- duplicated logic;
- a function overly coupled to another module's data;
- repeated groups of parameters that represent one concept;
- primitives standing in for important domain concepts;
- repeated conditionals over the same variants;
- one logical change scattered across unrelated files;
- one module changed for unrelated reasons;
- abstraction added without a requirement;
- long chains that expose another module's structure;
- pass-through layers with no useful policy;
- inheritance whose contract is mostly rejected.

Every finding must state severity, file and line, evidence, impact, and the smallest reasonable correction. Use `high`, `medium`, or `low` severity. Omit praise and summaries of unchanged code. If no actionable findings remain, say so and mention any verification limitation.

