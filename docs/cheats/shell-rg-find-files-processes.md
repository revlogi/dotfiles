# Shell commands

Replace sample paths and patterns before running commands.

## Find and inspect files

```sh
pwd                           # Current directory
ls -lah                       # Include hidden files
rg --files                    # List files, respecting ignore rules
rg -n 'TODO' .                # Search text with line numbers
rg -n -g '*.py' 'import' .    # Search only Python files
find . -name '*.cpp'           # Find by filename
less README.md                # Browse text; q exits
tail -n 50 app.log             # Last 50 lines
tail -f app.log                # Follow a log; Ctrl-c stops following
du -sh .                      # Directory size
df -h .                       # Filesystem space
command -v clang               # Locate a command
```

## Jobs and processes

```sh
jobs                          # Jobs in the current shell
fg                            # Resume the current job in the foreground
ps -ef                        # List processes
```

Ctrl-z suspends a foreground job; `fg` resumes it.
Ctrl-c interrupts a foreground program.

## Configuration maintenance

```sh
dot edit tmux
dot reload tmux
dot check
dot cheats python
```
