-- Leaders and editor defaults must precede keymaps and plugin setup.
require 'revlogi.config.options'
require 'revlogi.config.keymaps'
require 'revlogi.config.autocmds'
require('revlogi.config.autosave').setup()
require('revlogi.config.commands').setup()
require 'revlogi.config.pack'
