local M = {}

local root_markers = { '.git', 'package.json', 'Makefile', 'Cargo.toml', 'go.mod', 'pyproject.toml' }

local ft_to_lang = {
  typescriptreact = 'tsx',
  javascriptreact = 'jsx',
  typescript = 'ts',
  javascript = 'js',
}

local function get_root(bufnr)
  return vim.fs.root(bufnr, root_markers) or vim.uv.cwd() or vim.fn.getcwd()
end

--- Copy the current visual selection as a fenced Markdown code block.
function M.copy_as_codeblock()
  local start_line, end_line
  if vim.fn.mode():find '^[vV\22]' then
    start_line = vim.fn.line 'v'
    end_line = vim.fn.line '.'
    if start_line > end_line then
      start_line, end_line = end_line, start_line
    end
    vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes('<Esc>', true, false, true), 'nx', false)
  else
    start_line = vim.fn.line "'<"
    end_line = vim.fn.line "'>"
  end

  local filepath = vim.api.nvim_buf_get_name(0)
  if filepath == '' then
    vim.notify('Buffer has no file name', vim.log.levels.WARN)
    return
  end

  local lines = vim.api.nvim_buf_get_lines(0, start_line - 1, end_line, false)
  local real_file = vim.uv.fs_realpath(filepath) or filepath
  local root = get_root(0)
  local real_root = root and (vim.uv.fs_realpath(root) or root) or nil
  local relative = (real_root and vim.fs.relpath(real_root, real_file)) or vim.fn.fnamemodify(filepath, ':~:.')
  local lang = ft_to_lang[vim.bo.filetype] or vim.bo.filetype

  local result = { ('```%s filename=%q line=%d'):format(lang, relative, start_line) }
  vim.list_extend(result, lines)
  result[#result + 1] = '```'

  vim.fn.setreg('+', table.concat(result, '\n'))
  vim.notify(('Copied %d lines as codeblock'):format(#lines), vim.log.levels.INFO)
end

--- Delete all listed buffers not visible in any window, skipping modified ones.
function M.delete_hidden_buffers()
  local visible_bufs = {}
  for _, win in ipairs(vim.api.nvim_list_wins()) do
    visible_bufs[vim.api.nvim_win_get_buf(win)] = true
  end

  local deleted = 0
  local skipped = 0
  for _, buf in ipairs(vim.api.nvim_list_bufs()) do
    if vim.bo[buf].buflisted and not visible_bufs[buf] then
      if vim.bo[buf].modified then
        skipped = skipped + 1
      else
        vim.api.nvim_buf_delete(buf, {})
        deleted = deleted + 1
      end
    end
  end

  local msg = ('Deleted %d hidden buffer%s'):format(deleted, deleted == 1 and '' or 's')
  if skipped > 0 then
    msg = ('%s (%d skipped, unsaved changes)'):format(msg, skipped)
  end
  vim.notify(msg, vim.log.levels.INFO)
end

--- Enable or disable format-on-save for the current buffer.
function M.toggle_formatter()
  local bufnr = vim.api.nvim_get_current_buf()
  if vim.b[bufnr].disable_autoformat then
    vim.b[bufnr].disable_autoformat = false
    vim.notify('Formatter enabled for this buffer', vim.log.levels.INFO)
  else
    vim.b[bufnr].disable_autoformat = true
    vim.notify('Formatter disabled for this buffer', vim.log.levels.WARN)
  end
end

return M
