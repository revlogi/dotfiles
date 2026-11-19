-- Treat .v files as Verilog, including empty or unfinished modules.
vim.g.filetype_v = 'verilog'

-- Keep Classic separate from Haskell tooling; override Neovim's BrighterScript .bs default.
-- CUDA sources and headers share the same language tooling.
vim.filetype.add {
  extension = {
    bs = 'bluespec',
    cu = 'cuda',
    cuh = 'cuda',
  },
}
