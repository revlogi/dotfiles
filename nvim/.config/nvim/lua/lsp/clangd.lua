local lsp_utils = require 'lsp.init'
local platform = require 'custom.platform'

local cmd = { 'clangd', '--background-index', '--header-insertion=iwyu' }
if platform.is_remote then
  cmd[#cmd + 1] = '-j=4'
end

return {
  cmd = cmd,
  capabilities = lsp_utils.get_capabilities(),
  on_attach = function(client, bufnr)
    client.server_capabilities.documentFormattingProvider = false
    client.server_capabilities.documentRangeFormattingProvider = false
  end,
}
