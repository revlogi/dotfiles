# Environment shared by interactive and non-interactive Zsh sessions.
typeset -U path PATH

path=(
  "$HOME/.local/bin"
  "$HOME/.local/opt/dev-tools/bin"
  "$HOME/.local/share/bob/nvim-bin"
  "$HOME/.bun/bin"
  $path
)

export BUN_INSTALL="$HOME/.bun"
