local python_path
if vim.env.VIRTUAL_ENV then
  python_path = vim.fs.joinpath(vim.env.VIRTUAL_ENV, 'bin', 'python')
end

return {
  settings = {
    python = {
      pythonPath = python_path,
    },
    basedpyright = {
      analysis = {
        diagnosticMode = 'openFilesOnly',
        typeCheckingMode = 'basic',
      },
    },
  },
}
