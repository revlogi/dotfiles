---
name: python-style
description: Write, modify, refactor, and review Python code and examples according to the user's preferences. Use uv, Ruff, and moderate type annotations; keep algorithms direct, scripts lightweight, and project interfaces clear. Load for Python implementation work; not needed merely to run existing Python tools without modifying code.
---

# Python Style

Apply these rules to Python code involved in the current task. The user's current request and explicit project conventions take precedence. Do not change unrelated code, public interfaces, or project tooling just to impose a personal style.

## Establish Context First

- Read the project's `AGENTS.md`, `pyproject.toml`, existing check configuration, and nearby code to identify the Python version, execution workflow, and test entry points.
- Distinguish algorithm/course exercises, one-off scripts, and reusable project modules. Preserve required signatures, course restrictions, and existing doctests. Do not wrap small exercises in a CLI, configuration system, or layered architecture.
- Tool preferences below come from the user's existing configuration. Code organization is default guidance, not a requirement to migrate all old code to one style.

## Environment and Tools

- Default to **uv** for new Python projects. In existing uv projects, run commands such as `uv run python ...` and `uv run pytest ...` without requiring manual environment activation.
- Add dependencies with `uv add` and development dependencies with `uv add --dev`. Keep `pyproject.toml` and `uv.lock` in sync, and do not version `.venv`. Do not install dependencies into system Python.
- Keep other environment-management approaches in existing projects. A one-off standard-library script does not need project initialization or dependencies.
- Default to **Ruff** for formatting and linting. Follow project line length, rules, and target version. Do not add Black/isort or independently debate quote style. Format only files involved in the task.
- The user's editor uses **basedpyright in basic mode**. Follow stricter project settings when present; do not independently enable strict mode, annotate everything, or add type-checking dependencies.
- Use syntax supported by the project. One personal project using Python 3.13 does not justify upgrading every project to 3.13.

## Code Expression

- Prefer small, focused functions that express data flow directly. Local state and ordinary loops are normal choices; do not introduce higher-order function chains or recursion merely to be functional.
- Use comprehensions for simple transformations and ordinary loops for multistep logic, side effects, or hard-to-read nesting. Prefer `enumerate` when both index and value are needed; consider `zip` for parallel iteration.
- Use clear `snake_case` names. Keep conventional algorithm-local names such as `i` and `n`. Neither mechanically copy old exercise naming nor use unnecessarily long descriptive names.
- Use ordinary collections and the standard library when sufficient. Prefer `pathlib.Path` for paths, explicit encodings for text files, and f-strings for string formatting.
- Standalone executable scripts normally use `main()` and `if __name__ == "__main__":`. Importing a module should not run its task. Do not force entry-point wrappers onto snippets, notebooks, or course templates.
- Comments explain intent, algorithm invariants, or non-obvious trade-offs, not each line of code. Use concise docstrings when public functions need a contract, following the project's language.

## Function Layout and Decomposition

- Optimize for a person reading the code, not for minimum line count. Within a function, use a single blank line to separate meaningful phases such as validation, preparation, computation, and result construction. Keep closely related statements together; do not put a blank line after every statement or force every function into the same phases.
- Give compound statements visual breathing room when surrounding code changes purpose. Do not rely on indentation alone to make a long function readable, or assume that passing Ruff formatting checks guarantees readable organization.
- Actively look for extraction opportunities when a function mixes responsibilities, repeats a substantial block, contains deeply nested logic, or requires the reader to track too many intermediate values. Do not wait for code reuse before extracting a helper: a well-named helper can make a distinct operation easier to understand and test even when called only once.
- Extract coherent operations with clear inputs and outputs, and name helpers after what they do. Keep orchestration functions readable as a sequence of meaningful steps; keep implementation details in focused helpers at the appropriate module or class scope.
- Use judgment rather than a rigid function-length limit. A long function with several independently nameable stages usually deserves decomposition; a cohesive algorithm may be clearer kept together with blank lines between its stages. Preserve required public signatures while extracting private helpers when useful.
- Avoid fragmentation: do not extract every few lines, create trivial forwarding helpers, or split tightly coupled logic into functions that pass a large bundle of local state back and forth. Prefer a few substantive helpers over many tiny functions that force the reader to jump around.
- Before delivery, reread changed functions for visual grouping and responsibility boundaries. If a function reads like an uninterrupted wall of statements, add meaningful spacing or decompose it; comments that merely label phases are not a substitute for either.

## Types and Abstraction

- Prefer parameter and return annotations for reusable functions, module boundaries, and class methods. Rely on inference for obvious local variables. Follow exercise style for small tasks rather than requiring full annotations.
- Prefer `list[T]`, `dict[K, V]`, and `T | None` when supported. Use `from __future__ import annotations` only for forward references or project conventions, not mechanically.
- Use classes for real state and behavior; use `Protocol` for interfaces with multiple interchangeable strategies. Do not introduce a Manager, Factory, abstract base class, or general plugin layer for a single function.
- Choose a plain class or `dataclass` for simple records according to project style. Do not add runtime frameworks such as Pydantic solely for type annotations.
- Do not hide real problems with `Any`, `cast`, `# type: ignore`, or disabled rules. Keep necessary exceptions local and explain them.

## Errors and Validation

- Perform necessary checks at input boundaries or state invariants and raise specific exceptions. Do not use broad `except Exception: pass` or return apparently successful empty results on failure.
- Check typical inputs and boundaries for algorithm exercises, running existing doctests when appropriate. Run affected tests for project changes. Do not add tests that duplicate implementation logic merely for style changes.
- When a uv project already provides the tools, run `uv run ruff check <files>`, `uv run ruff format --check <files>`, and relevant tests for changed files. If formatting is needed, run `uv run ruff format <files>` first.
- Use the project's type-checking command. If none is configured or available, say so; editor basedpyright configuration is not evidence that project type checks passed.
- Before delivery, confirm scope has not expanded and no unnecessary dependencies or abstractions were added. State which checks actually ran and which verification remains incomplete.

## Basis for These Preferences

This skill was initially based on the dotfiles Python cheatsheet (uv, pytest, Ruff), Neovim Ruff formatting and basedpyright basic configuration, `pymain`/`enum` snippets, local algorithm exercises, and the `rl-cache` project (modern types, plain classes, strategy Protocols). These samples are not necessarily all handwritten by the user; do not treat every pattern in them as a mandatory preference.
