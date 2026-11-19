" Bluespec Classic: approximate lexical highlighting, not a Haskell parser.
if exists('b:current_syntax')
  finish
endif
runtime! syntax/haskell.vim
unlet! b:current_syntax

syntax keyword bluespecKeyword package interface rules rule when action
highlight default link bluespecKeyword Keyword
let b:current_syntax = 'bluespec'
