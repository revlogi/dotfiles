# Dotfiles

Personal configuration synchronized with Syncthing and deployed with GNU Stow.
macOS is the primary environment; portable terminal packages also support Linux servers.

## Stack

| Component | Configuration |
|-----------|---------------|
| Shell | Zsh, Zim, vi mode, zoxide, and fzf |
| Editor | Neovim with LSP and Tree-sitter; Vim fallback |
| Terminal | Kitty with Catppuccin themes |
| Multiplexer | tmux with `C-f` prefix and Neovim navigation |
| Automation | Hammerspoon and Karabiner-Elements on macOS |
| Tooling | GitHub CLI, Codex CLI, and Pi with Anki and engineering packages |
| Maintenance | `dot` command for editing, reloading, checking, and cheatsheets |

## Setup

Follow the [device onboarding guide](docs/syncthing-devices.md) before connecting
another machine. Keep source files in `~/dotfiles`; install dependencies and
configure authentication separately on each machine.

After the complete folder has synced, install GNU Stow and deploy on macOS:

```sh
cd ~/dotfiles
brew bundle
stow -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --no-folding -t ~ pi
```

Pi must use `--no-folding` to keep local state separate from shared configuration.
For existing configurations, follow the guide's backup and conflict-check steps first.

Then [initialize plugins and local dependencies](docs/syncthing-devices.md#5-初始化各机依赖)
and complete machine-local authentication. Credentials, sessions, caches, and
runtime state are excluded from synchronization.

## Daily Use

```sh
dot edit tmux      # Open a configuration file
dot reload tmux    # Reload tmux configuration
dot check         # Run all available checks
dot check nvim    # Check one component
dot cheats        # Browse searchable cheatsheets
dot cheats python # Find a topic
dot help          # Show command usage
```

Configuration files are symlinked into `$HOME`; editing either path updates the
same source. Editing does not automatically reload an application.
See [maintenance](docs/maintenance.md) for command behavior and check limitations.

In tmux, press `Ctrl-f`, then `?` to open cheatsheets, or `Ctrl-f`, then `/` for
all tmux bindings. The cheatsheet browser requires fzf; its tmux popup requires
tmux 3.2+. Run `dot reload tmux` to apply bindings to an existing server.

tmux automatically saves session layouts every 15 minutes while active and
restores on server startup. See [session recovery](docs/cheats/tmux.md#session-recovery)
for manual save/restore and recovery limits.

## Documentation

- [Device onboarding and synchronization](docs/syncthing-devices.md)
- [Configuration maintenance and Pi packages](docs/maintenance.md)
- [Editor setup and language support](docs/editor.md)
- [Searchable cheatsheets](docs/cheats/)
- [Linux server setup](docs/server.md)
- [CUDA development](docs/cuda.md) · [FPGA toolchain](docs/fpga.md)
- [Migration history and recovery plan](docs/syncthing-migration.md)
