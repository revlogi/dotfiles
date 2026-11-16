---
name: commit
description: Inspect Git repository state (git status, git diff, git log), safely stage (git add) and commit (git commit) changes, then explain the core changes since the previous version and the reasoning behind the commit message. Load when the user asks to commit code, add and commit changes, or create a commit and explain it.
---

# Git Commit & Change Explanation

Complete the workflow from repository inspection, `git add`, and `git commit` through **a summary of changes and an explanation of the commit message**. Communicate in the user's language by default. Match the commit message's language and style to the repository's `git log` history (default: English Conventional Commits).

## 1. Inspect Repository State and Historical Style

Before any write operation, run the following commands together to gather context:

1. **Working tree and staging area overview**: `git status --short --branch`
2. **Changes**:
   - Unstaged changes: `git diff`
   - Staged changes: `git diff --staged`
   - Briefly inspect new, untracked text files to determine their purpose.
3. **Commit conventions**: `git log -n 20 --oneline`
   - Observe existing formatting (`<type>(<scope>): <summary>` or otherwise), common scope names, language, and imperative phrasing.

## 2. Select and Stage Files (`git add`)

Stage changes safely according to the user's instructions and repository state:

1. **Determine scope**:
   - If the user specifies files or directories, stage only those paths.
   - If the user asks to add and commit repository changes without specifying files, include modified, new, and deleted files belonging to this logical change.
2. **Safety filtering (never blindly use `git add -A` to include noise or sensitive files)**:
   - **Never stage sensitive files**: e.g., `.env*`, `auth.json`, `oauth.json`, `*.pem`, `*.key`, or local configuration containing plaintext API keys or tokens.
   - **Exclude system and build noise**: e.g., `.DS_Store`, `node_modules/`, `.venv/`, `__pycache__/`, temporary test artifacts, or compiled binaries not covered by ignore rules.
   - **Prefer explicit paths**: use `git add <file1> <file2> ...` when untracked noise or unrelated changes exist.
   - **Resolve ambiguity**: use `ask_user` to confirm files that appear unfinished, experimental, or of uncertain relevance. In noninteractive mode, skip uncertain files and explain this in the response.

## 3. Create the Commit (`git commit`)

### Commit Message Conventions

Unless the repository specifies another format, use **Conventional Commits**:

```text
<type>(<scope>): <summary>

[optional body]
```

- **`type` (required)**:
  - `feat`: a new feature, skill/tool, or user-visible capability
  - `fix`: a bug fix, boundary-condition fix, or correction of faulty behavior
  - `refactor`: code or structural changes without changing external behavior
  - `docs`: documentation, comments, or explanatory text only
  - `chore`: configuration, dependencies, build scripts, or routine maintenance
  - `perf` / `test` / `style`: performance improvements, additional tests, or formatting-only changes
- **`scope` (optional)**: reuse short module/subdirectory names from `git log` (e.g., `pi`, `nvim`, `parser`). Omit it when changes span multiple areas or repository history does not use scopes.
- **`summary` (required)**: a short imperative phrase (e.g., `add ...`, `fix ...`, `refactor ...`), at most 72 characters, **without a trailing period**. Focus on what changed and its intent rather than listing filenames.
- **`body` (optional)**: add only for substantial, coordinated changes or non-obvious trade-offs. Separate it with a blank line and use brief bullets or paragraphs.
- **Restrictions**:
  - Do not add trailers such as `Signed-off-by` or `Co-Authored-By` unless explicitly requested.
  - **Run `git commit`, not `git push`**, unless the user explicitly asks to push.

After committing, verify success with `git status --short --branch` and `git log -n 1 --stat`.

## 4. Delivery: Explain Changes and Message Choices

After committing, **always** provide a clear, concise summary in these three parts. Avoid lengthy pleasantries or large pasted diffs.

### 1) Commit Overview
- **Commit**: `<short-hash>` — `<full commit subject>`
- **Included files**: briefly list the files staged and committed. If files were intentionally excluded or left unstaged, explain why in one sentence.

### 2) What Changed Since the Previous Version
Group changes relative to the previous version (`HEAD~1`) by **logical module or functional intent**, not alphabetical filename order:
- Explain core logic changes, new mechanisms, fixes, and removed or simplified redundancy.
- When multiple layers are involved (e.g., core logic, configuration, tests/documentation), briefly describe the substantive change in each.

### 3) Why This Commit Message
Explain the message's design:
- **`type`**: why `feat`, `fix`, `refactor`, `chore`, etc. fits. For example, modifying existing files can still be `feat` when the main purpose is a new capability.
- **`scope`**: why this scope was chosen or omitted, and how it follows recent repository history.
- **`summary` (and `body`)**: why the chosen verbs and objects capture the main intent, and which secondary details were omitted to keep the subject concise.
