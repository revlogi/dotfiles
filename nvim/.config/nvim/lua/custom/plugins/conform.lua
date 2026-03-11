return {
  'stevearc/conform.nvim',
  event = { 'BufWritePre' },
  cmd = { 'ConformInfo' },
  keys = {
    {
      '<leader>f',
      function()
        require('conform').format { async = true, timeout_ms = 3000, lsp_format = 'never' }
      end,
      mode = '',
      desc = '[F]ormat buffer',
    },
  },
  opts = {
    notify_on_error = false,
    format_on_save = function(bufnr)
      return {
        timeout_ms = 3000,
        lsp_format = 'never',
      }
    end,
    formatters = {
      ['clang-format'] = {
        command = '/opt/homebrew/bin/clang-format',
        args = {
          '-style=file:/Users/liuguangxi/dotfiles/nvim/.config/nvim/.clang-format',
          '--assume-filename',
          '$FILENAME',
        },
        stdin = true,
      },
    },
    formatters_by_ft = {
      lua = { 'stylua' },
      c = { 'clang-format' },
      cpp = { 'clang-format' },
    },
  },
}
