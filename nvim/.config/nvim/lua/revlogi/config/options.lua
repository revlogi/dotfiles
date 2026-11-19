local platform = require 'revlogi.utils.platform'

-- Leaders must be set before loading keymaps or plugins.
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '
vim.g.have_nerd_font = true

-- Also support launching Neovim without a login shell on macOS.
if platform.is_macos and vim.fn.executable 'racket' == 0 then
  for _, bin in ipairs(vim.fn.glob('/Applications/Racket*/bin', false, true)) do
    if vim.fn.executable(bin .. '/racket') == 1 then
      vim.env.PATH = bin .. ':' .. vim.env.PATH
    end
  end
end

-- Show relative line numbers.
vim.o.number = true
vim.o.relativenumber = true

-- Default to four spaces; filetype-specific settings may override this.
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.softtabstop = 4
vim.opt.expandtab = true

-- Briefly show the opening bracket when typing its closing bracket.
vim.opt.showmatch = true
vim.opt.matchtime = 2
vim.o.mouse = 'a'
vim.o.showmode = false

-- Avoid noticeable delays for CursorHold-based features.
vim.o.updatetime = 300

-- Defer clipboard setup to avoid slowing startup; use OSC 52 over SSH.
vim.schedule(function()
  if platform.is_remote then
    local osc52 = require 'vim.ui.clipboard.osc52'
    vim.g.clipboard = {
      name = 'OSC 52',
      copy = {
        ['+'] = osc52.copy '+',
        ['*'] = osc52.copy '*',
      },
      paste = {
        ['+'] = osc52.paste '+',
        ['*'] = osc52.paste '*',
      },
    }
  end
  vim.o.clipboard = 'unnamedplus'
end)

vim.o.breakindent = true
vim.o.undofile = true

-- Case-insensitive searching unless \C or capital letters appear in the pattern.
vim.o.ignorecase = true
vim.o.smartcase = true
vim.o.signcolumn = 'yes'
vim.o.timeoutlen = 300
vim.o.splitright = true
vim.o.splitbelow = true

-- Display tabs, trailing spaces, and non-breaking spaces.
vim.o.list = true
vim.opt.listchars = { tab = '» ', trail = '·', nbsp = '␣' }
vim.o.inccommand = 'split'
vim.o.cursorline = true
vim.o.scrolloff = 10
vim.o.confirm = true
vim.o.cmdheight = 1
