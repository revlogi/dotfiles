# Pi Engineering Workflow

A focused, local Pi package for moving code changes through five explicit stages:

```text
/grill-with-docs -> /to-spec -> /to-tickets -> /implement -> /code-review
```

The workflow keeps durable context in the target repository so a fresh Pi session can continue from a spec or ticket. It supports Git repositories and non-Git directories, uses project-provided validation commands, and never commits or pushes unless the user asks.

The package provides the five short commands above, plus Pi's standard `/skill:<name>` forms. Supporting interview, domain-modeling, TDD, and review guidance is private reference material rather than additional skills.

## Development

Validate every skill with Codex's `quick_validate.py`, then run the dotfiles repository's `dot check` command.
