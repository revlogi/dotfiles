-- Leaders and editor defaults must precede keymaps and plugin setup.
require 'custom.config.options'
require 'custom.config.keymaps'
require 'custom.config.autocmds'
require 'custom.config.pack'

-- Keep final overrides after plugins have registered their defaults.
require 'custom.config.after'
