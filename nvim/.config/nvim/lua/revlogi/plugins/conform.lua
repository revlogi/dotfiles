-- Ordinary Haskell uses standalone Ormolu; literate Haskell still uses HLS.
local function lsp_format(bufnr)
  local ft = vim.bo[bufnr or 0].filetype
  return (ft == 'lhaskell') and 'prefer' or 'never'
end

local function format_timeout(bufnr)
  if vim.bo[bufnr or 0].filetype == 'haskell' then
    return 10000
  end
  return lsp_format(bufnr) == 'prefer' and 30000 or 3000
end

vim.keymap.set('', '<leader>f', function()
  require('conform').format { async = true, timeout_ms = format_timeout(), lsp_format = lsp_format() }
end, { desc = '[F]ormat buffer' })

require('conform').setup {
  notify_on_error = true,
  notify_no_formatters = true,
  format_on_save = function(bufnr)
    if vim.b[bufnr].disable_autoformat then
      return
    end
    return {
      timeout_ms = format_timeout(bufnr),
      lsp_format = lsp_format(bufnr),
    }
  end,
  formatters = {
    ['clang-format'] = {
      command = 'clang-format',
      args = function(_, ctx)
        local project_config = vim.fs.find({ '.clang-format', '_clang-format' }, {
          path = vim.fs.dirname(ctx.filename),
          upward = true,
        })[1]
        local style = project_config and 'file' or 'file:' .. vim.fs.joinpath(vim.fn.stdpath 'config', '.clang-format')

        return { '--style=' .. style, '--assume-filename', '$FILENAME' }
      end,
      stdin = true,
    },
    verible = {
      prepend_args = { '--indentation_spaces=4', '--column_limit=120' },
    },
  },
  formatters_by_ft = {
    haskell = { 'ormolu' },
    rust = { 'rustfmt' },
    json = { 'prettierd' },
    jsonc = { 'prettierd' },
    -- shfmt supports POSIX/Bash; never apply it to Zsh.
    sh = { 'shfmt' },
    bash = { 'shfmt' },
    lua = { 'stylua' },
    html = { 'prettierd' },
    css = { 'prettierd' },
    markdown = { 'prettierd' },
    python = { 'ruff_format' },
    c = { 'clang-format' },
    cpp = { 'clang-format' },
    cuda = { 'clang-format' },
    swift = { 'swiftformat' },
    javascript = { 'prettierd' },
    javascriptreact = { 'prettierd' },
    typescript = { 'prettierd' },
    typescriptreact = { 'prettierd' },
    verilog = { 'verible' },
    systemverilog = { 'verible' },
  },
}
