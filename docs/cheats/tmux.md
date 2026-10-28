# tmux

Prefix: press **Ctrl-f**, release, then press the next key.
Session = a workspace containing windows; window = a tab containing panes.
Replace `work` and paths below with your own names.

## Sessions: commands from the shell

```sh
tmux new-session -s work           # Create and attach to a named session
tmux new-session -s work -c ~/Developer  # Start in a specific directory
tmux new-session -d -s background  # Create without attaching
tmux list-sessions                # List sessions (short form: tmux ls)
tmux attach-session -t work       # Attach from outside tmux
tmux new-session -A -s work       # Attach if it exists; otherwise create
tmux rename-session -t work dev   # Rename work to dev
tmux switch-client -t dev         # Switch sessions from inside tmux
```

Inside tmux, use `Ctrl-f :`, type `new-session -s work`, and press Enter
to create and switch to a new session without nesting tmux.
Detaching keeps programs running; it does not close the session.

## Session and window keys

| Next key | Action |
| --- | --- |
| d | Detach from the session |
| $ | Rename the current session |
| s | Browse sessions and windows |
| ( / ) | Previous / next session |
| c | Create a window in the home directory |
| , | Rename the current window |
| w | Browse windows |
| n / p | Next / previous window |
| 1 ... 9 | Select a window by number |
| l | Return to the last window |
| : | Open the tmux command prompt |

## Panes and navigation

| Next key | Action |
| --- | --- |
| i | Split according to the pane aspect ratio |
| " | Split top / bottom in the current directory |
| % | Split left / right in the current directory |
| z | Toggle pane zoom |
| o | Select the next pane |
| Space | Cycle pane layouts |
| x | Close the current pane after confirmation |

Without a prefix: **Ctrl-h/j/k/l** navigates tmux / Neovim splits (plugin required).
**Shift + arrow keys** resizes panes. `exit` closes the shell in a pane.

## Copy mode and configuration

| Next key | Action |
| --- | --- |
| [ | Enter copy mode; q exits |
| ] | Paste the tmux buffer |
| ? | Open this cheatsheet browser |
| / | Show all tmux key bindings |
| r | Reload tmux configuration |
| K | Clear the screen and scrollback history |
| Ctrl-s | Save session layouts (Resurrect plugin) |
| Ctrl-r | Restore session layouts (Resurrect plugin) |

In copy mode: `v` starts selection, `Ctrl-v` toggles rectangle selection,
and `y` copies and exits. Session snapshots restore layouts, not process memory.

## Session recovery

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
