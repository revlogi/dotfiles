# Editor setup and language support

[Back to README](../README.md) · [Neovim shortcuts](cheats/nvim.md)

Initialize plugins using the [device setup guide](syncthing-devices.md#5-初始化各机依赖)
before running `dot check nvim`.

## Languages and tools

Neovim configures Python, C/C++, Rust, JavaScript/TypeScript (including JSX/TSX),
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
with `:checkhealth revlogi` and `:ConformInfo`.

Remote Linux retains its small automatic-install list (Lua/C++ and their
formatters). For optional web/shell editing, install Node/npm on that host and use
`:MasonInstall json-lsp html-lsp css-lsp bash-language-server shellcheck shfmt prettierd`.
 Oil is the file manager (`-`); Telescope provides
search. `<leader>e` always shows diagnostics. Vim is a plugin-free fallback.

## Rust

Homebrew installs the rustup manager, not a toolchain. After `brew bundle`, start a
new Zsh session and initialize the stable toolchain on each Mac:

```bash
rustup toolchain install stable --profile default --component rust-analyzer,rust-src
rustup default stable
rustup component add rust-analyzer rust-src rustfmt clippy
rustc --version
cargo --version
rust-analyzer --version
```

Zsh adds Cargo's bin directory and Homebrew's keg-only rustup bin directory to
PATH (Apple Silicon and Intel). On Linux, install rustup using its official
instructions; the same Cargo bin path is already configured. Do not also install
Homebrew's `rust` or `rust-analyzer`: rustup owns the compiler and editor tools.
Toolchains, Cargo caches, and build outputs remain machine-local.

Open Neovim from a Cargo project directory. Rust uses rust-analyzer for completion,
navigation, code actions, and Clippy diagnostics, Tree-sitter for highlighting and
indentation, and rustfmt on explicit save or `<leader>f`. Rust uses four spaces.
Mason does not install Rust tooling. Check attachment with `:checkhealth vim.lsp`
and formatting with `:ConformInfo`.

```bash
cargo new hello-rust
cd hello-rust
cargo run
cargo test
cargo clippy --all-targets -- -D warnings
cargo fmt --check
nvim src/main.rs
```

For projects with `rust-toolchain.toml`, install the requested toolchain and its
`rust-analyzer`, `rust-src`, `rustfmt`, and `clippy` components as needed. Rustup
proxies select the project toolchain; formatting respects the Cargo edition and
project rustfmt configuration. Use `rustup update stable` to update the default
stable toolchain. No debugger plugin is included in this basic setup.

After installation, run the end-to-end editor check from the Neovim config directory:

```bash
nvim --headless '+luafile tests/rust.lua' +qa
```

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

## Bluespec Classic

`.bs` files use a dedicated `bluespec` filetype, overriding Neovim's default
BrighterScript detection. This is **Bluespec Classic** (Haskell-like syntax), not
Bluespec SystemVerilog (`.bsv`). Native syntax highlighting reuses Haskell's
lexical rules with a few Classic keywords; it is approximate, not a Classic
parser. Editing uses two spaces, autoindent, and `--` / `{- -}` comments. Use
`gcc` to toggle a line comment.

Classic files do not attach HLS, use the Haskell Tree-sitter parser, or run
Ormolu/Verilog formatters on save. No Classic language server, semantic
completion, or automatic formatter is configured. Existing Haskell and Verilog
support remains separate. This is editor-only support: install `bsc` separately
on the machine where you compile, and keep build commands/options in each
project's Makefile (`:make` from the project directory).

Restart Neovim and open a `.bs` file. Check `:set filetype?` (expected
`bluespec`), `:set shiftwidth?` (expected `2`), and `:ConformInfo` (no formatter).
From the Neovim config directory, run:

```bash
nvim --headless '+luafile tests/bluespec.lua' +qa
```

## Racket / PLAI 3.2.5

PLAI 3.2.5 uses `#lang plait` for much of its interpreter code and `#lang racket`
for some chapters, including macros. Keep the language declaration from each
chapter at the top of your `.rkt` file.

Install Racket from <https://download.racket-lang.org/>, then run:

```bash
raco pkg install --auto plait racket-langserver
```

The macOS application installer is detected by the login shell and Neovim.
On Linux, put Racket's `bin` directory on PATH. Neovim uses native Racket
highlighting/indentation and the Racket language server for diagnostics,
completion, and navigation. Restart Neovim after installing the packages.

In a `.rkt` buffer, `Space r r` saves and runs the file in a terminal split;
`Space r i` saves and loads it into a fresh interactive Racket session. These
commands run in the source file's directory. Use `Esc Esc` to leave terminal
input mode and `:q` to close the split. Start a new session after editing to reload
definitions. DrRacket remains useful for the book's graphical Step demonstrations.

For a quick check, save and run:

```racket
#lang plait
(define (double [x : Number]) : Number
  (+ x x))
(test (double 21) 42)
```

## AI chat

CodeCompanion chat authenticates through ChatGPT when first opened. Its ACP
chat is the single Neovim AI entry point, so no OpenAI API key is required.
