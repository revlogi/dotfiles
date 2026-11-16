local M = {}

function M.setup()
  -- Also support launching Neovim without a login shell on macOS.
  if require('custom.utils.platform').is_macos and vim.fn.executable 'racket' == 0 then
    for _, bin in ipairs(vim.fn.glob('/Applications/Racket*/bin', false, true)) do
      if vim.fn.executable(bin .. '/racket') == 1 then
        vim.env.PATH = bin .. ':' .. vim.env.PATH
      end
    end
  end

  vim.api.nvim_create_autocmd('FileType', {
    group = vim.api.nvim_create_augroup('dotfiles-racket', { clear = true }),
    pattern = 'racket',
    callback = function(event)
      vim.bo.tabstop = 2
      vim.bo.shiftwidth = 2
      vim.bo.softtabstop = 2
      vim.bo.expandtab = true

      local function run(interactive)
        if vim.fn.executable 'racket' == 0 then
          vim.notify('Install Racket and add its bin directory to PATH', vim.log.levels.ERROR)
          return
        end
        local file = vim.api.nvim_buf_get_name(event.buf)
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
      end, { buffer = event.buf, desc = 'Racket: run file' })
      vim.keymap.set('n', '<leader>ri', function()
        run(true)
      end, { buffer = event.buf, desc = 'Racket: load file in REPL' })
    end,
  })
end

return M
