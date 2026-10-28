# Syncthing：本机状态与其他设备接入

## 本机已经完成（2026-09-07）

- Homebrew Syncthing 2.1.3 已启动，LaunchAgent 在用户登录后自动运行。
- 管理界面：http://127.0.0.1:8384 （只监听本机）。
- Folder ID：`dotfiles`；路径：`/Users/liuguangxi/dotfiles`。
- 当前模式：**Send Only**，作为首次同步基准。尚未共享给任何远端设备。
- 首次扫描已核对：117 个文件、74 个目录；嵌套源码与普通排除测试已验证。
- `dot check` 完整检查：24 项通过，0 失败，0 跳过。
- 文件监视已启用，周期扫描为 3600 秒；普通权限同步开启，所有者和扩展属性同步关闭。
- Staggered 版本保留：90 天。仅保护收到的远端修改；在当前 Send Only 阶段，不产生来自远端修改的历史。
- `.stignore` 包含 `#include sync-ignore.txt`。公共规则排除状态与依赖，并只允许已知源码目录。
- Karabiner 已改成整个配置目录的 symlink，并重启用户服务。
- Pi 使用 `--no-folding`；旧学习包遗留的 20 个断链已记录后移除。
- 源码恢复快照与旧 Karabiner 目录：`~/DotfilesBackups/20260907-145834/`。
- Git 历史仍保留在原位置，被同步规则排除；等其他设备验收后再归档，不再需要日常 commit/push。
- Time Machine 检查未能挂载备份目标，尚不能确认有效系统备份。请连接备份盘并确认备份成功。

本机 Device ID（不是密码）：

```text
W7SACDV-GHWWW72-NG5N7PU-KDIMG6C-SXKPK3L-CVDJJRA-AGW2IXI-CC2EOAP
```

现在没有第二台设备，因此尚未验证端到端同步、远端冲突及版本恢复。需要另一台设备接入后完成下面的验收。

## MacBook Air：首次接入

### 1. 安装，启动，保留原配置

```sh
brew install syncthing stow
brew services start syncthing
```

如果已运行其他 Syncthing 应用，使用它，不要另启动 Homebrew 服务。打开本机 http://127.0.0.1:8384 。

已有 `~/dotfiles` 时，不要直接把它加入同名同步文件夹。先保存 Air 独有配置：

1. 退出配置编辑器；暂停 Karabiner GUI 修改。
2. 确认原包由旧 `~/dotfiles` 部署。先 `stow --simulate --verbose -D ...` 检查，再 `stow -D ...` 解除已确认的旧包链接；只填写实际部署过的包。
3. 将旧目录保存在同步之外，例如 `~/DotfilesBackups/air-before-sync/`。不要删掉真实的 `~/.pi/agent` 或其中认证/会话。
4. 对普通配置文件或来源不明的 symlink，逐项备份核对。不要运行 `stow --adopt` 或强制覆盖。

如果这一步不确定，先停在这里；空的新配置目录不应覆盖旧配置。

### 2. 先准备忽略规则，再共享

创建 `~/dotfiles`。从本机复制 **sync-ignore.txt** 到 Air 的同一路径，可用 AirDrop；已有 SSH 时也可用 scp。复制的是公共规则文件，不是整个源目录。

在 Air 执行：

```sh
mkdir -p ~/dotfiles
# 先把收到的 sync-ignore.txt 放到 ~/dotfiles/sync-ignore.txt
printf '#include sync-ignore.txt\n' > ~/dotfiles/.stignore
test -s ~/dotfiles/sync-ignore.txt
```

`.stignore` 不会自动同步。不要在 include 文件还不存在时开启扫描。

### 3. 配对两台设备

1. Air 页面选择 Add Remote Device，粘贴上面的本机 Device ID。
2. 在 mini 页面接受 Air 的连接请求，核对 Air 页面 Show ID 显示的完整 ID。
3. mini 编辑 Dotfiles 文件夹，在 Sharing 勾选 Air，保存。
4. Air 接受文件夹：Folder ID 必须为 `dotfiles`，路径为 Air 自己的 `~/dotfiles`，先选择 **Receive Only**。
5. Air 为该文件夹启用 Staggered File Versioning，最大年龄 90 天。
6. 等两端都显示 Up to Date，无失败项目。此时 Air 应有 README、dot、nvim、zsh、tmux、pi 等源码，不应有 `.git`、依赖或认证文件。

首次同步时不要点击 Override Changes 或 Revert Local Changes 来消除不明提示。

### 4. 安装应用并部署

```sh
cd ~/dotfiles
brew bundle
stow --simulate --verbose -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --simulate --verbose --no-folding -t ~ pi
```

`brew bundle` 安装的是当前完整应用清单；如不想安装全部应用，先查看 Brewfile，至少准备当前要部署的工具。

模拟无冲突后执行：

```sh
stow -t ~ dot zsh nvim tmux vim kitty gh hammerspoon karabiner
stow --no-folding -t ~ pi
```

Karabiner 检查：

```sh
test -L ~/.config/karabiner
```

必须是目录链接。已有普通目录时，先保留其独有内容，再将原目录移到备份位置后重跑 Stow；不能只链接 `karabiner.json`。改变路径后退出并重新登录 macOS，使 Karabiner 重新监视新目录。

