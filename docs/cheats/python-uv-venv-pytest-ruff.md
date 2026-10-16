# Python projects with uv

Install uv first. Replace project names and run commands manually.

## Create a project

```sh
uv init my-project
cd my-project
uv add requests
uv add --dev pytest ruff
uv run python main.py
uv run pytest
uv run ruff check .
uv run ruff format .
```

`uv add` updates dependencies and the lockfile. `uv run` uses the project
environment and syncs it as needed. Add tests before running pytest.
`ruff format` modifies source files.
For an existing directory, run `uv init` from its root.

## Work on an existing project

```sh
uv sync                       # Sync the environment from project metadata
uv run python main.py         # Run in the project environment
uv remove requests            # Remove a project dependency
uv tree                       # Inspect the dependency tree
```

Share `pyproject.toml` and `uv.lock`; keep `.venv` local.

## Standalone virtual environment (standard library)

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install requests
python -m pip list
deactivate
```

The activation command is for Bash / Zsh. uv projects usually do not need
manual activation.
