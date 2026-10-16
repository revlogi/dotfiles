" Plugin-free fallback editor. Neovim is the primary editor.
set nocompatible
set noloadplugins
set encoding=utf-8
filetype plugin indent on
syntax enable

set shortmess+=I
set number relativenumber
set laststatus=2
set colorcolumn=80
set backspace=indent,eol,start
set hidden
set incsearch
set ignorecase smartcase
set noerrorbells visualbell t_vb=
set mouse+=a

nnoremap Q <Nop>
