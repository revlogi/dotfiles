# Neovim configuration

Requires Neovim 0.12+ and Git. All plugins load at startup through `vim.pack`.
There are no deferred plugin loaders, command proxies, or plugin-spec wrappers.

## Startup order

`init.lua` loads editor options, keymaps, autocmds, auto-save, user commands,
and packages. `lua/revlogi/config/pack.lua` lists every package and explicitly
loads its configuration from `lua/revlogi/plugins/`. Dependencies are listed
alongside plugins, not discovered automatically. Treesitter precedes Markdown
rendering; Lazydev and Blink precede LSP setup. Lazydev provides Lua development
support; it is unrelated to lazy.nvim and is also configured at startup.
Filetype overrides live in `filetype.lua` and `after/ftplugin/`, and non-default
LSP server overrides live in `lsp/`.

## Plugin maintenance

On first startup, Neovim asks to install the packages recorded in
`nvim-pack-lock.json`. Subsequent startups use installed packages without
checking for plugin updates. Keep the native lockfile under version control;
do not edit it by hand. The migration preserves all 23 previous plugin revisions.
Blink follows 1.x releases; other packages follow their repository default branch.

Update plugins explicitly:

```vim
:lua vim.pack.update()
```

Review the native update buffer, then use `:write` to accept or `:quit` to
cancel. Restart Neovim after updates. Auto-save ignores this special buffer and
cannot accept updates for you.

After restoring an older lockfile from version control, restart Neovim and run:

```vim
:lua vim.pack.update(nil, { offline = true, target = 'lockfile' })
```

Review and accept the rollback, then restart again. On another machine, use
`target = 'lockfile'` without `offline = true` if the revisions need fetching.

### Builds and external tools

Two native package hooks are retained:

- Telescope FZF: run `make` in the package directory on installation or update,
  waiting for completion. Build failures are reported. Without `make`, Telescope
  falls back to its default sorter. To retry a failed build, run `make` in
  `stdpath('data')/site/pack/core/opt/telescope-fzf-native.nvim` and restart.
- Treesitter: update installed parsers when the plugin updates. Startup still
  installs missing configured parsers; it does not force a parser rebuild.
  Remote sessions retain the reduced parser build concurrency.

Mason's existing missing-tool installation policy is unchanged. Language servers,
formatters, and Treesitter parsers are separate from the plugin lockfile. A fully
provisioned installation can start offline; first-time provisioning needs network
access and the relevant build tools.

## Validation

Run these with this directory selected as Neovim's configuration. If it is named
`~/.config/nvim-next`, set `NVIM_APPNAME=nvim-next`; installed packages and tools
will also use that app's data directory.

```sh
stylua --check .
nvim --headless +qa
nvim --headless '+checkhealth revlogi' +qa
nvim --headless '+luafile tests/smoke.lua' +qa
```

The smoke checks require installed plugins and StyLua. They exercise eager
initialization, commands and mappings, the native FZF sorter when `make` is
available, indentation, explicit format-on-save, auto-save isolation, and remote
clipboard settings. They do not exercise interactive tmux or Racket sessions.
