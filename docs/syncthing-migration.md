# Syncthing + Stow 迁移执行方案

状态（2026-09-07）：本机已安装并启动 Syncthing，建立 dotfiles Send Only 文件夹、90 天版本保留和忽略规则；已修复 Karabiner 目录链接并完成 Stow 部署。尚未添加其他设备，Git 历史仍保留。后续按 [其他设备接入指南](syncthing-devices.md) 操作。下文保留完整迁移顺序。

## 1. 最终结构

保持现有包结构，所有设备使用 `~/dotfiles` 作为真实配置目录。Mac mini 当前目录无需搬家；Syncthing 的文件夹名称可以叫 Dotfiles，不要求放在名为 Sync 的目录内。

- Mac mini：Send & Receive，日常可编辑，尽量保持在线。
- MacBook Air：Send & Receive，日常可编辑。
- 远程 Linux：Receive Only，接收配置，按平台选择 Stow 包。
- Git：迁移验收后退出活动目录，只保留迁移前归档，不再承担同步。
- Stow：每台机器分别建链接，链接指向本机 `~/dotfiles`。

同步源文件和 lockfile。Neovim 插件、Zim、tmux 插件、npm 依赖、Pi 凭据/会话等仍留在本机，不跨设备搬运。Mac 和 Linux 共用源码，已有平台分支继续生效。

注意：Linux Receive Only 只是阻止本地改动向外传播，不是发布审批。远端修改仍会自动到达并影响应用下一次读配置。需要冻结服务器环境时，先暂停该设备的同步文件夹，维护窗口再恢复、等同步完成、检查并重载。

## 2. 执行前准备

1. 选 Mac mini 当前配置为首次同步基准；暂停两台 Mac 上的配置编辑和 Karabiner GUI 设置修改。
2. 检查当前未提交改动。必须保留新 `dot/`、README 修改、本迁移文档以及音频模块删除；只导出 Git HEAD 会漏掉这些内容。
3. 对每台设备已有配置记录实际链接目标，保存与基准不同但仍需要的源码。不要让两套现有目录直接双向合并。
4. 使用 Time Machine 做本机恢复点。另把已审查的配置源码及现有 Git 历史归档到同步目录之外，归档不包含凭据、会话或依赖。不要直接打包整个当前目录，因为 Stow 部署后可能产生被 Git 忽略的本地状态。
5. 在同步以外保留恢复说明和 Syncthing 安装说明，避免配置同步坏了以后找不到恢复入口。

首次种子清单以 `git ls-files -z --cached --others --exclude-standard` 为起点，去重、排除已删除路径并审查新文件；导出当前工作区内容而非 HEAD。复制时保留文件执行权限和符号链接，不跟随链接复制目标。该导出步骤实施时制作并审查清单后再运行。

Mac 安装工具可使用 Homebrew：

```sh
brew install syncthing stow
brew services start syncthing
```

如果已使用 Syncthing 的 macOS 应用或其他启动方式，沿用现有方式，不再启动第二个实例。两台 Mac 都配置登录后自动启动；确认 mini 的实际睡眠策略允许预期的在线同步。Linux 按发行版安装 Syncthing，并配置用户服务；共享服务器是否允许长期运行服务需按机器规则处理。

## 3. 先配置忽略规则，再建立设备共享

每台设备的同步根目录都需要 `.stignore`。它本身不会通过 Syncthing 同步；推荐它仅包含：

```text
#include sync-ignore.txt
```

`sync-ignore.txt` 是可同步的公共规则文件。首次连接前，在接收端手工放好这两个文件，不能指望尚未同步到的 include 文件提供保护。

下面是基于当前目录的规则基线，实际启用前核对本机额外文件名：

