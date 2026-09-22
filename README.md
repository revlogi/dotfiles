# Dotfiles

Cross-platform configuration synchronized with Syncthing and deployed with GNU Stow.
Shared packages run on macOS, Fedora, and remote Linux servers; platform-only
packages are deployed selectively.

## Stack

| Component | Configuration |
|-----------|---------------|
| Shell | Zsh, Zim, vi mode, zoxide, and fzf |
| Editor | Neovim 0.12+, LSP, Tree-sitter, and Vim fallback |
| Terminal | Kitty with Catppuccin themes |
| Multiplexer | tmux with `C-f` prefix and Neovim navigation |
| Automation | Hammerspoon and Karabiner-Elements on macOS |
| Desktop | KDE helpers and Input Remapper on Fedora |
| Tooling | GitHub CLI, Codex CLI, and Pi coding agent |

## Packages

```text
dot/             Small dot command for editing, reloading, and checking
zsh/             Shared shell configuration
nvim/            Shared Neovim configuration
tmux/            Shared tmux configuration and platform profiles
vim/             Minimal fallback editor
kitty/           Kitty terminal configuration
gh/              GitHub CLI configuration without credentials
pi/              Pi coding agent configuration
hammerspoon/     macOS application shortcuts
karabiner/       macOS keyboard remapping
fedora/          Fedora Asahi curl workaround
kde/             KDE launch-or-focus helpers
input-remapper/  Fedora keyboard remapping
server/          Remote development environment manifest
docs/            Platform setup guides
```

## Deployment

The local Mac is configured as the initial Syncthing source. Follow the
[device onboarding guide](docs/syncthing-devices.md) before connecting another
machine. Keep real source files in `~/dotfiles`; install dependencies locally.
The [migration plan](docs/syncthing-migration.md) records the rollout and recovery
procedure. Git history is temporarily retained and excluded from synchronization.

After receiving the complete folder, install GNU Stow and deploy only the
packages needed on the current machine.

### macOS

```bash
brew bundle
stow -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --no-folding -t ~ pi
```

OrbStack is installed by the Brewfile but its generated state is not managed by
this repository.

### Fedora KDE

```bash
stow -t ~ dot fedora kde input-remapper zsh nvim tmux vim kitty gh
```

See [`docs/fedora.md`](docs/fedora.md) for installation, then
[`docs/kde.md`](docs/kde.md) and [`docs/keyboard.md`](docs/keyboard.md) for the
desktop workflow.

### Linux Server

```bash
stow -t ~ dot zsh nvim tmux
```

See [`docs/server.md`](docs/server.md) for user-local tools and remote resource
guidelines.

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
otherwise macOS, Fedora, or a minimal Linux server profile). It does not certify
that every link is already deployed. Zsh checks syntax; Neovim checks formatting
and headless startup against this checkout with installed plugins and temporary
state/cache; Pi runs typechecks and tests for the base config and both local
packages, using the deployed package dependencies when linked to this checkout. Initialize plugins using Bootstrap before the Neovim startup check.

## Bootstrap

After deployment, initialize the managed tools:

```bash
zsh -ilc exit
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
~/.tmux/plugins/tpm/bin/install_plugins
nvim --headless "+Lazy! sync" +qa
npm --prefix ~/.pi/agent ci
npm --prefix ~/.pi/agent/packages-local/pi-teach ci
npm --prefix ~/.pi/agent/packages-local/pi-anki-english ci
```

The optional PDF material converter uses an isolated Python environment:

```bash
/usr/bin/python3 -m venv ~/.pi/agent/packages-local/pi-material-mentor/tools/cii-import/.venv
~/.pi/agent/packages-local/pi-material-mentor/tools/cii-import/.venv/bin/pip install \
  -r ~/.pi/agent/packages-local/pi-material-mentor/tools/cii-import/requirements.txt
```

Run machine-local authentication separately with `gh auth login`, `codex`, and
Pi's `/login` command. On first launch, Codex prompts for a supported sign-in
method. The resulting credentials, sessions, package data, caches, and runtime
state are ignored.

CodeCompanion chat authenticates through ChatGPT when first opened. Its ACP
chat is the single Neovim AI entry point, so no OpenAI API key is required.

## Pi learning tools

Two active local Pi packages keep course-based learning and English Anki
capture separate. `pi-teach` provides stateful HTML lessons, optional local
materials, browser feedback, and decision-grade learning records.
`pi-anki-english` owns the English note model, preview, duplicate checks, and
confirmed Anki writes. The base Pi configuration retains general shell safety,
change tracking, and third-party packages.

Initialize a course, add human-written source material, and start Pi from that
course directory:

```bash
cd ~/Documents/Obsidian/MyVault/Learning/CII
pi
```

Create a compact `MISSION.md`, register trusted sources in `RESOURCES.md`, and
run `/teach`. Each lesson combines explanation, interactive practice, checking,
and feedback in one HTML page. Local materials remain human-owned; browser
answers are saved under `evidence/`, while only insights that change future
teaching become `learning-records/`.

The previous `pi-material-mentor` source remains in the repository during
acceptance but is not loaded in `settings.json`.

## Common Bindings

| Context | Binding | Action |
|---------|---------|--------|
| Zsh | `c` / `d` | Open `~/Developer/Projects` / `~/Developer` |
| Zsh | `o` / `t` / `nv` | Pi / tmux / Neovim |
| tmux | `C-f` | Prefix |
| tmux | `C-f i` | Smart pane split |
| tmux/Neovim | `C-h/j/k/l` | Navigate panes and splits |
| Neovim | `Space a c` / `Space a a` | Toggle AI chat / open AI actions |
| Neovim | `Space a x` | Open files changed by CodeCompanion |
| KDE | `Alt+S` / `Alt+K` | Focus Firefox / Kitty |

Configuration files are symlinked into `$HOME`; edits through either path
update this repository.
