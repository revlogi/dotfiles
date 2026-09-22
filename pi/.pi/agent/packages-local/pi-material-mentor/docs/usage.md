# Material-first learning 使用指南

> 这是当前保留供回退和迁移参考的旧工作流；`settings.json` 默认加载的是新的 `pi-teach` package。

这套工作流的目标是：**让人写的 material 决定学习主线，让 Pi 负责暴露理解缺口。** 对实现已经过时或风格不合适的材料，也可以只保留它的课程框架，改用现代资料和实现完成学习。

它不是让 AI 重新生成一本更容易读的教材，而是建立下面这个循环：

```text
选择一小段 material
        ↓
在 HTML 页对照原文、辅助讲解与图解
        ↓
提交解释或预测，Pi 自动评估并回传反馈
        ↓
用作业、证明或实现任务完成真实应用
        ↓
自动记录作答证据，Pi 更新有证据的掌握状态
        ↓
继续下一小段
```

## 1. 准备工作

确认 Pi 配置已经由 GNU Stow 部署：

```bash
cd ~/dotfiles
stow -t ~ pi
```

本仓库的 `~/.pi` 已经链接到 dotfiles 时不需要重复执行。`pi-material-mentor` 作为独立的本地 Pi package 由 `settings.json` 加载。你可以用下面的命令检查资源是否加载：

```bash
pi --offline --no-session --verbose
```

启动信息中应该能看到：

- skill：`material-mentor`
- prompts：`/learn`、`/teach`、`/learn-modern`、`/check`、`/review`、`/explore`、`/checkpoint`
- extension：`ask-user.ts`
- extension：`learning-workspace.ts`
- extension：`interactive-lessons.ts`

`bash-guard.ts`、`change-log.ts` 和第三方 `/btw` 属于基础 Pi 配置，不是本 package 的依赖。

看到以后按 `Ctrl-D` 退出即可。

## 2. 创建一门课程

课程最好直接放在 Obsidian Vault 里面。以 CII 为例：

```bash
~/.pi/agent/packages-local/pi-material-mentor/skills/material-mentor/scripts/init-course.sh \
  ~/Documents/Obsidian/MyVault/Learning/CII \
  "C Interfaces and Implementations"
```

脚本会生成：

```text
CII/
├── COURSE.md
├── PROGRESS.md
├── CONCEPTS.md
├── QUESTIONS.md
├── material/
├── concepts/
└── sessions/
```

脚本可以重复运行；已经存在的文件会被保留，不会被模板覆盖。

### 放入 material

把作为课程主线的人写材料放进 `material/`：

```text
material/
├── ch01.md
├── ch02.md
├── ch03.md
└── examples/
    └── list.c
```

v0.1 最适合 Markdown、纯文本和源代码。PDF、网页或视频最好先转换成保留标题结构和来源位置的 Markdown；不要默认让 AI 总结后再把总结当作 primary material。

### 填写课程目标

打开 `COURSE.md`，至少补充这两部分：

```markdown
## Primary material

- C Interfaces and Implementations, David R. Hanson
- `material/` 下的章节和配套源码

## Goal

- 理解书中的 interface-oriented C design。
- 能够解释主要设计选择，并独立实现简化版本。
```

课程已经学过一部分时，也可以手动填写 `Current position`，不必从头开始。

## 3. 启动学习 session

始终从具体课程的根目录启动 Pi：

```bash
cd ~/Documents/Obsidian/MyVault/Learning/CII
pi
```

`COURSE.md` 所在目录就是课程根目录。若从 Vault 根目录或其他项目目录启动，Pi 无法可靠判断你当前要学哪门课程。

## 4. 主要命令

### `/learn [section]`

基于一小段原材料，生成配套 HTML 教学页。`/teach` 是同一模式的入口。

```text
/learn
```

Pi 会先处理尚未评估的作答，再根据课程状态选择下一小段。页面包含：

- 原文摘录、精确位置和打开完整原文的链接；
- 与原文分开的 AI 讲解、可选图解和一个学习目标；
- 少量解释、预测或应用题，以及按需提示。

也可以显式指定：

```text
/learn chapter 5 §5.1–§5.3
```

