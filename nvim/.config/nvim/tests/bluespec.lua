-- Run with: nvim --headless '+luafile tests/bluespec.lua' +qa
local path = vim.fn.tempname() .. '.bs'
local lines = { 'package Hello where', '-- Classic source, not Haskell or BrighterScript', 'value =  42' }
local ok, err = xpcall(function()
  vim.fn.writefile(lines, path)
  vim.cmd.edit(vim.fn.fnameescape(path))
  assert(vim.bo.filetype == 'bluespec', '.bs must use a dedicated Classic filetype')
  assert(vim.bo.shiftwidth == 2 and vim.bo.tabstop == 2 and vim.bo.softtabstop == 2)
  assert(vim.bo.expandtab and vim.bo.autoindent and not vim.bo.smartindent)
  assert(vim.bo.commentstring == '-- %s')
  assert(vim.b.current_syntax == 'bluespec', 'Classic syntax did not load')
  assert(vim.fn.synIDattr(vim.fn.synID(2, 1, 1), 'name') == 'hsLineComment')
  assert(#require('conform').list_formatters(0) == 0, 'Classic must not use Haskell/Verilog formatters')
  assert(not vim.tbl_contains(vim.lsp.config.hls.filetypes or {}, 'bluespec'), 'HLS must not handle Classic')
  vim.cmd.write()
  assert(vim.deep_equal(vim.fn.readfile(path), lines), 'Saving Classic unexpectedly changed the source')
  assert(vim.filetype.match { filename = 'test.hs' } == 'haskell')
  assert(vim.filetype.match { filename = 'test.bsv' } ~= 'bluespec', 'BSV must remain separate')
end, debug.traceback)
vim.cmd 'bwipeout!'
vim.fn.delete(path)
if not ok then
  io.stderr:write(err .. '\n')
  vim.cmd.cquit()
end
print 'Bluespec Classic checks passed'