```text
.git
.DS_Store
._*
node_modules
__pycache__
.venv
venv
*.pyc
*.pyo
*.zwc
.zcompdump*
*.sw?
*.un~
*.bak
*.tmp
*.log
*.pid
*~
.env
.env.*
.secrets
*.key
*.pem
*.crt
.idea
.vscode
/gh/.config/gh/hosts.yml
/hammerspoon/.hammerspoon/config.lua
/pi/.pi/agent/auth.json
/pi/.pi/agent/oauth.json
/pi/.pi/agent/models.json
/pi/.pi/agent/models-store.json
/pi/.pi/agent/trust.json
/pi/.pi/agent/sessions
/pi/.pi/agent/npm
/pi/.pi/agent/git
/pi/.pi/agent/bin
/pi/.pi/agent/tools
/pi/.pi/agent/.pi
/karabiner/.config/karabiner/automatic_backups
/nvim/.config/nvim/spell
/nvim/.config/nvim/tags
```

注意三个边界：

- Git ignore、Syncthing ignore、Stow ignore 是三种独立规则，不能互相替代。
- 不要写全局 `tools` 或 `sessions` 规则，以免误伤学习包的源码目录。
- 不忽略 `*.sync-conflict-*`：保留冲突副本，并让检查明确报告。自动扫描插件/脚本的目录尤其要避免加载冲突副本。

`~/.local/share/nvim`、`~/.local/state/nvim`、`~/.cache/nvim`、`~/.zim`、`~/.tmux/plugins` 和 Syncthing 自身数据库不在同步根目录内，不需要搬进去。

## 4. Mac mini 建立首次基准

1. 添加 `~/dotfiles`，Folder ID 固定为 `dotfiles`，初次暂设 Send Only。
2. 保持未共享，先扫描完成，核对同步文件清单和大小。不能出现认证文件、会话或依赖目录。
3. 对该文件夹启用 Staggered File Versioning，建议保留 90 天。
4. 开启文件系统监视，保留周期扫描默认值；两台 Mac 保留普通 Unix 权限同步，确保脚本仍可执行。不额外同步所有者、组或扩展属性。
5. 确认没有其他同步软件同时管理该目录。

## 5. MacBook Air 首次接入

1. 如果 Air 已有 `~/dotfiles`，先暂停相关应用，记录旧 Stow 部署和本机差异；将旧源码及必要本地状态妥善保存在同步范围之外。不要覆盖它，也不要先让它参与双向同步。
2. 在旧目录仍处于原路径时，对确实由该目录部署的包执行 Stow 删除链接的 dry run，再删除这些链接；Stow `-D` 只用于已确认的旧包。随后把旧目录移至本机归档位置。
3. 创建新的 `~/dotfiles`，只预置忽略规则。配对 mini，核验设备 ID，接受 `dotfiles` 文件夹，暂设 Receive Only。
4. 等两端显示 Up to Date，检查源码、权限、忽略规则；配置尚未安装时不要直接要求完整启动检查全通过。
5. 安装应用及依赖，按下一节部署链接；验证完成后，将 mini 和 Air 都改为 Send & Receive。
6. Air 同样启用版本保留并确认 Time Machine 覆盖该目录。

首次同步期间不使用 Override Changes / Revert Local Changes 处理不明差异。先核对来源与本机修改，再决定保留哪一份。

## 6. Stow 部署和依赖初始化

Mac mini 如果保留原路径，现有链接通常无需重建；Air 需要新建。先在每台 Mac 上模拟：

```sh
cd ~/dotfiles
stow --simulate --verbose -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --simulate --verbose --no-folding -t ~ pi
```

逐项处理已有普通文件或其他来源的链接，备份后再调整。不要使用 `--adopt` 把未知本机文件自动吸收进同步源。

无冲突后：

```sh
stow -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --no-folding -t ~ pi
```

Karabiner 必须确认 `~/.config/karabiner` 本身是目录链接，而不是仅 `karabiner.json` 是文件链接。目标目录已存在时 Stow 不一定自动得到目录链接，需要先处理原目录再部署。迁移路径后按 Karabiner 官方说明重启配置监视服务。

Pi 保持 `--no-folding`，不要把整个 `~/.pi/agent` 链接到同步源。凭据与会话留在真实的本机 agent 目录。检查源目录忽略状态只是第二道保护。

每台 Mac 按 README 的 Bootstrap 独立安装依赖：Brewfile、Zim、TPM、Neovim 插件，以及 Pi 根包和两个学习包的 `npm ci`。认证也各机进行。插件和二进制不从另一台复制。

