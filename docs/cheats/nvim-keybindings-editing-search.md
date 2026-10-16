# Neovim

Custom bindings below use **Space** as Leader. Start in normal mode unless noted.

## Files, search, and diagnostics

| Keys | Action |
| --- | --- |
| Space s k | Search key bindings |
| Space s f | Find files |
| Space s g | Search text across files |
| Space s w | Search the word under the cursor |
| Space s . | Recent files |
| Space Space | Browse open buffers |
| Space / | Search within the current buffer |
| - | Open the Oil file browser |
| Space e | Show diagnostic details |
| Space q | Open the diagnostic location list |
| Ctrl-h/j/k/l | Navigate Neovim / tmux splits (plugin) |
| Esc Esc | Leave terminal input mode |

## Everyday editing

| Keys | Action |
| --- | --- |
| i / a | Insert before / after the cursor |
| o / O | Add a line below / above |
| Esc | Return to normal mode; clear search highlighting |
| u / Ctrl-r | Undo / redo |
| yy / p | Copy a line / paste after the cursor |
| dd | Delete a line |
| ciw | Change the current word |
| v / V / Ctrl-v | Character / line / block selection |
| /text Enter | Search forward |
| n / N | Next / previous search match |
| gg / G | First / last line |
| % | Jump to the matching bracket |

## Commands

```vim
:w                  " Save
:q                  " Close the current window
:wq                 " Save and close
:split              " Split top / bottom
:vsplit             " Split left / right
:bn                 " Next buffer
:bp                 " Previous buffer
:help user-manual   " Built-in manual
```
