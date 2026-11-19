-- Bluespec Classic is Haskell-like, but is not an HLS/Ormolu input language.
vim.bo.tabstop = 2
vim.bo.softtabstop = 2
vim.bo.shiftwidth = 2
vim.bo.vartabstop = ''
vim.bo.varsofttabstop = ''
vim.bo.expandtab = true
vim.bo.autoindent = true
vim.bo.smartindent = false
vim.bo.indentexpr = ''
vim.bo.commentstring = '-- %s'
vim.bo.comments = 's1:{-,mb: ,ex:-},:--'
vim.b.undo_ftplugin =
  'setlocal tabstop< softtabstop< shiftwidth< vartabstop< varsofttabstop< expandtab< autoindent< smartindent< indentexpr< commentstring< comments<'
