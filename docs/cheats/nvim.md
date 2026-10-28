# Neovim

Custom bindings below use **Space** as Leader. Start in normal mode unless noted.

## Files, search, and diagnostics

| Keys        | Action                            |
| ----------- | --------------------------------- |
| Space s k   | Search key bindings               |
| Space s f   | Find files                        |
| Space s g   | Search text across files          |
| Space s w   | Search the word under the cursor  |
| Space s .   | Recent files                      |
| Space Space | Browse open buffers               |
| Space /     | Search within the current buffer  |
| Space e     | Show diagnostic details           |
| Space q     | Open the diagnostic location list |
| Esc Esc     | Leave terminal input mode         |

## Everyday editing

| Keys           | Action                             |
| -------------- | ---------------------------------- |
| ciw            | Change the current word            |
| v / V / Ctrl-v | Character / line / block selection |
| gg / G         | First / last line                  |
| gra            | Code Action                        |
| %              | Jump to the matching bracket       |

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

## AI chat

| Keys | Action |
| --- | --- |
| Space a c | Toggle AI chat |
| Space a a | Open AI actions |
| Space a x | Open files changed by CodeCompanion |

For language tools and authentication, see [Editor setup](../editor.md).
