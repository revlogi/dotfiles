local root_markers = { '.slang', '.git', 'Makefile' }

return {
  root_dir = function(bufnr, on_dir)
    local root = vim.fs.root(bufnr, root_markers)
    if not root then
      local filename = vim.api.nvim_buf_get_name(bufnr)
      root = filename ~= '' and vim.fs.dirname(filename) or vim.fn.getcwd()
    end
    on_dir(root)
  end,
}
