# Tang Nano 9K 开源 SystemVerilog 工具链

## 已安装版本（Apple Silicon）

机器本地、不会经 Syncthing 同步的版本化目录：

- `~/.local/opt/oss-cad-suite-2026-09-15`，官方 YosysHQ darwin-arm64 日构建，`VERSION=20260915`
  - 归档 SHA-256：`c7717a571ede8c915dc641e6b783ed6a87bd502e4d9f61f19411dc72d9df4fd6`
  - Yosys `0.69+59`（git `d85872386-dirty`），内建 `read_slang`
  - Slang `11.0.448+e222e7dc0`
  - Verilator `5.053 devel`（`v5.052-85-g270c528af`）
  - nextpnr-himbaechel `nextpnr-0.11.1-27-g6030081a`
  - Apycula/gowin_pack `0.34.dev6+g81b3a9eb7`
  - openFPGALoader `1.1.1`
- `~/.local/opt/surfer-0.7.0`，Surfer 官方 `v0.7.0` macOS aarch64 发行资产
  - 归档 SHA-256：`ad19c7ae9e8a0e663a1edc01ac0a5f4993ec18ef55e76a1ad35541d4ecf222ed`
  - 二进制已确认是 Mach-O arm64
- 稳定入口分别是 `oss-cad-suite-current` 与 `surfer-current` 符号链接；每个版本目录内有 `FPGA_SETUP_MANIFEST.txt`。

发行信息由官方 API 解析：

- OSS CAD Suite：<https://api.github.com/repos/YosysHQ/oss-cad-suite-build/releases/tags/2026-09-15>
- Surfer：<https://gitlab.com/api/v4/projects/surfer-project%2Fsurfer/releases/permalink/latest>

YosysHQ 当日 `2026-09-16` 的 latest release 尚无 darwin-arm64 资产，因此固定到 API 可解析且确有该资产的最新完整日构建 `2026-09-15`。归档来源是 <https://github.com/YosysHQ/oss-cad-suite-build/releases/download/2026-09-15/oss-cad-suite-darwin-arm64-20260915.tgz>；Surfer 来源是官方 GitLab package asset。安装时仅对这两个刚下载的可信目录移除了 `com.apple.quarantine`，没有全局关闭 Gatekeeper。

套件已经包含 openFPGALoader，故未安装 Homebrew 回退版本；`Brewfile` 没有加入它。套件当前 FST C++ 构建需要 keg-local 的 lz4 头文件，已有 Homebrew `lz4 1.10.0`，并在 `Brewfile` 显式记录。没有执行 `brew bundle`。

## 使用方式

`dot/.local/bin/fpga` 是按需包装器；它只在子进程中加载套件环境，不把套件 Python、库或工具永久加入全局 `PATH`：

```bash
stow --no-folding -t ~ dot
fpga env
fpga yosys -V
fpga verilator --version
fpga nextpnr-himbaechel --version
fpga shell                    # 临时交互环境，exit 后恢复
fpga wave build/waves.fst     # 本机原生 Surfer
```

可用 `OSS_CAD_SUITE=/path/to/suite` 和 `SURFER_HOME=/path/to/surfer` 临时覆盖版本。包装器会在安装缺失时明确报错，并正确引用含空格的参数。Linux 可使用同一包装器，但必须自行把相应 Linux 版套件放到同样的 current 路径；固定架构二进制绝不放进 dotfiles。

独立起步工程位于 `~/Developer/fpga/tangnano9k`：

```bash
cd ~/Developer/fpga/tangnano9k
make lint
make sim        # 自检 reset 和四次计数回绕；生成 FST
make wave
make build      # read_slang -> synth_gowin -> nextpnr -> gowin_pack
make load       # 仅在明确执行时写 SRAM，断电丢失
make flash      # 仅在明确执行时写非易失 Flash
make clean
```

`load` 是默认硬件下载方式；`flash` 刻意分开。安装和验证没有自动编程任何硬件。器件参数固定为 `GW1NR-LV9QN88PC6/I5`、`family=GW1N-9C`；nextpnr 以真实 27 MHz 约束运行，不使用 `--timing-allow-fail`。

