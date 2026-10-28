[[ -o interactive ]] || return

setopt HIST_IGNORE_ALL_DUPS

bindkey -v

function zle-keymap-select {
  if [[ ${KEYMAP} == vicmd ]]; then
    echo -ne '\e[1 q'
  else
    echo -ne '\e[5 q'
  fi
}
zle -N zle-keymap-select

_fix_cursor() {
   echo -ne '\e[5 q'
}
if (( ${precmd_functions[(I)_fix_cursor]:-0} == 0 )); then
  precmd_functions+=(_fix_cursor)
fi

# Remove path separator from WORDCHARS.
WORDCHARS=${WORDCHARS//[\/]}

ZSH_AUTOSUGGEST_MANUAL_REBIND=1

ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets)

zstyle ':zim:completion' dump_file "${ZDOTDIR:-${HOME}}/.zcompdump"
ZIM_HOME=${ZDOTDIR:-${HOME}}/.zim
# Download zimfw plugin manager if missing.
if [[ ! -e ${ZIM_HOME}/zimfw.zsh ]]; then
  if (( ${+commands[curl]} )); then
    curl -fsSL --create-dirs -o ${ZIM_HOME}/zimfw.zsh \
        https://github.com/zimfw/zimfw/releases/latest/download/zimfw.zsh || \
      wget -nv -O ${ZIM_HOME}/zimfw.zsh \
        https://github.com/zimfw/zimfw/releases/latest/download/zimfw.zsh
  elif (( ${+commands[wget]} )); then
    mkdir -p ${ZIM_HOME} && wget -nv -O ${ZIM_HOME}/zimfw.zsh \
        https://github.com/zimfw/zimfw/releases/latest/download/zimfw.zsh
  else
    print -u2 'zimfw: curl or wget is required for initial installation'
    return 1
  fi
fi
# Install missing modules, and update ${ZIM_HOME}/init.zsh if missing or outdated.
if [[ ! ${ZIM_HOME}/init.zsh -nt ${ZIM_CONFIG_FILE:-${ZDOTDIR:-${HOME}}/.zimrc} ]]; then
  source ${ZIM_HOME}/zimfw.zsh init
fi
source ${ZIM_HOME}/init.zsh

# Quick Navigation
alias c='cd ~/Developer/Projects'
alias d='cd ~/Developer'
alias dl="cd ~/Downloads"
alias ll="eza -lah"
alias lt="eza --tree --level=2"
alias lg="eza -lah --git"

alias tt="tmux a -t 0"

# Core Aliases
alias o='pi'
alias ff='fastfetch'
alias v='vim'
alias sz='exec zsh'
alias nv='nvim'
alias t='tmux'

mkcd() {
  mkdir -p -- "$1" && cd -- "$1"
}

sc() {
  local dir
  dir="$(mktemp -d)" || return
  cd "$dir" || return
  echo "Scratch directory: $dir"
}

port() {
    lsof -nP -iTCP:"$1" -sTCP:LISTEN
}

# Git
alias g='git init'
alias gst='git status -sb'
alias ga='git add .'
alias gl='git log --oneline --graph --decorate -15'

# Compile Aliases
alias cc17='clang -std=c17 -O2 -Wall -Wextra'
alias cdbg='clang -std=c17 -g -O0 -Wall -Wextra -fsanitize=address,undefined'
alias cpp='clang++ -std=c++20 -O2 -Wall -Wextra'
alias cppdbg='clang++ -std=c++20 -g -O0 -Wall -Wextra -fsanitize=address,undefined'

cpprun() {
  local src="$1"
  local out="${src%.*}"

  clang++ -std=c++20 -O2 -Wall -Wextra "$src" -o "$out" &&
    "$([[ "$out" == /* ]] && echo "$out" || echo "./$out")"
}

crun() {
  local src="$1"
  local out="${src%.*}"

  clang -std=c17 -O2 -Wall -Wextra "$src" -o "$out" &&
    "$([[ "$out" == /* ]] && echo "$out" || echo "./$out")"
}



if (( ${+commands[zoxide]} )); then
  eval "$(zoxide init zsh)"
  alias cd='z'
fi

# bun completions
[[ -s "$BUN_INSTALL/_bun" ]] && source "$BUN_INSTALL/_bun"

if [[ "$(uname -s)" == "Darwin" ]]; then
  source "${XDG_CONFIG_HOME:-$HOME/.config}/zsh/macos.zsh"
fi

if [[ -n "$SSH_CONNECTION" ]]; then
  source "${XDG_CONFIG_HOME:-$HOME/.config}/zsh/remote.zsh"
fi
