local platform = require 'revlogi.utils.platform'

vim.diagnostic.config {
  severity_sort = true,
  float = { border = 'rounded', source = 'if_many' },
  underline = { severity = vim.diagnostic.severity.ERROR },
  signs = vim.g.have_nerd_font and {
    text = {
      [vim.diagnostic.severity.ERROR] = '󰅚 ',
      [vim.diagnostic.severity.WARN] = '󰀪 ',
      [vim.diagnostic.severity.INFO] = '󰋽 ',
      [vim.diagnostic.severity.HINT] = '󰌶 ',
    },
  } or {},
  virtual_text = false,
}

vim.api.nvim_create_autocmd('LspAttach', {
  group = vim.api.nvim_create_augroup('revlogi-lsp-attach', { clear = true }),
  callback = function(event)
    local map = function(keys, func, desc, mode)
      mode = mode or 'n'
      vim.keymap.set(mode, keys, func, { buffer = event.buf, desc = 'LSP: ' .. desc })
    end

    map('grn', vim.lsp.buf.rename, '[R]e[n]ame')
    map('<leader>k', vim.lsp.buf.hover, '[H]over Documentation')
    map('gra', vim.lsp.buf.code_action, '[G]oto Code [A]ction', { 'n', 'x' })
    map('grr', require('telescope.builtin').lsp_references, '[G]oto [R]eferences')
    map('gri', require('telescope.builtin').lsp_implementations, '[G]oto [I]mplementation')
    map('grd', require('telescope.builtin').lsp_definitions, '[G]oto [D]efinition')
    map('grD', vim.lsp.buf.declaration, '[G]oto [D]eclaration')
    map('gO', require('telescope.builtin').lsp_document_symbols, 'Open Document Symbols')
    map('gW', require('telescope.builtin').lsp_dynamic_workspace_symbols, 'Open Workspace Symbols')
    map('grt', require('telescope.builtin').lsp_type_definitions, '[G]oto [T]ype Definition')

    local client = vim.lsp.get_client_by_id(event.data.client_id)
    if client and client:supports_method(vim.lsp.protocol.Methods.textDocument_documentHighlight, event.buf) then
      local highlight_augroup = vim.api.nvim_create_augroup('revlogi-lsp-highlight', { clear = false })
      vim.api.nvim_create_autocmd({ 'CursorHold', 'CursorHoldI' }, {
        buffer = event.buf,
        group = highlight_augroup,
        callback = vim.lsp.buf.document_highlight,
      })

      vim.api.nvim_create_autocmd({ 'CursorMoved', 'CursorMovedI' }, {
        buffer = event.buf,
        group = highlight_augroup,
        callback = vim.lsp.buf.clear_references,
      })

      vim.api.nvim_create_autocmd('LspDetach', {
        group = vim.api.nvim_create_augroup('revlogi-lsp-detach', { clear = true }),
        callback = function(event2)
          vim.lsp.buf.clear_references()
          vim.api.nvim_clear_autocmds { group = 'revlogi-lsp-highlight', buffer = event2.buf }
        end,
      })
    end

    if client and client:supports_method(vim.lsp.protocol.Methods.textDocument_inlayHint, event.buf) then
      map('<leader>th', function()
        vim.lsp.inlay_hint.enable(not vim.lsp.inlay_hint.is_enabled { bufnr = event.buf })
      end, '[T]oggle Inlay [H]ints')
    end
  end,
})

-- Share completion capabilities across all servers; per-server overrides live in lsp/.
vim.lsp.config('*', {
  capabilities = require('blink.cmp').get_lsp_capabilities(),
})

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

require('mason-lspconfig').setup {
  ensure_installed = mason_servers,
  automatic_enable = false,
}

vim.lsp.enable(servers)

-- Externally managed servers (not installed via Mason).
local external_servers = {
  racket_langserver = 'racket',
  gleam = 'gleam',
  hls = 'haskell-language-server-wrapper',
  rust_analyzer = 'rust-analyzer',
}

for server_name, executable in pairs(external_servers) do
  if vim.fn.executable(executable) == 1 then
    vim.lsp.enable(server_name)
  end
end

if platform.is_macos and vim.fn.executable(vim.fn.expand '~/.swiftly/bin/sourcekit-lsp') == 1 then
  vim.lsp.enable 'sourcekit'
end
