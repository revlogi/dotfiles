# Editor setup and language support

[Back to README](../README.md) · [Neovim shortcuts](cheats/nvim.md)

Initialize plugins using the [device setup guide](syncthing-devices.md#5-初始化各机依赖)
before running `dot check nvim`.

## Languages and tools

Neovim configures Python, C/C++, JavaScript/TypeScript (including JSX/TSX),
Swift on macOS, Verilog/SystemVerilog, Lua, and Vimscript/vimrc. Lua includes
LazyDev completion and StyLua formatting. HTML/CSS and Markdown have Tree-sitter
highlighting and Prettierd formatting; Markdown rendering also supports AI chat.
JSON/JSONC, HTML, and CSS have language servers for completion and diagnostics.
POSIX/Bash scripts use Bash Language Server, ShellCheck, shfmt, and Tree-sitter.
Zsh keeps native syntax highlighting; use `:ZshCheck` to check the current unsaved
buffer with `zsh -f -n`. Bash language tooling and shfmt are not enabled for Zsh.

On macOS, `brew bundle` supplies Node/npm, Bun for Pi tests, the Tree-sitter CLI,
and SwiftFormat. Swift support also requires `xcrun sourcekit-lsp` from the local
Swift/Xcode toolchain. Mason installs missing language servers, shfmt, ShellCheck,
and Prettierd when Neovim starts; inspect progress with `:Mason` and check tools
with `:checkhealth dotfiles` and `:ConformInfo`.

Remote Linux retains its small automatic-install list (Lua/C++ and their
formatters). For optional web/shell editing, install Node/npm on that host and use
`:MasonInstall json-lsp html-lsp css-lsp bash-language-server shellcheck shfmt prettierd`.
 Oil is the file manager (`-`); Telescope provides
search. `<leader>e` always shows diagnostics. Vim is a plugin-free fallback.

## Haskell

Haskell files use Tree-sitter highlighting and Haskell Language Server (HLS)
for completion, diagnostics, and navigation. Ordinary Haskell files use standalone
Ormolu for formatting, independently of HLS project loading. `<leader>f` and
explicit saves use Ormolu for `.hs` and HLS for `.lhs`; other languages retain their
existing formatter settings. Haskell uses two-space indentation and expands tabs to spaces.

Install a compatible GHC/Cabal/HLS toolchain with
[GHCup](https://www.haskell.org/ghcup/). Once GHCup is installed:

```bash
ghcup install ghc recommended --set
ghcup install cabal recommended --set
ghcup install hls recommended --set
```

Zsh includes `~/.ghcup/bin` and `~/.cabal/bin` in PATH. Open Neovim from the
Cabal/Stack project directory after restarting the shell. HLS is enabled when
`haskell-language-server-wrapper` is available; Mason does not manage it.
For an existing project, choose a GHC version supported by its dependencies and
an HLS build that supports that GHC. Install standalone Ormolu on macOS with `brew install ormolu`; on Linux,
install `ormolu` with your package manager or Cabal. Literate Haskell still
uses HLS for formatting.
Use `ghc --version`, `cabal --version`, and `haskell-language-server-wrapper
--version` to check the toolchain, and `:checkhealth vim.lsp` for editor attachment.
Toolchains and build outputs stay machine-local.

## AI chat

CodeCompanion chat authenticates through ChatGPT when first opened. Its ACP
chat is the single Neovim AI entry point, so no OpenAI API key is required.