打开 Pi 返回的本机 URL，保持 Pi 运行。在页面提交回答后，证据立即保存，Pi 自动评估、维护课程状态，再把反馈显示到页面。提示请求也会记录。阅读位置需要你主动确认，打开课件不会被算作学完。

只想获得阅读任务时明确说“这次只做阅读导航”。服务命令：`/lesson status` 查看地址，`/lesson stop` 停止，`/lesson 001-topic.json` 重新打开已有课件。退出或切换 Pi session 后服务会停止。

远程 Linux 上运行 Pi 时，假设返回端口为 43210，在 Mac 用 `ssh -L 43210:127.0.0.1:43210 <主机>` 转发，再打开 `http://127.0.0.1:43210`。不要把服务暴露到公网。两台 Mac 同步课件和课程文件即可，各自在本机开启页面；不要同时写同一门课程的 Markdown 状态。

### `/learn-modern [section]`

保留 material 的章节结构和核心问题，但不要求复现作者的具体实现。适合 CII 这类框架仍有价值、实现语境或代码风格已经不适合作为学习重点的材料。

```text
/learn-modern chapter 7
```

Pi 会把本次内容分成三层：

- **Durable idea**：接口、契约、不变量、所有权和复杂度等长期有效的问题；
- **Book design**：作者的方案及其历史假设，作为对照而不是标准答案；
- **Modern alternatives**：少量经过验证的当前资料或维护良好的实现。

它会先要求你选择设计、写测试、画接口或尝试实现，再提供完整方案。需要外部资料时优先使用标准、官方文档和活跃项目源码；不会因为实现更“新”就默认它更好。

例如：

```text
/learn-modern chapter 8 Tables
```

可以让 Pi 沿用 Chapter 8 的主题与问题顺序，同时用现代 C API、测试方式或哈希表实现作为主要实践对象，把 Hanson 的代码降级为比较材料。

### `/check [focus]`

读完以后做一个低负担的印象检查。它用于辨认核心区别和常见误区，不负责证明已经掌握。

```text
/check
```

Pi 默认给两道、最多三道选择题，一次只显示一道。每题有三个互斥选项；作答后会立即得到两到四句反馈。答错时 Pi 直接解释最关键的区别，不再通过连续追问增加负担。

也可以限定检查内容：

```text
/check ownership of stored values
```

建议尽量不看书回答。选择题全部正确只记录为 recognition evidence，状态仍是 `developing`；不能仅凭猜对或辨认把概念标记为 `solid`。

真正的巩固放在课程自身的实践里：

- CS70：独立完成 Discussion、Homework 或证明，再核对 solution；
- CII：设计接口、补测试、改进实现或增加功能，并验证行为；
- 其他课程：优先使用原课程的习题、实验、项目或迁移任务。

这些独立应用经过检查后，才可以作为 `solid` 的主要证据。

### `/review [concept]`

复习以前学过的内容，检查能否在没有原文提示的情况下取回和应用。

```text
/review
```

Pi 会结合时间、薄弱程度和当前章节选择概念。你也可以指定：

```text
/review opaque representation
```

Review 通常使用解释、预测或迁移题，而不是只问定义。回答后 Pi 才重新查看 material、核对差异并更新 evidence。

### `/explore <question>`

临时离开作者主线，做连接、批判、现代化或外部研究。

```text
/explore 如果今天用 C23 重新设计这个 List API，会有哪些选择？
```

Explore 输出应该明确区分：

- 作者原本的设计和语境；
- Pi 基于原文做出的分析；
- 来自 material 之外、需要验证的 external context。

最后必须回到当前学习目标，而不是无限延伸。如果问题现在不值得展开，可以让 Pi 把它追加到 `QUESTIONS.md`。

### `/checkpoint [note]`

显式结束当前学习段并写入状态，不再额外出题或开启新内容：

```text
/checkpoint finished Discussion 0A problems 1–3 independently
```

Pi 只会根据当前 session 中已经完成并验证的工作更新：

- `COURSE.md` 的已确认位置和下一步；
- `PROGRESS.md` 的具体证据；
- `QUESTIONS.md` 的未决问题；
- `sessions/YYYY-MM-DD.md` 的简短 checkpoint。

