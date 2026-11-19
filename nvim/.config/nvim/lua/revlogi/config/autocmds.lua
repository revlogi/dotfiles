-- Highlight yanked text.
vim.api.nvim_create_autocmd('TextYankPost', {
  desc = 'Highlight when yanking (copying) text',
  group = vim.api.nvim_create_augroup('revlogi-highlight-yank', { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})
