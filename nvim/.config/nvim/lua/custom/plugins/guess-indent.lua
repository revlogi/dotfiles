require('guess-indent').setup {
  auto_cmd = true,
  override_editorconfig = false,
  filetype_exclude = {
    'racket',
    'bluespec',
    'haskell',
    'lhaskell',
    'c',
    'cpp',
    'lua',
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'verilog',
    'systemverilog',
  },
}
