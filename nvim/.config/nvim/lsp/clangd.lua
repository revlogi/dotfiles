local platform = require 'revlogi.utils.platform'

local cmd = { 'clangd', '--background-index', '--header-insertion=iwyu' }
if platform.is_remote then
  cmd[#cmd + 1] = '-j=4'
end

return {
  cmd = cmd,
  filetypes = { 'c', 'cpp', 'cuda' },
  on_attach = function(client, bufnr)
    client.server_capabilities.documentFormattingProvider = false
    client.server_capabilities.documentRangeFormattingProvider = false
  end,
}
