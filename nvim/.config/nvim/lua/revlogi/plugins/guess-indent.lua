require('guess-indent').setup {
  auto_cmd = true,
  override_editorconfig = false,
  filetype_exclude = {
    'haskell',
    'lua',
    'verilog',
    'systemverilog',
  },
}
