local swiftly_bin = vim.fn.expand '~/.swiftly/bin'

return {
  cmd = { 'sourcekit-lsp' },
  cmd_env = {
    PATH = swiftly_bin .. ':' .. (vim.env.PATH or ''),
  },
  filetypes = { 'swift' },
  root_dir = function(bufnr, on_dir)
    local root = vim.fs.root(bufnr, { 'Package.swift' })
    if not root then
      local filename = vim.api.nvim_buf_get_name(bufnr)
      root = filename ~= '' and vim.fs.dirname(filename) or vim.fn.getcwd()
    end
    on_dir(root)
  end,
}
