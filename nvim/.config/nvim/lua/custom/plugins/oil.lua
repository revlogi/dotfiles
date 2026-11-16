require('oil').setup {
  default_file_explorer = true,
  view_options = {
    show_hidden = true,
  },
  keymaps = {
    ['-'] = 'actions.parent',
    ['<Esc>'] = 'actions.close',
  },
  columns = {
    'icon',
  },
}