没有可观察证据时不会为了“看起来有进度”而改动 `PROGRESS.md`。这个命令是自动 checkpoint 不可靠时的显式兜底，也适合在退出 Pi 前使用。

## 5. `/btw`：不污染主线的旁支问题

正在学习时突然想到一个相关但不该打断主线的问题，可以使用：

```text
/btw Rust 的 borrow checker 为什么能避免这里的 lifetime 问题？
```

`/btw` 会打开独立的 side chat。适合：

- 快速澄清一个术语；
- 问工具或环境问题；
- 临时比较另一门语言；
- 判断一个兔子洞是否值得加入 `QUESTIONS.md`。

需要形成课程证据、修改进度或做正式 exploration 时，仍然回到主对话使用 `/check` 或 `/explore`。

## 6. 一次完整 session 示例

```text
你：/learn chapter 5

Pi：为 material/ch05.md §5.1–§5.3 生成小课件，返回本机 URL。
    目标：理解 List representation 如何隐藏实现。
    页面：原文、List_T 的辅助图解和一个预测题。

你：打开 Pi 给出的 HTML 页，对照原文和讲解，提交自己的解释。

Pi：自动保存作答、核对原文，并把具体反馈返回到页面。

你：根据反馈尝试一个变式，必要时点击提示。

Pi：区分有提示练习与独立应用，自动更新 PROGRESS 和下一步。

你：在外部编辑器完成实现后，告诉 Pi 文件位置让它检查。

Pi：记录 recognition evidence，并把下一步指向 Discussion、Homework
    或一个真实的实现任务。

你：/explore 这种 opaque pointer 设计在现代 C library 里仍然常见吗？

Pi：区分书中设计与外部资料，完成比较后回到下一节。

你：/checkpoint （可选）

Pi：写入本次可验证证据，并只留下一个下一步。
```

## 7. 课程上下文、安全和修改可见性

从课程目录启动 Pi 后，`learning-workspace.ts` 会自动识别最近的 `COURSE.md` 和 `material/`，在状态栏显示课程，并向 agent 注入一小段课程状态约束。它不会把所有 state 或 material 塞进 context；agent 仍然只按当前任务读取必要片段。

常用命令：

```text
/course-status          查看 Current position 和 Next
/material-write status  查看 material/ 写保护状态
/material-write on      明确导入或维护 source 时临时开放
/material-write off     恢复 material/ 默认只读
/safety status          查看危险 shell 命令确认是否开启
/changes                查看本 session 经 edit/write 修改过的文件
/changes clear          确认后清空清单，不修改任何文件
```

默认情况下，Pi 的 `write`、`edit` 以及明显会写入的 shell 命令不能修改课程的 `material/`。危险删除、特权命令、破坏性 Git 操作和磁盘命令会要求一次确认；非交互模式下直接阻止。

`/changes` 只记录 Pi 内置 `edit`/`write` 的路径和行数，不保存完整文件内容，也不冒充撤销系统。Shell 命令产生的修改不在清单中；Git 项目仍以 `git status` 和 `git diff` 为准。

## 8. Pi 和你分别维护什么

| 路径 | 主要维护者 | 用途 |
|---|---|---|
| `material/` | 你 / 作者 | 课程主线；Pi 默认只读。 |
| `COURSE.md` | 共享 | 教材、目标、已确认位置和下一段。 |
| `PROGRESS.md` | Pi | 概念状态和可观察的掌握证据。 |
| `QUESTIONS.md` | 共享 | 未决问题和主动搁置的兔子洞。 |
| `CONCEPTS.md` | 共享 | 稀疏的跨章节、跨课程连接。 |
| `concepts/` | 你 | 你主动写的长期知识笔记。 |
| `sessions/` | Pi | 简短 session 状态，不是聊天全文。 |
| `lessons/` | Pi | 基于原文的小课件 JSON，由本机服务渲染成 HTML。 |
| `learning/` | 运行时 | 课件版本、原文哈希、作答/提示事件和评估反馈。 |

`PROGRESS.md` 使用四种状态：

