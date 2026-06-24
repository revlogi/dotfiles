# Neovim Configuration — User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & First Run](#installation--first-run)
3. [Editor Basics](#editor-basics)
4. [File Management](#file-management)
5. [Searching & Finding](#searching--finding)
6. [Coding Intelligence](#coding-intelligence)
7. [Formatting & Linting](#formatting--linting)
8. [Git Integration](#git-integration)
9. [Debugging](#debugging)
10. [Navigation](#navigation)
11. [Surround & Text Objects](#surround--text-objects)
12. [Other Features](#other-features)
13. [Customization Guide](#customization-guide)
14. [Keybinding Quick Reference](#keybinding-quick-reference)

---

## Introduction

This Neovim configuration is based on [Kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim) — a lean, modular, and well-documented starting point. The configuration uses **[lazy.nvim](https://github.com/folke/lazy.nvim)** as its plugin manager and organizes all plugin specifications as individual files under `lua/custom/plugins/`.

**Key design principles:**

- **Leader key**: <kbd>Space</kbd> (press and release, then press the next key)
- **Nerd Font**: Required for icons in the statusline, file tree, completion menu, and diagnostics
- **Modular**: Each plugin has its own file for easy addition, removal, or tweaking
- **Auto-configured**: LSP servers and formatters install automatically via Mason on first run

---

## Installation & First Run

### Prerequisites

- **Neovim >= 0.10** (`nvim --version`)
- **A Nerd Font** installed and set as your terminal font (e.g. JetBrainsMono Nerd Font, FiraCode Nerd Font)
- System tools:
  - `git` — for cloning plugins
  - `make`, `unzip` — for building/compressing plugins
  - `rg` (ripgrep) — for Telescope live-grep performance

### First Launch

1. Clone or symlink this config to `~/.config/nvim/`
2. Run `nvim` in a terminal
3. **lazy.nvim** bootstraps itself on first launch
4. Once lazy.nvim loads, all plugins install automatically (may take 1–2 minutes)
5. **Mason** auto-installs the following tools:

| LSP Server | Language | Formatter | Language |
|---|---|---|---|
| `lua_ls` | Lua | `stylua` | Lua |
| `ts_ls` | TypeScript/JavaScript | — | — |
| `jsonls` | JSON | — | — |
| `pyright` | Python | — | — |
| `vimls` | Vimscript | — | — |
| `clangd` | C/C++ | `clang-format` | C/C++ |
| `sourcekit-lsp` | Swift/ObjC | `swiftformat` | Swift |

6. Run `:checkhealth` (or `:checkhealth kickstart`) to verify everything is working

### Updating Plugins

- `:Lazy` — open the lazy.nvim dashboard
- `U` — update all plugins
- `S` — sync (install missing, remove unused)
- `C` — check for updates
- `X` — clean unused plugins

---

## Editor Basics

### Core Settings

| Feature | Behavior |
|---|---|
| **Line numbers** | Absolute + relative (`1  <cursor>  3  4`) |
| **Mouse** | Enabled in all modes (click to place cursor, drag to resize splits) |
| **System clipboard** | Yank/paste syncs with macOS system clipboard |
| **Persistent undo** | Undo history survives editor restarts (`undofile`) |
| **Smart search** | Case-insensitive by default, case-sensitive when uppercase is typed (`ignorecase` + `smartcase`) |
| **Live preview** | `:s/substitution` shows real-time preview (`inccommand=split`) |
| **Sign column** | Always visible (prevents layout jitter when LSP diagnostics appear) |
| **Cursor line** | Highlighted (`cursorline`) |
| **Scroll off** | 10 lines of padding above/below cursor (`scrolloff=10`) |
| **Whitespace** | Visible tabs (`»·`), trailing spaces (`·`), and non-breaking spaces (`␣`) |

### Auto-Save

Modified, named buffers are automatically saved when you leave **Insert mode**. No more `:w` after every edit.

### Filetype-Specific Indentation

| Filetype(s) | Indentation |
|---|---|
| C, C++ | 4 spaces, smart indent |
| Lua | 2 spaces |
| All others | Auto-detected by guess-indent.nvim |

### Exiting Terminal Mode

<kbd>Esc</kbd><kbd>Esc</kbd> (double-tap Escape) exits terminal mode and returns to normal mode.

### Clearing Search Highlights

<kbd>Esc</kbd> in normal mode clears the `hlsearch` highlight.

---

## File Management

This configuration provides **two** file explorers — choose the one that fits your workflow.

### Oil.nvim (Primary)

Oil is a directory editor: directories open as editable buffers. Rename, delete, create, copy, and move files using Vim editing commands.

| Key | Action |
|---|---|
| `-` | Open parent directory in a floating window |
| `<leader>e` | Open current file's directory |

Inside an Oil buffer:

- **Rename** a file: edit its name on the line and save (`:w`)
- **Create** a file/directory: add a new line with the path
- **Delete** a file: delete its line (e.g. `dd`), then save
- **Move** a file: cut a line (`dd`), paste it elsewhere (`p`), then save

Oil respects `.gitignore` patterns and shows hidden files by default.

### Neo-tree (Sidebar File Tree)

A traditional sidebar file explorer.

| Key | Action |
|---|---|
| `\` | Reveal current file in the tree / toggle tree |

Inside the Neo-tree window:

| Key | Action |
|---|---|
| `\` | Close the tree |
| `a` | Add file/directory |
| `d` | Delete |
| `r` | Rename |
| `m` | Move |
| `c` | Copy |
| `H` | Toggle hidden files |
| `R` | Refresh |
| `<CR>` | Open file |
| `s` | Open in vertical split |
| `S` | Open in horizontal split |

---

## Searching & Finding

Telescope.nvim provides fuzzy finding across every dimension of your project. All search keybindings start with `<leader>s`.

### File & Text Search

| Key | Action |
|---|---|
| `<leader>sf` | Find files (by name) |
| `<leader>sg` | Live grep (search file contents) |
| `<leader>sw` | Search for word under cursor |
| `<leader>s/` | Live grep across open files only |
| `<leader>/` | Fuzzy search in current buffer |
| `<leader><leader>` | Switch between open buffers |
| `<leader>s.` | Recent files (`.` for history) |

### Code & Diagnostics Search

| Key | Action |
|---|---|
| `<leader>sh` | Search help tags |
| `<leader>sk` | Search keymaps |
| `<leader>ss` | Search Telescope pickers |
| `<leader>sd` | Search diagnostics across workspace |
| `<leader>sn` | Search Neovim config files |
| `<leader>sr` | Resume last search |

### Telescope UI Controls

| Key | Action |
|---|---|
| `<C-n>` / `<Down>` | Next item |
| `<C-p>` / `<Up>` | Previous item |
| `<C-j>` / `<C-k>` | Next/previous in preview |
| `<C-u>` / `<C-d>` | Page up/down |
| `<CR>` | Open selected |
| `<C-v>` | Open in vertical split |
| `<C-x>` | Open in horizontal split |
| `<C-t>` | Open in new tab |
| `<C-l>` | Toggle live-grep mode |
| `<Esc>` | Close |

---

## Coding Intelligence

### LSP (Language Server Protocol)

LSP provides IDE-like features: go-to-definition, find references, rename, hover documentation, code actions, and diagnostics.

**Enabled language servers:**

| Server | Languages | Auto-installed |
|---|---|---|
| `clangd` | C, C++ | Yes |
| `lua_ls` | Lua | Yes |
| `pyright` | Python | Yes |
| `ts_ls` | TypeScript, JavaScript | Yes |
| `jsonls` | JSON | Yes |
| `vimls` | Vimscript | Yes |
| `sourcekit-lsp` | Swift, Objective-C, ObjC++ | Via Xcode |

### LSP Keybindings

All LSP commands are prefixed with `g` for "goto" or use the leader key.

#### Navigation

| Key | Action |
|---|---|
| `grd` | Go to **d**efinition |
| `grD` | Go to **d**eclaration |
| `grr` | Go to **r**eferences |
| `gri` | Go to **i**mplementation |
| `grt` | Go to **t**ype definition |
| `gO` | Browse **d**ocument symbols (outline) |
| `gW` | Browse **w**orkspace symbols (global symbol search) |

#### Refactoring & Info

| Key | Action |
|---|---|
| `grn` | **R**e**n**ame symbol (all references) |
| `gra` | Code **a**ctions (quick-fix, import, extract, etc.) |
| `<leader>k` | **H**over documentation (press again to enter the float for scrolling) |
| `<leader>th` | Toggle inlay **h**ints (type annotations, parameter names) |
| `<leader>e` | Show floating **d**iagnostic for the current line |
| `<leader>q` | Open all diagnostics in the quickfix list |

### Completion (blink.cmp)

Blink.cmp provides blazing-fast autocompletion as you type. It sources suggestions from LSP, file paths, and LuaSnip snippets.

| Key (in Insert mode) | Action |
|---|---|
| `<Tab>` | Select next completion / jump to next snippet placeholder |
| `<S-Tab>` | Select previous completion / jump to previous snippet placeholder |
| `<CR>` (Enter) | Accept the selected completion |
| `<C-Space>` | Toggle the completion menu |

When the completion menu is visible, documentation for the selected item appears automatically after 500ms.s

### Diagnostics

Diagnostic signs appear in the gutter (sign column):

| Icon | Meaning |
|---|---|
| `󰅚` | Error |
| `` | Warning |
| `` | Information |
| `󰌶` | Hint |

Errors and warnings are not shown inline (virtual text disabled) — hover with `<leader>k` or use `<leader>e` to see details for a specific line. Use `<leader>q` to populate the quickfix list with all diagnostics.

---

## Formatting & Linting

### Format on Save

Buffers are automatically formatted on save. No manual action needed. Press `<leader>f` to format on demand.

**Formatters in use:**

| Filetype | Formatter |
|---|---|
| Lua | stylua |
| C, C++ | clang-format |
| Swift | swiftformat |

### Clang-Format Style

C/C++ formatting follows a Google-based style with 4-space indentation and a 100-character column limit. The config file lives at `.clang-format` in the Neovim config directory.

### Linting

The linting framework (`nvim-lint`) is installed but no linters are currently configured. To add one, edit `lua/custom/plugins/lint.lua` and add entries to `linters_by_ft`. For example:

```lua
linters_by_ft = {
  python = { 'mypy' },
  javascript = { 'eslint_d' },
}
```

Linting runs on `BufEnter`, `BufWritePost`, and `InsertLeave`.

---

## Git Integration

Gitsigns provides Git decorations in the sign column and a complete set of hunk operations. All Git commands use the `<leader>h` prefix.

### Hunk Navigation

| Key | Action |
|---|---|
| `]c` | Jump to next git change |
| `[c` | Jump to previous git change |

### Staging & Resetting

| Key | Action |
|---|---|
| `<leader>hs` | Stage the hunk under cursor |
| `<leader>hr` | Reset (unstage) the hunk under cursor |
| `<leader>hS` | Stage the entire buffer |
| `<leader>hR` | Reset the entire buffer |
| `<leader>hu` | Undo the last stage hunk |

**Visual mode** (`V` or `v` to select lines, then):

| Key | Action |
|---|---|
| `<leader>hs` | Stage only the selected lines |
| `<leader>hr` | Reset only the selected lines |

### Viewing Changes

| Key | Action |
|---|---|
| `<leader>hp` | Preview hunk in a floating window |
| `<leader>hd` | Diff buffer against the index (staged changes) |
| `<leader>hD` | Diff buffer against HEAD (last commit) |
| `<leader>hb` | Show git blame for the current line |

### Toggles

| Key | Action |
|---|---|
| `<leader>tb` | Toggle inline git blame for the current line |
| `<leader>tD` | Toggle showing deleted lines |

### Statusline

The statusline shows the current Git branch on the left side.

---

## Debugging

The Debug Adapter Protocol (DAP) integration provides step-through debugging with a dedicated UI. **Go** support is pre-configured via Delve.

### Control Keys

| Key | Action |
|---|---|
| `<F5>` | Start / Continue |
| `<F1>` | Step into |
| `<F2>` | Step over |
| `<F3>` | Step out |
| `<leader>b` | Toggle breakpoint at cursor |
| `<leader>B` | Set conditional breakpoint (prompts for condition) |
| `<F7>` | Toggle the debug UI panel |

### Debug UI

When a debug session starts, the DAP UI automatically opens showing:

- **Breakpoints** panel
- **Call stack** panel
- **Variables** and **watches** panels
- **Scopes** (local, global, closure variables)

The UI closes automatically when the debug session ends.

### Go Debugging

For Go projects, launching `<F5>` will:

1. Start the Delve debugger
2. Attach to the current file
3. Open the debug UI

Make sure `delve` is installed (`go install github.com/go-delve/delve/cmd/dlv@latest`). Mason auto-installs it if needed.

---

## Navigation

### Tmux Pane Navigation

Seamlessly navigate between Neovim splits and tmux panes using the same keybindings. The current `<C-h/j/k/l>` target (Vim split or tmux pane) is determined automatically.

| Key | Action |
|---|---|
| `<C-h>` | Navigate left |
| `<C-j>` | Navigate down |
| `<C-k>` | Navigate up |
| `<C-l>` | Navigate right |
| `<C-\>` | Navigate to previous pane |

### Window & Split Management

Neovim splits open predictably:

| Behavior | Setting |
|---|---|
| Vertical splits (`:vsplit`) | Open on the **right** |
| Horizontal splits (`:split`) | Open **below** |

Use standard Vim window commands:

| Command | Action |
|---|---|
| `<C-w>v` | Vertical split |
| `<C-w>s` | Horizontal split |
| `<C-w>c` | Close window |
| `<C-w>o` | Close all other windows |
| `<C-w>=` | Equalize window sizes |

---

## Surround & Text Objects

### Mini Surround

Add, delete, or change surrounding characters (brackets, quotes, tags, etc.) — similar to vim-surround.

| Key | Action | Example |
|---|---|---|
| `sa` + textobject + char | **A**dd surrounding | `saiw"` → surrounds word with `"` |
| `sd` + char | **D**elete surrounding | `sd"` → removes surrounding `"` |
| `sr` + old + new | **R**eplace surrounding | `sr"'` → changes `"` to `'` |

### Mini AI (Text Objects)

Enhanced text objects that work across more constructs:

| Text Object | Selects |
|---|---|
| `a(` / `i(` `a[` / `i[` `a{` / `i{` | Parentheses, brackets, braces |
| `a"` / `i"` `a'` / `i'` | Double/single quoted strings |
| `a>` / `i>` | Angle brackets / HTML tags |
| `at` / `it` | Between semantic delimiters (commas, semicolons) |
| `af` / `if` | Function call arguments |
| `aF` / `iF` | Function call with name |

Use with any Vim operator: `da"` deletes surrounding quotes, `ci(` changes inside parentheses, `yaf` yanks a function call.

---

## Other Features

### Auto Pairs

Brackets, parentheses, quotes, and backticks close automatically when typed. Pairs are also deleted together when backspacing the opening character.

### Indentation Guides

Vertical lines show indentation levels, making deeply nested code easier to read. Enabled globally by indent-blankline.nvim.

### TODO Highlights

Comments containing keywords are highlighted with distinct colors:

| Keyword | Meaning |
|---|---|
| `TODO` | Task to do |
| `FIXME` | Bug to fix |
| `HACK` | Workaround |
| `WARNING` | Caution needed |
| `PERF` | Performance concern |
| `NOTE` | Informational note |
| `TESTING` | Testing-related |
| `XXX` | Critical issue |

### Which-Key

Press `<leader>` and wait (or press it twice) to see a popup listing all available leader-key combinations.

| Group | Description |
|---|---|
| `<leader>s` | [S]earch |
| `<leader>t` | [T]oggle |
| `<leader>h` | Git [H]unk |

### Colorscheme

[Catppuccin](https://github.com/catppuccin/nvim) with automatic light/dark detection:
- **Light mode**: Latte
- **Dark mode**: Mocha

Flavour follows your terminal/macOS appearance setting.

### LeetCode

Browse and solve LeetCode problems directly in Neovim. Configured for Python 3 by default.

---

## Customization Guide

### File Layout

```
~/.config/nvim/
├── init.lua                  # Entry point, editor settings, autocommands
├── lazy-lock.json            # Locked plugin versions (auto-generated)
├── lua/
│   ├── kickstart/health.lua  # Health check
│   ├── lsp/
│   │   ├── init.lua          # LSP attach, diagnostic config, keymaps
│   │   ├── capabilities.lua  # LSP capabilities (blink.cmp)
│   │   └── *.lua             # Per-server LSP configs
│   └── custom/plugins/
│       └── *.lua             # One file per plugin
```

### Adding a New Plugin

Create a new file in `lua/custom/plugins/`, e.g. `lua/custom/plugins/harpoon.lua`:

```lua
return {
  'ThePrimeagen/harpoon',
  branch = 'harpoon2',
  dependencies = { 'nvim-lua/plenary.nvim' },
  config = function()
    local harpoon = require('harpoon')
    harpoon:setup()
    vim.keymap.set('n', '<leader>a', function() harpoon:list():add() end)
    vim.keymap.set('n', '<leader>m', function() harpoon.ui:toggle_quick_menu(harpoon:list()) end)
  end,
}
```

Run `:Lazy sync` or restart Neovim to install. No other files need to be edited.

### Adding an LSP Server

1. **Install the server** — edit `lua/custom/plugins/lspconfig.lua`, add the server name to the `ensure_installed` list in the `mason-lspconfig` config.
2. **(Optional) Create a server config** — create `lua/lsp/<name>.lua` with custom settings. The `lspcode.lua` plugin file will automatically pick it up.

### Changing Colorscheme

Edit `lua/custom/plugins/catppuccin.lua`:

```lua
{
  'catppuccin/nvim',
  name = 'catppuccin',
  opts = {
    flavour = 'mocha',              -- force dark mode
    -- flavour = 'latte',           -- force light mode
    -- flavour = 'auto',            -- follow system (default)
    transparent_background = true,   -- for transparent terminal backgrounds
  },
}
```

### Adjusting Formatting

- **clang-format**: Edit `.clang-format` at the root of the Neovim config
- **stylua**: Edit `.stylua.toml` at the root of the Neovim config
- **Disable format-on-save**: In `lua/custom/plugins/conform.lua`, set `format_on_save = false`

### Keybinding Conflicts

If a plugin's keybinding clashes with another, both are often still accessible. Use `<leader>sk` to search all registered keymaps and find the one you need.

---

## Keybinding Quick Reference

### Leader `<Space>` Keymaps

| Key | Category | Action |
|---|---|---|
| `<leader>e` | Files | Open current directory (Oil) |
| `<leader>f` | Format | Format buffer |
| `<leader>k` | LSP | Hover documentation |
| `<leader>q` | LSP | Open diagnostic quickfix list |
| `<leader>th` | LSP | Toggle inlay hints |

### Search (`<leader>s`)

| Key | Action |
|---|---|
| `<leader>sf` | Find files |
| `<leader>sg` | Live grep |
| `<leader>sw` | Search word under cursor |
| `<leader>sh` | Search help |
| `<leader>sk` | Search keymaps |
| `<leader>sd` | Search diagnostics |
| `<leader>sr` | Resume last search |
| `<leader>ss` | Select Telescope picker |
| `<leader>s.` | Recent files |
| `<leader>s/` | Search open files |
| `<leader>sn` | Search Neovim config |
| `<leader>/` | Fuzzy search in buffer |
| `<leader><leader>` | Switch buffers |

### Git Hunk (`<leader>h`)

| Key | Action |
|---|---|
| `<leader>hs` | Stage hunk |
| `<leader>hr` | Reset hunk |
| `<leader>hS` | Stage buffer |
| `<leader>hR` | Reset buffer |
| `<leader>hu` | Undo stage hunk |
| `<leader>hp` | Preview hunk |
| `<leader>hb` | Blame line |
| `<leader>hd` | Diff against index |
| `<leader>hD` | Diff against HEAD |

### Toggle (`<leader>t`)

| Key | Action |
|---|---|
| `<leader>th` | Toggle LSP inlay hints |
| `<leader>tb` | Toggle git blame line |
| `<leader>tD` | Toggle git deleted lines |

### LSP Navigation (`g` prefix)

| Key | Action |
|---|---|
| `grn` | Rename |
| `gra` | Code action |
| `grd` | Go to definition |
| `grD` | Go to declaration |
| `grr` | Go to references |
| `gri` | Go to implementation |
| `grt` | Go to type definition |
| `gO` | Document symbols |
| `gW` | Workspace symbols |

### Debugging

| Key | Action |
|---|---|
| `<F5>` | Start / Continue |
| `<F1>` | Step into |
| `<F2>` | Step over |
| `<F3>` | Step out |
| `<F7>` | Toggle debug UI |
| `<leader>b` | Toggle breakpoint |
| `<leader>B` | Conditional breakpoint |

### Navigation

| Key | Action |
|---|---|
| `<C-h>` | Left pane |
| `<C-j>` | Down pane |
| `<C-k>` | Up pane |
| `<C-l>` | Right pane |
| `<C-\>` | Previous pane |
| `-` | Parent directory (Oil) |
| `\` | Neo-tree reveal/toggle |

### Completion (Insert Mode)

| Key | Action |
|---|---|
| `<Tab>` | Next / snippet forward |
| `<S-Tab>` | Previous / snippet backward |
| `<CR>` | Accept |
| `<C-Space>` | Toggle menu |

---

*Last updated: 2026-05 · Generated from configuration files in `~/.config/nvim/`*
