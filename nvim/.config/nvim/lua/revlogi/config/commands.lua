local M = {}

function M.setup()
  vim.api.nvim_create_user_command('ZshCheck', function()
    if vim.bo.filetype ~= 'zsh' then
      vim.notify('ZshCheck is only for Zsh buffers', vim.log.levels.WARN)
      return
    end
    if vim.fn.executable 'zsh' == 0 then
      vim.notify('zsh is not installed', vim.log.levels.ERROR)
      return
    end
    local source = table.concat(vim.api.nvim_buf_get_lines(0, 0, -1, false), '\n') .. '\n'
    vim.system(
      { 'zsh', '-f', '-n' },
      { stdin = source, text = true },
      vim.schedule_wrap(function(result)
        local message = result.code == 0 and 'Zsh syntax OK' or result.stderr
        vim.notify(message, result.code == 0 and vim.log.levels.INFO or vim.log.levels.ERROR, { title = 'ZshCheck' })
      end)
    )
  end, { desc = 'Check current Zsh buffer syntax without executing it', force = true })
  vim.api.nvim_create_user_command('ToggleFormatter', function()
    require('revlogi.utils.editor').toggle_formatter()
  end, { desc = 'Toggle format-on-save for current buffer', force = true })
end

return M