- `not-started`：还没有证据；
- `developing`：在提示下能解释，或只完成了部分应用；
- `solid`：能够独立解释，并成功预测或应用；
- `review`：以前掌握，但到了复习时间，或最近证据出现矛盾。

Pi 不应该用一个正确选择题就把概念标记为 `solid`。

## 9. Obsidian 如何参与

Obsidian 和 Pi 不需要 API 或同步插件。它们直接读写同一组 Markdown：

```text
Obsidian ──读取/编辑──┐
                     ├── course Markdown files
Pi ───────读取/编辑──┘
```

推荐在 Obsidian 中：

- 查看和手动修正 `COURSE.md`；
- 阅读 `PROGRESS.md` 和 session notes；
- 整理 `QUESTIONS.md`；
- 自己编写 `concepts/` 下的长期笔记；
- 用 `[[wikilinks]]` 连接跨课程概念。

不要把完整 AI 对话批量导入 Vault。聊天是临时交互，learning state 才是长期资产。

## 10. 推荐的日常节奏

一次 30～45 分钟的 session 可以这样安排：

1. `/learn` 或 `/learn-modern`：确定一小段目标。
2. 15～25 分钟：自己阅读、推导、运行或实现。
3. `/check`：完成两到三道低负担选择题，加深对核心区别的印象。
4. 用课程习题、证明、测试或实现任务完成真实巩固。
5. 页面作答后自动保存证据并请求 Pi 更新状态；`/checkpoint` 仅按需补充或收尾。
6. 隔天或隔几天用 `/review` 做 retrieval practice。
7. 把有意思但不紧急的问题留在 `QUESTIONS.md`。

材料太难时缩小 chunk，而不是让 Pi 一次把整章重讲一遍。

## 11. 常见问题

### Pi 找不到课程

确认当前目录里同时存在 `COURSE.md` 和 `material/`：

```bash
pwd
ls COURSE.md material
```

然后从这个目录重新启动 `pi`。

### `/learn` 等命令没有出现

运行：

```bash
pi --offline --no-session --verbose
```

确认资源列表；如果刚修改过配置，退出并重新启动 Pi。

### 没有弹出回答界面

`ask_user` 需要交互式 TUI。请直接运行 `pi`，不要使用 `pi -p` 或其他非交互模式。

### Pi 一上来就给完整解释

重新使用 `/check`，并补充：

```text
先别解释，只问一个诊断问题。
```

如果同一模式反复出现，再调整 `material-mentor/SKILL.md`，而不是在每门课程里复制 prompt。

### Pi 把外部观点当成作者观点

要求它按 `Material / Mentor analysis / External context` 三层重新回答。需要离开原文时显式使用 `/explore`。

### 作答保存了，但没有反馈

先确认 Pi 正在运行且模型请求正常。证据写盘和 AI 评估是两步；模型失败时答案不会丢失，下次课程对话会检查未评估记录。页面等待反馈最多约六分钟，之后可回 Pi 查看。服务已关闭时不要关掉尚未提交的页面，先保留文字，再重新打开课件。

### 进度记录和实际情况不一致

告诉 Pi 哪条判断不准确，让它对照 `learning/events/` 的作答证据修正；也可以直接在 Obsidian 修正。外部练习需要主动提交结果或文件位置。页面不会监控 Obsidian、终端或阅读器，也不会把阅读时长当成掌握证据。

### Pi 提示 material 受到保护

普通学习时这是预期行为。只有在你明确要求导入、替换或整理 primary source 时运行：

```text
/material-write on
```

完成后再运行 `/material-write off`。这个开关只在当前 Pi session 生效。

## 12. v0.1 暂时不做什么

当前版本刻意不包含：

- vector database 或 RAG；
- AI 自动生成整套课程；
- 自动生成大量 concept notes；
- 完整聊天记录归档；
- 自动 spaced-repetition 调度；
- Obsidian active-note/selection bridge；
- 无证据的自动 session-lifecycle 写入；
- multi-agent teaching。

先用真实课程跑几章。只有当某个手工步骤反复成为摩擦点时，再把它升级成 v0.2 功能。