## SystemVerilog 支持边界

“能仿真”与“能综合”不是同一承诺：

- **原始 SV 仿真**：Verilator 直接编译 RTL 与 testbench，支持本项目使用的 `#` 延时、task、字符串、`$dump*`、`$error/$fatal`、断言及 `--timing --assert --trace-fst`。这些 testbench 结构不是硬件。
- **综合**：Yosys 的内建 `read_slang` 负责较完整的 SystemVerilog 解析/展开，然后 `synth_gowin` 只接受可映射为硬件的子集。动态延时、文件 I/O、类、许多验证语法及多数 testbench 系统任务不可综合。
- 应保持 testbench 和 RTL 分文件列表；“Verilator lint/sim 通过”不代表综合、器件映射、引脚或时序通过，必须另跑 `make build`。
- Slang/Yosys 与 Gowin 开源后端仍可能不支持厂商特有原语或最新语言角落；复杂 IP 要单独验证。

示例使用单一 27 MHz 时钟和 clock-enable，不生成逻辑分频时钟。引脚与极性依据固定版本官方来源：Sipeed [约束](https://github.com/sipeed/TangNano-9K-example/blob/c3b795799f23de91982be52db4273a8eea100cdb/led/src/9K_LED_project.cst)、[低有效 reset/LED RTL](https://github.com/sipeed/TangNano-9K-example/blob/c3b795799f23de91982be52db4273a8eea100cdb/led/src/LED.v)、[27 MHz 板卡页](https://wiki.sipeed.com/hardware/en/tang/Tang-Nano-9K/Nano-9K.html)，以及 YosysHQ/Apicula [器件与 I/O 电压约束](https://github.com/YosysHQ/apicula/blob/e3eb31c6aa057dec56e8a90589508d194d0409e5/examples/tangnano9k.cst)。本例采用 pin 52 时钟、pin 4 低有效 S1/reset、pin 10/11/13/14/15/16 低有效 LED。

## 限制与硬件

- openFPGALoader 支持 `tangnano9k` board profile；本次只执行了只读 USB 扫描，结果为 **No USB devices found**。因此没有实板下载测试。
- Apycula 可选加速模块（numpy/msgspec/fastcrc）未随套件提供，打包会警告并较慢，但本次 bitstream 生成成功；不要把全局 Python 包塞进套件来消除警告。
- Surfer 的 `make wave` 会启动 GUI；无显示环境可仅生成 `build/waves.fst`，再复制到有 GUI 的机器查看。
- macOS FST 编译通过 Homebrew lz4 的 keg 路径；Linux 通常使用系统开发包，若缺 `lz4.h` 需用该发行版包管理器安装开发包。

## 更新与回滚

更新时先通过官方 API 选择完整发行版，校验 SHA-256，安装到**新的**版本目录，验证后再原子切换 current 链接；不要覆盖旧目录，也不要同步二进制。

本次工具安装目标原先不存在；恢复记录位于 `~/.local/state/fpga-setup/backups/20260916T060850Z`。其中 `Brewfile.before` 是依据安装前读取的文件内容，移除本次新增的唯一 lz4 行后重建的原版。恢复前先对比，保留后续修改。

若只撤销 FPGA 命令，先用 `readlink ~/.local/bin/fpga` 确认它指向本仓库 `dot/.local/bin/fpga`，然后仅解除这一个链接；不需要撤销整个 dot 包。工具目录和工程建议先移动到本机备份目录，确认无用后再删除。不要删除已经加入个人练习的工程，也不要为回滚卸载可能被其他软件依赖的 lz4。

切换工具版本只需在核对目标后调整 `oss-cad-suite-current` 和 `surfer-current` 链接，并保留原版本目录。

首次下载示例后按一次 S1/reset：本例没有自动上电复位。按钮直接作为异步复位，尚未加入同步释放与消抖；这些适合作为下一步练习。
