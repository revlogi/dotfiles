-- Requires a configured Rust toolchain: nvim --headless '+luafile tests/rust.lua' +qa
local project = vim.fn.tempname()
local client
local ok, err = xpcall(function()
  local function run(args)
    local result = vim.system(args, { cwd = project, text = true }):wait(60000)
    assert(result.code == 0, (result.stderr or '') .. (result.stdout or ''))
  end

  vim.fn.mkdir(project, 'p')
  run { 'cargo', 'init', '--bin', '--name', 'rust_editor_check', '--vcs', 'none', '.' }
  local source = project .. '/src/main.rs'
  vim.fn.writefile({ 'fn main(){let values=vec![1,2,3];println!("{}",values.len());}' }, source)
  vim.cmd.cd(vim.fn.fnameescape(project))
  vim.cmd.edit(vim.fn.fnameescape(source))
  local bufnr = vim.api.nvim_get_current_buf()
  assert(vim.bo.filetype == 'rust')
  assert(vim.bo.shiftwidth == 4 and vim.bo.expandtab)

  assert(
    vim.wait(60000, function()
      return pcall(vim.treesitter.get_parser, bufnr, 'rust')
    end, 100),
    'Rust Tree-sitter parser is unavailable'
  )
  assert(
    vim.wait(60000, function()
      client = vim.lsp.get_clients({ bufnr = bufnr, name = 'rust_analyzer' })[1]
      return client and client.initialized
    end, 100),
    'rust-analyzer did not attach'
  )
  assert(client.server_capabilities.completionProvider, 'Rust completion is unavailable')
  assert(client.server_capabilities.definitionProvider, 'Rust navigation is unavailable')

  -- Explicit save must run rustfmt with the Cargo project edition.
  vim.cmd.write()
  local formatted = vim.fn.readfile(source)
  assert(formatted[1] == 'fn main() {', 'Rust explicit-save formatting failed')
  run { 'cargo', 'fmt', '--check' }

  -- This lint is specific to Clippy, rather than ordinary compiler diagnostics.
  assert(
    vim.wait(60000, function()
      for _, diagnostic in ipairs(vim.diagnostic.get(bufnr)) do
        if diagnostic.message:find('useless use of `vec!`', 1, true) then
          return true
        end
      end
      return false
    end, 100),
    'Clippy diagnostics did not reach the Rust buffer'
  )

  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, { 'fn main(){let values=[1,2,3];println!("{}",values.len());}' })
  vim.cmd.write()
  run { 'cargo', 'test' }
  run { 'cargo', 'clippy', '--all-targets', '--', '-D', 'warnings' }
  run { 'cargo', 'fmt', '--check' }
end, debug.traceback)

if client then
  client:stop(true)
  vim.wait(5000, function()
    return client:is_stopped()
  end)
end
vim.cmd 'bwipeout!'
vim.cmd.cd(vim.fn.stdpath 'config')
vim.fn.delete(project, 'rf')
if not ok then
  io.stderr:write(err .. '\n')
  vim.cmd.cquit()
end
print 'Rust editor checks passed'
