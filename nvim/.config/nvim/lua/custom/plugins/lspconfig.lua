local lsp_utils = require 'lsp.init'
local platform = require 'custom.utils.platform'

local package_executables = {
  jsonls = 'vscode-json-language-server',
  html = 'vscode-html-language-server',
  cssls = 'vscode-css-language-server',
  bashls = 'bash-language-server',
  lua_ls = 'lua-language-server',
  vimls = 'vim-language-server',
  ts_ls = 'typescript-language-server',
  basedpyright = 'basedpyright-langserver',
  slang_server = 'slang-server',
  verible = 'verible-verilog-format',
}

local function missing_packages(packages)
  local missing = {}
  for _, package in ipairs(packages) do
    local executable = package_executables[package] or package
    if vim.fn.executable(executable) == 0 then
      missing[#missing + 1] = package
    end
  end
  return missing
end

local servers = {
  'jsonls',
  'html',
  'cssls',
  'bashls',
  'lua_ls',
  'vimls',
  'ts_ls',
  'basedpyright',
  'ruff',
  'clangd',
  'slang_server',
}

-- Racket's server is installed with raco; it also supports #lang plait.
if vim.fn.executable 'racket' == 1 then
  vim.lsp.config('racket_langserver', {
    capabilities = lsp_utils.get_capabilities(),
    filetypes = { 'racket' },
  })
  vim.lsp.enable 'racket_langserver'
end

-- Gleam's language server ships with the compiler, not Mason.
if vim.fn.executable 'gleam' == 1 then
  vim.lsp.config('gleam', {
    capabilities = lsp_utils.get_capabilities(),
  })
  vim.lsp.enable 'gleam'
end

-- HLS must match the project's GHC; install it with GHCup, not Mason.
if vim.fn.executable 'haskell-language-server-wrapper' == 1 then
  vim.lsp.config('hls', {
    capabilities = lsp_utils.get_capabilities(),
    settings = { haskell = { formattingProvider = 'ormolu' } },
  })
  vim.lsp.enable 'hls'
end

local tools = {
  'shfmt',
  'shellcheck',
  'stylua',
  'clang-format',
  'prettierd',
  'verible',
}

local mason_servers = missing_packages(servers)
tools = missing_packages(tools)

if platform.is_remote then
  mason_servers = missing_packages { 'lua_ls', 'clangd' }
  tools = missing_packages { 'stylua', 'clang-format' }
end

require('mason').setup {
  PATH = 'append',
  max_concurrent_installers = platform.is_remote and 2 or 4,
}

require('mason-tool-installer').setup { ensure_installed = tools }

for _, server_name in ipairs(servers) do
  local config = {
    capabilities = lsp_utils.get_capabilities(),
  }
  local has_custom_config, custom_config = pcall(require, 'lsp.' .. server_name)
  if has_custom_config then
    config = vim.tbl_deep_extend('force', config, custom_config)
  end
  vim.lsp.config(server_name, config)
end

require('mason-lspconfig').setup {
  ensure_installed = mason_servers,
  automatic_enable = false,
}

vim.lsp.enable(servers)

if platform.is_macos then
  require('lsp.sourcekit').setup()
end
