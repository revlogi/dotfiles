-- Clear search highlights in normal mode.
vim.keymap.set('n', '<Esc>', '<cmd>nohlsearch<CR>')

vim.keymap.set('n', '<leader>q', vim.diagnostic.setloclist, { desc = 'Open diagnostic [Q]uickfix list' })
vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float, { desc = 'Show floating diagnostics' })

-- Exit terminal mode; <C-\><C-n> remains available if the terminal intercepts Esc.
vim.keymap.set('t', '<Esc><Esc>', '<C-\\><C-n>', { desc = 'Exit terminal mode' })

-- Use Oil's command without requiring the plugin during keymap setup.
vim.keymap.set('n', '-', '<CMD>Oil --float<CR>', { desc = 'Open parent directory' })