## 7. 远程 Linux 接入

先确认服务器允许 Syncthing 常驻并能与 Mac 连接；不开放管理界面到公网，需要远程管理时使用 SSH 隧道。

按 Air 相同原则保留旧配置、解除旧来源链接，接收到干净的 `~/dotfiles`。文件夹保持 Receive Only，并启用版本保留。同步完整源码不会启用 Mac 功能，实际只部署：

```sh
cd ~/dotfiles
stow --simulate --verbose -t ~ dot zsh nvim tmux
stow -t ~ dot zsh nvim tmux
```

工具安装沿用 `docs/server.md`。Mac 专用包不部署。服务器若需要 Pi，单独安装依赖后显式部署 Pi，不作为本次默认项。

服务器 Receive Only 下的本地改动不会反馈到 Mac。修复通用配置应在 Mac 完成；确需本机差异时，在同步目录外增加明确的本机覆盖入口。出现本地改动提示先保留差异，不能直接点 Revert。

## 8. 迁移时一并完成的工具调整

以下已实施：README 同步来源说明、公共忽略规则、AGENTS.md 流程更新、`dot check sync/links`。其余作为验收与维护要求：

- 更新 README：部署来源改为 Syncthing，保留 Stow 与各机 Bootstrap。
- 扩展 `dot check`：检测冲突文件、关键断链、Karabiner 目录链接、Pi agent 是否错误折叠链接。
- 检查自动发现的脚本目录不会加载冲突副本。
- 更新 AGENTS.md：以文件检查和快照替代必须查看 Git 状态的流程，移除默认 commit/push 要求。
- 公共忽略规则作为文件管理，首次接入步骤明确复制 `.stignore` 和 include 文件。
- 文档明确：同步不安装软件、不保证多个文件作为一个事务到达、不自动重载全部应用。

`dot` 已能沿 symlink 定位配置根目录，不依赖 `.git`。保持 `~/dotfiles` 后，不需要为路径引入新框架。

## 9. 验收和退出 Git

1. 两台 Mac 和 Linux 均显示同步完成，无冲突；扫描列表不存在应忽略的状态文件。
2. 在 Mac mini 改一个无行为影响的 README 文本，确认 Air 和 Linux 收到；在 Air 改回，确认反向同步。
3. 两台 Mac 运行 `dot check`，逐项解释 SKIP，不把跳过算作通过。Linux 执行适用的检查。
4. 验证新终端、Neovim、tmux、Hammerspoon 应用快捷键、Karabiner；音频切换快捷键不再注册。Hammerspoon 需 Reload Config 才会移除旧会话中已注册的快捷键。
5. 验证两端编辑并保存后，应用目标仍是正确 symlink，没有被 GUI 原子写入替换成普通文件。
6. 用临时的普通测试文件，从另一设备修改/删除，验证版本恢复；测试结束清理该测试文件。
7. 稳定运行一周后，把旧 Git 元数据移到同步之外的历史归档，活动目录不再保留 `.git`。GitHub 历史可保留为只读参考，不再参与同步。不在本次方案阶段删除历史。

## 10. 恢复流程

出现错误先暂停所有相关设备的同步，避免恢复内容被再次覆盖。优先从文件版本或 Time Machine 恢复；跨多个文件的配置变更优先从同一恢复点恢复整组源码。

核对恢复后的源码和链接，运行检查，在一台机器上验证成功，再逐台恢复同步。必要时退回保留在同步之外的迁移前源码，并明确重建指向它的链接。

Syncthing 版本保留只覆盖从其他设备收到的替换/删除，不记录本机每次保存。因此两端版本保留和 Time Machine 都需要，不依赖同步副本充当完整备份。

## 参考

- [Syncthing 忽略规则](https://docs.syncthing.net/users/ignoring.html)
- [Syncthing 文件夹模式](https://docs.syncthing.net/users/foldertypes.html)
- [Syncthing 文件版本](https://docs.syncthing.net/users/versioning.html)
- [Karabiner 配置目录链接](https://karabiner-elements.pqrs.org/docs/manual/misc/configuration-file-path/)
