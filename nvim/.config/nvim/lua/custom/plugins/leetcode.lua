return {
  'kawre/leetcode.nvim',
  enabled = not require('custom.platform').is_remote,
  build = ':TSUpdate html',
  dependencies = {
    'nvim-telescope/telescope.nvim',
    'nvim-lua/plenary.nvim',
    'MunifTanjim/nui.nvim',
  },
  opts = {
    lang = 'python3',
    image_support = false,
  },
}
