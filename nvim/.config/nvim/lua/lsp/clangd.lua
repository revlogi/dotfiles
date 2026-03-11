local lsp_utils = require 'lsp.init'

return {
  cmd = { 'clangd', '--background-index', '--header-insertion=iwyu' },
  capabilities = lsp_utils.get_capabilities(),
  on_attach = function(client, bufnr)
    client.server_capabilities.documentFormattingProvider = false
    client.server_capabilities.documentRangeFormattingProvider = false
  end,
}
