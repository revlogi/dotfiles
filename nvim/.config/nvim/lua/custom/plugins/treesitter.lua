local platform = require 'custom.utils.platform'
local parsers = {
  'haskell',
  'bash',
  'json',
  'c',
  'cpp',
  'python',
  'javascript',
  'typescript',
  'tsx',
  'swift',
  'systemverilog',
  'markdown',
  'markdown_inline',
  'html',
  'css',
  'lua',
  'luadoc',
  'vim',
  'vimdoc',
}
local filetypes = {
  'haskell',
  'sh',
  'bash',
  'json',
  'jsonc',
  'c',
  'cpp',
  'cuda',
  'python',
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'swift',
  'verilog',
  'systemverilog',
  'markdown',
  'html',
  'css',
  'lua',
  'vim',
  'vimdoc',
}
local indent_filetypes = {
  'sh',
  'bash',
  'json',
  'jsonc',
  'c',
  'cpp',
  'cuda',
  'python',
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'swift',
  'lua',
  'vim',
  'vimdoc',
  'html',
  'css',
  'markdown',
}

-- CUDA shares C++ syntax; reuse the C++ parser for highlighting and indentation.
vim.treesitter.language.register('cpp', 'cuda')

-- JSON's grammar also accepts comments used by JSONC.
vim.treesitter.language.register('json', 'jsonc')

-- One grammar covers both IEEE Verilog and SystemVerilog filetypes.
vim.treesitter.language.register('systemverilog', 'verilog')

require('nvim-treesitter').install(parsers, {
  max_jobs = platform.is_remote and 2 or nil,
  summary = true,
})

vim.api.nvim_create_autocmd('FileType', {
  pattern = filetypes,
  callback = function()
    if pcall(vim.treesitter.start) and vim.tbl_contains(indent_filetypes, vim.bo.filetype) then
      vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
    end
  end,
})
