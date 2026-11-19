# Global Preferences

## Coding Workflow

- When asked to implement a change, carry it through verification rather than stopping at a plan. Use the request and project context to resolve routine, reversible choices; disclose assumptions that affect the result. Ask when the user's intent, authorization, or a meaningful trade-off is unresolved. Honor existing confirmation requirements.
- Follow local conventions and reuse existing code where it fits. Prefer clear, scoped changes that preserve unrelated work and behavior callers rely on. Follow the project's test policy; add focused coverage when existing checks would miss an important regression.
- Review the diff against the request and run the relevant project checks. In the final reply, lead with the outcome, state what was verified, and flag anything important that remains unverified. Make the reply understandable without earlier progress updates.

## Programming Languages

- Preferred languages: **C, C++, Python, Haskell**.
- For code examples, pseudocode, algorithm demonstrations, or conceptual explanations when no language is specified, prefer these four languages (C/C++ for systems and low-level topics, Python or C++ for algorithms and scripting, Haskell or Python for functional programming and type-system concepts), and avoid defaulting to JavaScript, TypeScript, or Java.

## Operational Memory

- Use pi-memory tools for engineering memory in the current project scope; check `memory_status` for the directory and `memory_read` for authoritative recall (qmd is not installed). Do not browse other projects' memory automatically.
- Keep entries concise, scoped, and evidence-qualified. Ask before durable writes or corrections unless the user explicitly asks to remember that information. Avoid automatic daily logs/scratchpad accumulation and whole-store overwrites.
- Reflection is explicit via `/skill:reflect`, never an automatic post-task or exit hook. Propose skill/structural improvements first; apply only approved changes.
- Operational memory is separate from Obsidian, Concept Notes, and flomo. Never automatically write reflections into those systems.

