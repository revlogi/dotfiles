# Dotfiles

Cross-platform configuration synchronized with Syncthing and deployed with GNU Stow.
macOS is the primary environment; portable terminal packages also support Linux servers.

## Stack

| Component | Configuration |
|-----------|---------------|
| Shell | Zsh, Zim, vi mode, zoxide, and fzf |
| Editor | Neovim 0.12+, LSP, Tree-sitter, and Vim fallback |
| Terminal | Kitty with Catppuccin themes |
| Multiplexer | tmux with `C-f` prefix and Neovim navigation |
| Automation | Hammerspoon and Karabiner-Elements on macOS |
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
server/          Remote development environment manifest
docs/            Platform setup guides
```

## Deployment

The local Mac is configured as the initial Syncthing source. Follow the
[device onboarding guide](docs/syncthing-devices.md) before connecting another
machine. Keep real source files in `~/dotfiles`; install dependencies locally.
The [migration plan](docs/syncthing-migration.md) records the rollout and recovery
procedure. This checkout no longer contains Git history; `.git` remains excluded from synchronization.

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
otherwise macOS or a minimal Linux server profile). It does not certify
that every link is already deployed. Zsh checks syntax; Neovim checks formatting
and headless startup against this checkout with installed plugins and temporary
state/cache; Pi runs typechecks and tests for the base config and local
packages that define a check script, using the deployed package dependencies when linked to this checkout. Initialize plugins using Bootstrap before the Neovim startup check.

## Bootstrap

After deployment, initialize the managed tools:

```bash
zsh -ilc exit
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
~/.tmux/plugins/tpm/bin/install_plugins
nvim --headless "+Lazy! sync" +qa
npm --prefix ~/.pi/agent ci
npm --prefix ~/.pi/agent/packages-local/pi-anki-english ci
```

Run machine-local authentication separately with `gh auth login`, `codex`, and
Pi's `/login` command. On first launch, Codex prompts for a supported sign-in
method. The resulting credentials, sessions, package data, caches, and runtime
state are ignored.

CodeCompanion chat authenticates through ChatGPT when first opened. Its ACP
chat is the single Neovim AI entry point, so no OpenAI API key is required.

## Pi local packages

`pi-anki-english` provides English Anki capture, preview, duplicate checks, and
confirmed writes. `pi-engineering-workflow` provides engineering skills and
prompts. The base Pi configuration retains shell safety, change tracking, and
third-party packages.

## tmux session recovery

[tmux-resurrect](https://github.com/tmux-plugins/tmux-resurrect) saves sessions,
windows, pane layouts, and working directories.
[tmux-continuum](https://github.com/tmux-plugins/tmux-continuum) saves every
15 minutes while tmux is active and restores on tmux server startup.

- Save now: `Ctrl-f`, then `Ctrl-s`.
- Restore manually: `Ctrl-f`, then `Ctrl-r`.
- After a reboot, open a terminal and run `tmux`; the last snapshot restores.
- On another machine, install the plugins using `Ctrl-f`, then uppercase `I`.

Snapshots live in `~/.local/state/tmux/resurrect`, outside the synchronized
repository. Pane contents are not captured. Keep the status bar enabled and
Continuum last in the plugin list so automatic saving keeps working. Reloading
configuration does not trigger automatic restore. Save manually before a planned
shutdown to include changes since the last automatic save.

Supported programs may be relaunched using Resurrect's default allowlist; this
does not resume process memory, running jobs, or Neovim's internal buffer/session
state. Existing tmux servers are not restarted by setup.

## Editor scope

Neovim configures Python, C/C++, JavaScript/TypeScript (including JSX/TSX),
Swift on macOS, Verilog/SystemVerilog, Lua, and Vimscript/vimrc. Lua includes
LazyDev completion and StyLua formatting. HTML/CSS and Markdown have Tree-sitter
highlighting and Prettierd formatting; Markdown rendering also supports AI chat.
JSON/JSONC, HTML, and CSS have language servers for completion and diagnostics.
POSIX/Bash scripts use Bash Language Server, ShellCheck, shfmt, and Tree-sitter.
Zsh keeps native syntax highlighting; use `:ZshCheck` to check the current unsaved
buffer with `zsh -f -n`. Bash language tooling and shfmt are not enabled for Zsh.

On macOS, `brew bundle` supplies Node/npm, Bun for Pi tests, the Tree-sitter CLI,
and SwiftFormat. Swift support also requires `xcrun sourcekit-lsp` from the local
Swift/Xcode toolchain. Mason installs missing language servers, shfmt, ShellCheck,
and Prettierd when Neovim starts; inspect progress with `:Mason` and check tools
with `:checkhealth dotfiles` and `:ConformInfo`.

Remote Linux retains its small automatic-install list (Lua/C++ and their
formatters). For optional web/shell editing, install Node/npm on that host and use
`:MasonInstall json-lsp html-lsp css-lsp bash-language-server shellcheck shfmt prettierd`.
 Oil is the file manager (`-`); Telescope provides
search. `<leader>e` always shows diagnostics. Vim is a plugin-free fallback.

### Haskell

Haskell files use Tree-sitter highlighting and Haskell Language Server (HLS)
for completion, diagnostics, and navigation. Ordinary Haskell files use standalone
Ormolu for formatting, independently of HLS project loading. `<leader>f` and
explicit saves use Ormolu for `.hs` and HLS for `.lhs`; other languages retain their
existing formatter settings. Haskell uses two-space indentation and expands tabs to spaces.

Install a compatible GHC/Cabal/HLS toolchain with
[GHCup](https://www.haskell.org/ghcup/). Once GHCup is installed:

```bash
ghcup install ghc recommended --set
ghcup install cabal recommended --set
ghcup install hls recommended --set
```

Zsh includes `~/.ghcup/bin` and `~/.cabal/bin` in PATH. Open Neovim from the
Cabal/Stack project directory after restarting the shell. HLS is enabled when
`haskell-language-server-wrapper` is available; Mason does not manage it.
For an existing project, choose a GHC version supported by its dependencies and
an HLS build that supports that GHC. Install standalone Ormolu on macOS with `brew install ormolu`; on Linux,
install `ormolu` with your package manager or Cabal. Literate Haskell still
uses HLS for formatting.
Use `ghc --version`, `cabal --version`, and `haskell-language-server-wrapper
--version` to check the toolchain, and `:checkhealth vim.lsp` for editor attachment.
Toolchains and build outputs stay machine-local.

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

Configuration files are symlinked into `$HOME`; edits through either path
update this repository.

## Searchable cheatsheets

Run `dot cheats` (or `dot cheats python`) in any terminal. In tmux, press
`Ctrl-f`, then `?` to open a popup; `Ctrl-f /` shows the full tmux binding list.
Apply the binding to an existing server with `dot reload tmux`.
The popup requires tmux 3.2+; the terminal command works without tmux.

Search topic filenames, select with Up/Down, scroll the preview with Ctrl-d/u,
and close with Enter or Esc. This is a read-only reference; commands are never
executed or inserted. fzf is required; Glow renders Markdown to fit the preview
width using a dark terminal theme. Without Glow, bat/batcat provides source
highlighting, falling back to plain text. The Brewfile includes fzf, Glow, and bat;
on Linux install `glow` with your package manager to enable rendered previews.

Add Markdown files directly under `docs/cheats/`; use descriptive filenames
(including search keywords). English sheets cover tmux sessions/windows/panes,
Zsh, Neovim, shell commands, Git, C/C++ flags, and Python project setup.
For example, `dot cheats tmux` opens the session-management reference. These files use the existing
Syncthing docs root and the existing Stow `dot` package, with no extra deployment.
