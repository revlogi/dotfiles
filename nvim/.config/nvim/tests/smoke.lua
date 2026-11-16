-- Run with this configuration: nvim --headless '+luafile tests/smoke.lua' +qa
local ok, err = xpcall(function()
  assert(vim.v.errmsg == '', vim.v.errmsg)
  assert(not package.loaded.lazy, 'lazy.nvim must not be loaded')

  -- These must already be configured, without opening a file or entering insert mode.
  for _, name in ipairs { 'conform', 'nvim-autopairs', 'render-markdown', 'lazydev', 'blink.cmp', 'telescope', 'which-key', 'todo-comments' } do
    assert(package.loaded[name], name .. ' was not loaded at startup')
  end
  for _, name in ipairs { 'Oil', 'ConformInfo', 'TmuxNavigateLeft', 'AutoSaveToggle', 'ZshCheck' } do
    assert(vim.fn.exists(':' .. name) == 2, name .. ' command is missing')
  end
  for _, key in ipairs { '<leader>f', '<leader>sf', '<C-h>', '<C-j>', '<C-k>', '<C-l>', '<C-\\>' } do
    assert(vim.fn.maparg(key, 'n') ~= '', key .. ' mapping is missing')
  end

  assert(vim.g.colors_name == 'catppuccin-mocha' or vim.g.colors_name == 'catppuccin-latte')
  assert(vim.lsp.is_enabled 'lua_ls')
  assert(vim.lsp.config.lua_ls.capabilities.textDocument.completion.completionItem.snippetSupport)
  assert(package.loaded['telescope._extensions.ui-select'], 'Telescope UI-select extension is missing')
  if vim.fn.executable 'make' == 1 then
    assert(package.loaded['telescope._extensions.fzf'], 'Telescope FZF extension did not load')
    local fzf = require 'fzf_lib'
    local pattern, slab = fzf.parse_pattern 'ab', fzf.allocate_slab()
    local score = fzf.get_score('abc', pattern, slab)
    fzf.free_pattern(pattern)
    fzf.free_slab(slab)
    assert(score > 0, 'Native FZF sorter is not working')
  end

  -- Filetype settings must survive eager plugin initialization.
  for ft, width in pairs { c = 4, cpp = 4, lua = 2, haskell = 2, lhaskell = 2, racket = 2, verilog = 4, systemverilog = 4 } do
    vim.cmd.enew()
    vim.bo.filetype = ft
    assert(vim.bo.shiftwidth == width and vim.bo.tabstop == width, ft .. ' indentation changed')
    if ft == 'racket' then
      assert(vim.fn.maparg('<leader>rr', 'n') ~= '')
      assert(vim.fn.maparg('<leader>ri', 'n') ~= '')
    end
  end
  assert(vim.filetype.match { filename = 'test.cuh' } == 'cuda')
  assert(vim.filetype.match { filename = 'test.v' } == 'verilog')

  -- Exercise the real write pipeline, not just the formatter configuration.
  local path = vim.fn.tempname() .. '.lua'
  vim.fn.writefile({ 'local value = 0' }, path)
  vim.cmd.edit(vim.fn.fnameescape(path))
  local writes = 0
  vim.api.nvim_create_autocmd({ 'BufWritePre', 'BufWritePost' }, {
    buffer = 0,
    callback = function()
      writes = writes + 1
    end,
  })
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { 'local value={1,2}' })
  vim.api.nvim_exec_autocmds('InsertLeave', { buffer = 0 })
  assert(vim.fn.readfile(path)[1] == 'local value={1,2}', 'Auto-save unexpectedly formatted the file')
  assert(writes == 0, 'Auto-save invoked explicit-write hooks')
  vim.cmd.AutoSaveDisable()
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { 'local value={3,4}' })
  vim.api.nvim_exec_autocmds('InsertLeave', { buffer = 0 })
  assert(vim.fn.readfile(path)[1] == 'local value={1,2}', 'Disabled auto-save still wrote the file')
  vim.cmd.AutoSaveEnable()
  vim.cmd.write()
  assert(writes == 2, 'Explicit write did not invoke write hooks')
  assert(vim.fn.readfile(path)[1] == 'local value = { 3, 4 }', 'Explicit write did not run StyLua')
  vim.cmd.bwipeout()
  vim.fn.delete(path)

  -- Native update review buffers must never be accepted by auto-save.
  vim.cmd.enew()
  vim.api.nvim_buf_set_name(0, 'nvim-pack://smoke-test')
  vim.bo.buftype = 'acwrite'
  local accepted = false
  vim.api.nvim_create_autocmd('BufWriteCmd', {
    buffer = 0,
    callback = function()
      accepted = true
    end,
  })
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { 'pending update' })
  vim.api.nvim_exec_autocmds('InsertLeave', { buffer = 0 })
  assert(not accepted, 'Auto-save accepted a package update')
  vim.cmd 'bwipeout!'

  vim.wait(50)
  assert(vim.o.clipboard == 'unnamedplus')
  if require('custom.utils.platform').is_remote then
    assert(vim.g.clipboard.name == 'OSC 52')
    assert(require('mason.settings').current.max_concurrent_installers == 2)
  end
  assert(vim.v.errmsg == '', vim.v.errmsg)
end, debug.traceback)

if not ok then
  io.stderr:write(err .. '\n')
  vim.cmd.cquit()
end
print 'Smoke checks passed'
