-- Apply these settings after plugin setup, preserving their startup precedence.

-- Avoid noticeable delays for CursorHold-based features.
vim.opt.updatetime = 300

-- Match Ormolu's two-space indentation while typing Haskell.
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'haskell', 'lhaskell' },
  callback = function()
    vim.opt_local.tabstop = 2
    vim.opt_local.vartabstop = ''
    vim.opt_local.varsofttabstop = ''
    vim.opt_local.shiftwidth = 2
    vim.opt_local.softtabstop = 2
    vim.opt_local.expandtab = true
  end,
})
