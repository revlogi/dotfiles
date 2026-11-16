local platform = require 'custom.utils.platform'

-- Register hooks before vim.pack can install anything from the lockfile.
vim.api.nvim_create_autocmd('PackChanged', {
  group = vim.api.nvim_create_augroup('custom-pack-build', { clear = true }),
  desc = 'Build native Telescope extension and update installed Treesitter parsers',
  callback = function(event)
    local data = event.data
    if data.spec.name == 'telescope-fzf-native.nvim' and (data.kind == 'install' or data.kind == 'update') then
      if vim.fn.executable 'make' == 0 then
        vim.notify('make is unavailable; Telescope will use its default sorter', vim.log.levels.WARN)
        return
      end
      local result = vim.system({ 'make' }, { cwd = data.path, text = true }):wait()
      if result.code ~= 0 then
        error('telescope-fzf-native build failed:\n' .. result.stdout .. result.stderr)
      end
    elseif data.spec.name == 'nvim-treesitter' and data.kind == 'update' then
      vim.cmd.packadd 'nvim-treesitter'
      require('nvim-treesitter').update(nil, { max_jobs = platform.is_remote and 2 or nil })
    end
  end,
})

-- Dependencies are listed explicitly. Load every plugin now, including its
-- plugin/ scripts, rather than deferring them until after init.lua or an event.
vim.pack.add({
  { src = 'https://github.com/catppuccin/nvim', name = 'catppuccin' },
  { src = 'https://github.com/nvim-lua/plenary.nvim' },
  { src = 'https://github.com/nvim-tree/nvim-web-devicons' },
  { src = 'https://github.com/echasnovski/mini.nvim' },
  { src = 'https://github.com/NMAC427/guess-indent.nvim' },
  { src = 'https://github.com/lewis6991/gitsigns.nvim' },
  { src = 'https://github.com/stevearc/oil.nvim' },
  { src = 'https://github.com/nvim-telescope/telescope.nvim' },
  { src = 'https://github.com/nvim-telescope/telescope-fzf-native.nvim' },
  { src = 'https://github.com/nvim-telescope/telescope-ui-select.nvim' },
  { src = 'https://github.com/nvim-treesitter/nvim-treesitter' },
  { src = 'https://github.com/MeanderingProgrammer/render-markdown.nvim' },
  { src = 'https://github.com/folke/lazydev.nvim' },
  { src = 'https://github.com/saghen/blink.cmp', version = vim.version.range '1' },
  { src = 'https://github.com/mason-org/mason.nvim' },
  { src = 'https://github.com/mason-org/mason-lspconfig.nvim' },
  { src = 'https://github.com/WhoIsSethDaniel/mason-tool-installer.nvim' },
  { src = 'https://github.com/neovim/nvim-lspconfig' },
  { src = 'https://github.com/stevearc/conform.nvim' },
  { src = 'https://github.com/windwp/nvim-autopairs' },
  { src = 'https://github.com/folke/which-key.nvim' },
  { src = 'https://github.com/folke/todo-comments.nvim' },
  { src = 'https://github.com/christoomey/vim-tmux-navigator' },
}, { load = true })

-- Setup order is deliberate: theme first, Treesitter before Markdown, and
-- completion capabilities before LSP configuration. No discovery or loaders.
require 'custom.plugins.catppuccin'
require 'custom.plugins.mini'
require 'custom.plugins.guess-indent'
require 'custom.plugins.gitsigns'
require 'custom.plugins.oil'
require 'custom.plugins.telescope'
require 'custom.plugins.treesitter'
require 'custom.plugins.render-markdown'
require 'custom.plugins.lazydev'
require 'custom.plugins.blink'
require 'custom.plugins.lspconfig'
require 'custom.plugins.conform'
require 'custom.plugins.autopairs'
require 'custom.plugins.which-key'
require 'custom.plugins.todo-comments'
require 'custom.plugins.vim-tmux-navigator'
