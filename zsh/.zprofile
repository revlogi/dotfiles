if [[ "$(uname -s)" == "Darwin" ]]; then
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

# Racket's macOS installer keeps command-line tools inside its application folder.
if (( ! $+commands[racket] )); then
  for racket_bin in /Applications/Racket*/bin(N); do
    [[ -x "$racket_bin/racket" ]] && path=("$racket_bin" $path)
  done
  unset racket_bin
fi

# Added by swiftly on macOS.
[[ -r "$HOME/.swiftly/env.sh" ]] && source "$HOME/.swiftly/env.sh"
