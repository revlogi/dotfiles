# Yazi

Default keys for Yazi 26.9.1. Sequences such as `g h` mean press keys in order.

## Start and exit

```sh
yazi                 # Browse here
yazi ~/Downloads     # Browse another directory
dot cheats yazi       # Read this sheet
```

`q` quits. Launching `yazi` directly does not change your shell directory;
that requires the optional shell wrapper described in the official quick start.

## Navigation and preview

| Keys            | Action                              |
| --------------- | ----------------------------------- |
| h / l           | Parent / child directory            |
| j / k           | Down / up                           |
| g g / G         | First / last entry                  |
| Ctrl-u / Ctrl-d | Half-page up / down                 |
| H / L           | Back / forward in directory history |
| g h / g d / g c | Home / Downloads / ~/.config        |
| g Space         | Enter a destination path            |
| J / K           | Scroll preview down / up            |
| Tab             | Inspect file information            |
| .               | Toggle hidden entries               |

## Selection and file operations

| Keys            | Action                                      |
| --------------- | ------------------------------------------- |
| Space           | Toggle selection and advance                |
| v / V           | Select / deselect a range                   |
| Ctrl-a / Ctrl-r | Select everything / invert selection        |
| Esc             | Clear selection or leave the current mode   |
| o / Enter       | Open                                        |
| O               | Choose an opener                            |
| y / x           | Prepare copy / move                         |
| p               | Paste into this directory                   |
| P               | Paste with overwrite                        |
| Y / X           | Cancel prepared copy/move                   |
| a               | Create; end the name with / for a directory |
| r               | Rename                                      |
| d / D           | Trash / permanently delete                  |
| c c / c f       | Copy path / filename                        |

Example: select with Space, press `y`, navigate elsewhere, then `p`.
Use `x` instead of `y` to move. `D` bypasses Trash.

## Find and filter

| Keys   | Action                             |
| ------ | ---------------------------------- |
| f      | Filter this listing                |
| / / ?  | Find forward / backward            |
| n / N  | Next / previous match              |
| s      | Recursive filename search (fd)     |
| S      | Recursive content search (ripgrep) |
| Ctrl-s | Cancel search                      |
| z / Z  | Jump with fzf / zoxide             |

## Tabs, sorting, and help

| Keys            | Action                                  |
| --------------- | --------------------------------------- |
| t t / t r       | New tab / rename tab                    |
| 1 ... 9         | Select a tab                            |
| [ / ]           | Previous / next tab                     |
| Ctrl-c          | Close tab; last tab exits               |
| , a / , s / , m | Sort by name / size / modification time |
| w               | View background tasks                   |
| ~ / F1          | Show help                               |

In this tmux setup, Ctrl-f is the prefix; use PageDown for Yazi page navigation.
