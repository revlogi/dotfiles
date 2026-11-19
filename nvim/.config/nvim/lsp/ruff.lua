return {
  on_attach = function(client)
    -- BasedPyright remains the single source for hover information.
    client.server_capabilities.hoverProvider = false
  end,
}