### 5. 初始化各机依赖

```sh
zsh -ilc exit
# 仅当 TPM 尚不存在时执行 clone
# git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
~/.tmux/plugins/tpm/bin/install_plugins
nvim --headless "+Lazy! sync" +qa
npm --prefix ~/.pi/agent ci
npm --prefix ~/.pi/agent/packages-local/pi-anki-english ci
```

`brew bundle` 已包含 Pi 测试所需的 Bun。认证和 AnkiConnect 各机单独配置，不要从 mini 搬认证文件：

- GitHub CLI：运行 `gh auth login`。
- Codex：运行 `codex`，首次启动时按提示选择支持的登录方式。
- Pi：使用 `/login` 命令。
- Neovim CodeCompanion：首次打开聊天时通过 ChatGPT 认证，详见[编辑器说明](editor.md#ai-chat)。

凭据、会话、依赖、缓存和运行时状态均保留在本机，不参与同步。

初始化可能更新 lockfile；如果 Air 因此提示本地修改，先比较差异，不直接丢弃。

### 6. 切换日常双向模式

1. 运行 `~/.local/bin/dot check`，解释并处理所有失败/跳过项。
2. 两台 Mac 的 Dotfiles 都改成 **Send & Receive**。
3. 用临时普通文本文件在 mini 创建、Air 修改、mini 删除，验证双向同步；在接收远端变化的一端检查版本记录。
4. 测试新终端、Neovim、tmux、Karabiner 和 Hammerspoon。Hammerspoon 菜单执行 Reload Config，移除旧音频快捷键。

## 远程 Linux：接入步骤

### 1. 准备服务和目录

按发行版安装 Syncthing、Stow；Ubuntu/Debian 可使用发行版 apt 包，Fedora 使用 dnf。共享服务器先确认允许常驻用户服务及所需网络连接。

有 systemd 用户服务时：

```sh
systemctl --user enable --now syncthing.service
```

是否在退出 SSH 后继续运行取决于服务器的用户会话/linger 策略；按管理员规则处理。没有该服务单元时按 Syncthing 官方用户服务说明安装，不要用临时 SSH 前台进程代替可靠启动配置。

与 Air 一样，先保留旧配置、解除旧来源链接、建立干净的 `~/dotfiles` 并预置两个忽略文件。

### 2. 通过 SSH 隧道打开服务器管理页

在 Mac 上执行，把 `user@server` 换成实际目标：

```sh
ssh -N -L 8385:127.0.0.1:8384 user@server
```

在 Mac 浏览器打开 http://127.0.0.1:8385 。服务器管理界面保持监听 loopback，不对公网开放。这个隧道只用于管理；同步数据仍需服务器与 mini 的 Syncthing 连接可达。

按 Air 相同流程配对、核验 ID、共享 `dotfiles`。服务器文件夹设为 **Receive Only**，保留 90 天版本，等待同步完成。

### 3. 只部署服务器包

```sh
cd ~/dotfiles
stow --simulate --verbose -t ~ dot zsh nvim tmux
stow -t ~ dot zsh nvim tmux
```

依赖按 `docs/server.md` 安装，不能复制 macOS 二进制、插件依赖或虚拟环境。初始化 Zim、TPM、Neovim；Pi 不作为服务器默认包。

```sh
~/.local/bin/dot check sync
~/.local/bin/dot check links
~/.local/bin/dot check stow
~/.local/bin/dot check zsh
~/.local/bin/dot check nvim
```

Receive Only 不阻止远端配置自动到达。生产任务期间若要冻结配置，在服务器端暂停此文件夹，维护窗口恢复后等待同步完成、检查再重载。不要在服务器改共享文件后期待它自动回传。

## 日常操作与恢复

- 在任意 Mac 改配置，换设备前确认同步完成。
- `dot check sync` 检查同步服务和冲突副本，`dot check links` 检查关键部署来源及状态隔离。
- 遇到 `sync-conflict` 文件先解决再启动相关应用；Neovim/Pi 等会发现脚本的应用可能误加载副本。
- 增加新的顶层包时更新 `sync-ignore.txt` 的允许列表，再在需要的设备上 Stow。
- 修改已有文件不需要重新 Stow；新增文件/移动文件后，每台机器都应重新模拟并部署。使用 `--no-folding` 的 Pi 尤其需要注意。
- 配置更新不会自动安装依赖，也不代表运行中的应用已经重载。多个文件不是作为一个事务同步，大改后等同步完成再重载。
- 不在同步目录内切 Git 分支或恢复旧提交；历史仅临时保留作为退路。
- 发生错误先暂停相关设备同步，用版本记录或本机快照恢复，检查后逐台恢复同步。
- 本机快照含源码和旧链接恢复清单，不是完整系统备份；连接 Time Machine 目标并确认备份。

## 参考

- [Syncthing 文件夹模式](https://docs.syncthing.net/users/foldertypes.html)
- [忽略规则与 include](https://docs.syncthing.net/users/ignoring.html)
- [版本保留](https://docs.syncthing.net/users/versioning.html)
- [Karabiner 配置目录](https://karabiner-elements.pqrs.org/docs/manual/misc/configuration-file-path/)
