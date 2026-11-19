local buf = vim.api.nvim_get_current_buf()

vim.opt_local.tabstop = 2
vim.opt_local.shiftwidth = 2
vim.opt_local.softtabstop = 2
vim.opt_local.expandtab = true

local function run(interactive)
  if vim.fn.executable 'racket' == 0 then
    vim.notify('Install Racket and add its bin directory to PATH', vim.log.levels.ERROR)
    return
  end
  local file = vim.api.nvim_buf_get_name(buf)
  if file == '' then
    vim.notify('Save this buffer as a .rkt file first', vim.log.levels.WARN)
    return
  end
  vim.cmd.write()
  local command = { 'racket' }
  if interactive then
    vim.list_extend(command, {
      '-i',
      '-e',
      '(require racket/enter)',
      '-e',
      '(enter! (file ' .. vim.json.encode(file) .. '))',
    })
  else
    table.insert(command, file)
  end
  vim.cmd 'botright 12split'
  vim.cmd.enew()
  vim.fn.jobstart(command, { term = true, cwd = vim.fs.dirname(file) })
  vim.cmd.startinsert()
end

vim.keymap.set('n', '<leader>rr', function()
  run(false)
end, { buffer = buf, desc = 'Racket: run file' })
vim.keymap.set('n', '<leader>ri', function()
  run(true)
end, { buffer = buf, desc = 'Racket: load file in REPL' })
