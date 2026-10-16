# Zsh

Type aliases at the prompt, then press Enter. This setup uses vi editing mode.

## Configured aliases

| Alias | Action |
| --- | --- |
| c | Go to ~/Developer/Projects |
| d | Go to ~/Developer |
| dl | Go to ~/Downloads |
| ll | Detailed file listing, including hidden files (eza) |
| lt | Directory tree, two levels deep (eza) |
| lg | Detailed listing with Git status (eza) |
| o | Start Pi |
| t | Start tmux |
| tt | Attach to tmux session 0 |
| nv / v | Start Neovim / Vim |
| sz | Restart Zsh and reload its configuration |

When zoxide is installed, `cd` is aliased to `z`: directory names can match
previously visited locations. Exact paths still work.

## Navigation and history

```sh
cd ..                  # Parent directory
cd -                   # Previous directory
pwd                    # Current directory
history -20            # Show the last 20 history events
command -v python3     # Locate a command
alias                  # List aliases
```

## Prompt editing (vi mode)

- Esc: enter normal mode; `i` / `a`: return to insert mode.
- In normal mode: `0` / `$` moves to the start / end of the line.
- In normal mode: `b` / `w` moves by words; `dd` clears the line.
- In normal mode: `k` / `j` browses older / newer history entries.
- Tab: complete a command or path.
- Ctrl-c: cancel the current input or interrupt a foreground program.
- Ctrl-d at an empty prompt may exit the shell.

## Dotfiles

```sh
dot cheats zsh
dot edit zsh
dot check zsh
```

Run `sz` after editing. Keep credentials and machine-local state out of dotfiles.
