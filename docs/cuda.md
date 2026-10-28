# CUDA 开发

Neovim 将 `.cu` 和 `.cuh` 识别为 `cuda`，启用 clangd 补全、跳转和诊断，复用 C++ Treesitter 高亮与缩进，并通过 clang-format 格式化。C++ 语法树是基础支持，CUDA 特有语法不保证完全解析；clangd 的语义高亮可补充类型信息。

建议在装有 CUDA Toolkit 的 Linux 开发机上运行 Neovim、clangd 和构建工具。macOS 可以编辑文件，但本配置不会安装 CUDA 或提供 GPU 运行环境。以下文件属于 CUDA 项目，不要放入全局 Neovim 配置。

## 最小 CMake 项目

项目包含 `CMakeLists.txt` 和自己的 `main.cu`：

```cmake
cmake_minimum_required(VERSION 3.24)
project(cuda_demo LANGUAGES CXX CUDA)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
add_executable(cuda_demo main.cu)
set_target_properties(cuda_demo PROPERTIES
  CXX_STANDARD 17 CXX_STANDARD_REQUIRED YES
  CUDA_STANDARD 17 CUDA_STANDARD_REQUIRED YES)
```

在配有目标 GPU 的 Linux 机器上配置、构建：

```sh
cmake -S . -B build -G Ninja -DCMAKE_CUDA_ARCHITECTURES=native
cmake --build build
./build/cuda_demo
```

无 GPU 的构建机需要将 `native` 换成目标架构数字。跨机器发布时也应明确指定目标架构。长时间构建放在专用 tmux pane 中。`build/` 和生成的编译数据库属于项目构建产物，不应加入 dotfiles 或同步源。

## 项目级 .clangd

CMake 会生成 `build/compile_commands.json`，但 NVCC 的命令不能保证被 clangd 直接理解。先用下面的独立 CUDA 解析配置作为起点，避免 NVCC 专用参数造成误报；普通 C/C++ 文件仍使用编译数据库。

在项目根目录创建 `.clangd`，将路径和架构替换为开发机实际值（`sm_80` 仅为示例，不是推荐的通用架构）：

```yaml
If:
  PathMatch: .*\.(cu|cuh)
CompileFlags:
  CompilationDatabase: None
  Compiler: clang++
  Add:
    - -xcuda
    - -std=c++17
    - --cuda-path=/usr/local/cuda
    - --cuda-gpu-arch=sm_80
```

此方式需要手动补齐项目的 `-I`、`-D` 等参数，并保持标准与真实构建一致。`.clangd` 不会像 shell 一样展开 `$CUDA_HOME`，应填写真实路径；机器专属值可放到 clangd 用户配置中，并用绝对 `PathMatch` 限定项目，不要应用到所有 C++ 文件。

大型项目可以将 `CompilationDatabase: None` 改成 `CompilationDatabase: build`，再按实际命令用 `Remove` 清理 NVCC 专用参数。注意 `-gencode VALUE` 等分离参数的值也必须处理，不能只移除选项名；不要盲目删除所有编译参数。遇到 response file（如 `--options-file`）也需要展开并保留其中的 include 路径与宏。可根据 clangd 日志生成独立的 clang 兼容编译数据库。

不要通过手工定义 `__CUDA_ARCH__` 或关闭全部诊断来掩盖工具链不匹配。clangd/LLVM 与 CUDA Toolkit 的版本须兼容。

## 检查

- 打开 `.cu` / `.cuh` 后，`:set filetype?` 应显示 `cuda`。
- `:checkhealth vim.lsp` 检查 clangd，`:ConformInfo` 检查 clang-format。
- `<leader>f` 手动格式化；保存时沿用现有自动格式化行为。
- `:Inspect` 检查高亮；C++ parser 未安装时先运行 `:TSInstall cpp`。
- 在项目根目录运行 `clangd --check=main.cu` 检查解析参数；实际编译仍以 NVCC/CMake 结果为准。

参考：[clangd 配置](https://clangd.llvm.org/config)、[NVIDIA CUDA/CUTLASS 编辑器配置](https://docs.nvidia.com/cutlass/4.3.0/media/docs/cpp/ide_setup.html)、[CMake 编译数据库](https://cmake.org/cmake/help/latest/variable/CMAKE_EXPORT_COMPILE_COMMANDS.html)。

## 本机 macOS 静态解析（CS149）

本机已配置 Apple clangd 21 + CUDA 12.8 静态解析资源。配置位于
`~/Library/Preferences/clangd/config.yaml`，使用绝对 `PathMatch`，仅作用于
`~/Developer/cs149/` 下的 `.cu` / `.cuh`；不改变普通 C++ 或远程 Linux 配置。

资源位于 `~/.local/share/cuda-editor/12.8/`，不放入 dotfiles、不通过 Syncthing 分发。
来源为 NVIDIA 官方 `redistrib_12.8.0.json` 中的 `cuda_cudart`、`cuda_nvcc`、
`cuda_cccl`、`libcurand` 的 Linux x86_64 组件；下载后按清单 SHA-256 校验，
仅提取 `include/` 与 `nvvm/` 中的普通文件，并创建供 clangd 检测布局的 `bin/` 目录。
组件清单保存在资源目录中。未安装或执行 Linux NVCC，也未安装 GPU 驱动。

该配置使用 `-xcuda`、`-std=c++17`、`--cuda-path=资源目录`、
`--cuda-gpu-arch=sm_80`，并关闭此范围内的编译数据库读取。
`sm_80` 是本地解析基线，未来应与运行服务器的架构和 Toolkit 版本对齐；
项目新增 include 路径和宏时需同步补齐。这里保留真实 CUDA 类型和诊断，
不通过伪造声明或屏蔽错误来隐藏缺失依赖。

必须保留 `nvvm/libdevice`：当前 Apple clangd 配合 `-nocudalib` 会使 kernel launch
产生 `cudaConfigureCall` 未声明错误。此组合仅验证本地 clangd 解析；
Apple clang++ 的真实 CUDA 编译不是受支持的运行方案，编译和运行仍在 Linux GPU 上完成。

更新配置后重启 Neovim，再打开 `saxpy.cu`。排查时运行：

```sh
clangd --check="$HOME/Developer/cs149/asst3/saxpy/saxpy.cu"
```

迁移到其他 Mac 时需重新准备上述本机资源，并按新的项目绝对路径创建用户配置。
回退时删除用户配置中的这个 CS149 配置段即可；资源目录可保留供以后使用。
