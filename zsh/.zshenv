# Environment shared by interactive and non-interactive Zsh sessions.
typeset -U path PATH

path=(
  "$HOME/.ghcup/bin"
  "$HOME/.cabal/bin"
  "${CARGO_HOME:-$HOME/.cargo}/bin"
  "$HOME/.local/bin"
  "$HOME/.local/opt/dev-tools/bin"
  "$HOME/.bun/bin"
  $path
)

if [[ "$(uname -s)" == "Linux" ]]; then
  path=("$HOME/.local/opt/nvim/bin" $path)
fi

# Homebrew rustup is keg-only; its bin directory supplies the toolchain proxies.
if [[ -d /opt/homebrew/opt/rustup/bin ]]; then
  path=("${CARGO_HOME:-$HOME/.cargo}/bin" /opt/homebrew/opt/rustup/bin $path)
elif [[ -d /usr/local/opt/rustup/bin ]]; then
  path=("${CARGO_HOME:-$HOME/.cargo}/bin" /usr/local/opt/rustup/bin $path)
fi

export BUN_INSTALL="$HOME/.bun"
