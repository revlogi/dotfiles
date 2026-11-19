-- Clear search highlights in normal mode.
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')

vim.keymap.set('n', '<leader>q', vim.diagnostic.setloclist, { desc = 'Open diagnostic [Q]uickfix list' })
vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float, { desc = 'Show floating diagnostics' })

-- Exit terminal mode; <C-\><C-n> remains available if the terminal intercepts Esc.
vim.keymap.set('t', '<Esc><Esc>', '<C-\\><C-n>', { desc = 'Exit terminal mode' })

vim.keymap.set('n', '<leader>tf', function()
  require('revlogi.utils.editor').toggle_formatter()
end, { desc = '[T]oggle [F]ormatter for buffer' })

vim.keymap.set('n', '<leader>bd', function()
  require('revlogi.utils.editor').delete_hidden_buffers()
end, { desc = '[B]uffer [D]elete hidden' })

vim.keymap.set('x', '<leader>cc', function()
  require('revlogi.utils.editor').copy_as_codeblock()
end, { desc = '[C]opy selection as [C]odeblock' })
