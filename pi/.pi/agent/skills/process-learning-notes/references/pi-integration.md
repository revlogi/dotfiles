# Pi v1.0 集成适配

安装位置：`~/.pi/agent/skills/process-learning-notes/`。Pi 启动时发现 name/description，使用时读取 SKILL.md；显式入口是 `/skill:process-learning-notes`。已有会话使用 `/reload` 重新加载资源或重启 Pi。

使用 Pi 已有 read/write/edit 与检索能力；使用 `pi-ask-user@0.17.0` 的 `ask_user` 收集自由文本。调用前仍检查当前 schema，详细返回值处理沿用 interaction.md。独立问题可批量，无 options 的 freeform 输入优先。无需创建新的 Extension。

本版本已授权安装该依赖；interaction.md 中“实验未安装”的描述是 v0.2 的历史核验记录，不代表 v1.0 当前安装状态。实际工具可用性以宿主工具表为准。已有 `/answer` 保留为人工回退，不需要重复安装。

把新批次输出目录明确设在 Vault 外。正常使用不得在 -p/headless 模式中把无法弹出 UI 当作已回答；这种模式只适合已经具备真实答案的恢复/综合测试。保持既有状态门槛与证据边界。
