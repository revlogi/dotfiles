# Configuration maintenance

[Back to README](../README.md)

Configuration files are symlinked into `$HOME`; edits through either path
update this repository. Dependencies, credentials, sessions, caches, and runtime
state stay machine-local. `.git` remains excluded from synchronization.
OrbStack is installed by the Brewfile, but its generated state is not managed here.

For synchronization, device onboarding, and recovery, see the
[device guide](syncthing-devices.md) and [migration plan](syncthing-migration.md).

## Daily configuration commands

Deploy the command on an existing installation with `stow --no-folding -t ~ dot`.
Zsh already adds `~/.local/bin` to PATH. The command follows its Stow symlink to
find this checkout, so the repository can live anywhere; `DOTFILES_ROOT` is an
optional explicit override.

```bash
dot help
dot edit tmux
dot reload tmux
dot check          # Run all available checks
dot check nvim     # Or: sync, links, stow, zsh, pi
```

`edit` supports zsh, tmux, nvim, kitty, pi, hammerspoon, brew, and docs. It opens
the tracked file using `VISUAL`, then `EDITOR`, then `nvim`. Simple editor flags
are supported (for example `EDITOR="code --wait"`); shell quoting and expressions
are not interpreted. Editing does not automatically reload an application.

`reload tmux` sources the configuration in the current accessible tmux server;
it skips when no server is running. Other reload targets print instructions for
Zsh, Neovim, Kitty, Pi, and Hammerspoon, where reloading belongs in the application.

`check` reports PASS, FAIL, and SKIP, and continues after individual failures.
Exit status is 1 for failed checks and 2 for invalid usage; skipped checks remain
unverified even when the exit status is 0. Missing tools or Pi development
dependencies are reported without installing them. Sync checks detect conflict copies and service connectivity; link checks verify
key deployed files, Karabiner directory linking, and Pi state isolation.
Stow runs a deployment
conflict simulation against the current home directory (SSH: server profile;
otherwise macOS or a minimal Linux server profile). It does not certify
that every link is already deployed. Zsh checks syntax; Neovim checks formatting
and headless startup against this checkout with installed plugins and temporary
state/cache; Pi runs typechecks and tests for the base config and local
packages that define a check script, using the deployed package dependencies when linked to this checkout. Initialize plugins using Bootstrap before the Neovim startup check.

## Pi local packages

Pi configuration lives in `pi/.pi/agent/`: settings, keybindings, extensions,
skills, prompts, and local packages. Deploy with `stow --no-folding -t ~ pi`;
files under `~/.pi/agent/` then link to these sources. Add new skills and packages
in dotfiles first, and rerun that command to deploy their files.
`skills/process-learning-notes/` includes its references, template, and examples.

Keep authentication, provider credentials (`models.json`), sessions, downloaded
packages, dependencies, and caches machine-local. Do not link the whole `~/.pi`
directory. Use `dot check links` and `dot check stow` to detect broken deployment.
If Pi replaces `settings.json` with a regular file, back up both versions,
compare and reconcile their contents, then restore its Stow link.

`pi-anki-english` provides English Anki capture, preview, duplicate checks, and
confirmed writes. `pi-engineering-workflow` provides engineering skills and
prompts. The base Pi configuration retains shell safety, change tracking, and
third-party packages.

## Searchable cheatsheets

Run `dot cheats` (or `dot cheats python`) in any terminal. In tmux, press
`Ctrl-f`, then `?` to open a popup; `Ctrl-f /` shows the full tmux binding list.
Apply the binding to an existing server with `dot reload tmux`.
The popup requires tmux 3.2+; the terminal command works without tmux.

Search topic filenames, select with Up/Down, scroll the preview with Ctrl-d/u,
and close with Enter or Esc. This is a read-only reference; commands are never
executed or inserted. fzf is required; Glow renders Markdown to fit the preview
width using `docs/cheats/terminal-style.json`: default body colors, terminal-palette
accents, bold headings, inline-code accents, and Unicode table rules. No fixed
background is applied, so the terminal controls light/dark appearance. The
selector uses matching accents and reverse-video selection. Without Glow,
bat/batcat or cat shows plain Markdown source. The Brewfile includes fzf, Glow, and bat;
on Linux install `glow` with your package manager to enable rendered previews.

Add Markdown files directly under `docs/cheats/`; use descriptive filenames
(including search keywords). English sheets cover tmux sessions/windows/panes,
Zsh, Neovim, Yazi, SSH keys, rsync transfers, shell commands, Git, C/C++ flags,
and Python project setup.
For example, `dot cheats tmux` opens the session-management reference. These files use the existing
Syncthing docs root and the existing Stow `dot` package, with no extra deployment.
