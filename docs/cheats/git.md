# Git

Run these inside a Git repository. This dotfiles directory uses Syncthing
and no longer contains Git history.

## Inspect changes

```sh
git status --short
git diff                      # Unstaged changes
git diff --staged              # Staged changes
git log -5 --oneline
git diff --stat               # Change summary
git show HEAD                 # Latest commit
```

## Branches and staging

```sh
git branch                    # List local branches
git switch -c feature-name    # Create and switch to a branch
git switch main               # Switch to an existing branch
git add path/to/file          # Stage a specific file
git restore --staged path/to/file  # Unstage; keep working file contents
git commit -m "Describe the change"
```

Review the staged diff before committing. Replace example branch names and paths.
