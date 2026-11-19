-- Highlight yanked text.
vim.api.nvim_create_autocmd('TextYankPost', {
  desc = 'Highlight when yanking (copying) text',
  group = vim.api.nvim_create_augroup('kickstart-highlight-yank', { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})

-- Automatic saves skip explicit-write formatting hooks.
require('custom.config.autosave').setup()

-- Check unsaved Zsh buffers without executing them.
require('custom.config.commands').setup()

require('custom.config.racket').setup()

-- Set 4-space indentation for C/C++ and Rust files.
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'c', 'cpp', 'rust' },
  callback = function()
    vim.opt_local.shiftwidth = 4
    vim.opt_local.tabstop = 4
    vim.opt_local.expandtab = true
    vim.opt_local.smartindent = true
  end,
})

-- Set 4-space indentation for Verilog/SystemVerilog files.
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'verilog', 'systemverilog' },
  callback = function()
    vim.opt_local.shiftwidth = 4
    vim.opt_local.tabstop = 4
    vim.opt_local.softtabstop = 4
    vim.opt_local.expandtab = true
  end,
})

-- Lua uses two-space indentation, including this configuration.
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'lua' },
  callback = function()
    vim.opt_local.shiftwidth = 2
    vim.opt_local.tabstop = 2
    vim.opt_local.softtabstop = 2
    vim.opt_local.expandtab = true
    vim.opt_local.smartindent = true
  end,
})
