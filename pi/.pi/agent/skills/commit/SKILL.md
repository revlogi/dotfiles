---
name: commit
description: 自动检查 Git 仓库状态（git status、git diff、git log），安全暂存（git add）并提交（git commit）改动，随后清晰解释本版相比上一版的核心改动以及 commit message 的写法依据。当用户要求提交代码、add 并 commit、生成提交并解释改动时加载。
---

# Git Commit & Change Explanation（自动暂存、提交与改动解析）

自动完成从仓库状态检查、`git add`、`git commit` 到**版本改动总结与 commit message 写法解析**的完整闭环。默认使用与用户相同的语言沟通（中文提问用中文解释），commit message 本身的语言与风格严格对齐当前仓库的 `git log` 历史（默认英文 Conventional Commits）。

## 1. 检查仓库状态与历史风格（Inspect）

在执行任何写入操作前，合并运行以下命令获取完整上下文：

1. **工作区与暂存区概览**：`git status --short --branch`
2. **改动内容对比**：
   - 未暂存改动：`git diff`
   - 已暂存改动：`git diff --staged`
   - 对未跟踪的新增文本文件（untracked files），先快速查看文件内容以判断其性质与作用。
3. **历史提交惯例**：`git log -n 20 --oneline`
   - 观察仓库现有的提交格式（是否使用 `<type>(<scope>): <summary>`、常用 `scope` 命名、英文或中文、祈使句风格）。

## 2. 筛选与暂存文件（Stage / `git add`）

根据用户指令与仓库现状安全地执行 `git add`：

1. **范围判定**：
   - 若用户指定了文件或目录，只暂存对应路径。
   - 若用户要求“把仓库里的内容 add 后 commit”且未指定文件，默认纳入所有属于本次逻辑改动的已修改/新增/删除文件。
2. **安全过滤（切勿盲目 `git add -A` 吞入噪音或敏感文件）**：
   - **严禁暂存敏感文件**：如 `.env*`、`auth.json`、`oauth.json`、`*.pem`、`*.key`、含明文 API Key/Token 的本地配置。
   - **排除系统与构建噪音**：如 `.DS_Store`、`node_modules/`、`.venv/`、`__pycache__/`、临时测试产物或未声明忽略规则的编译二进制文件。
   - **优先显式指定路径**：存在未跟踪噪音文件或无关改动时，使用 `git add <file1> <file2> ...` 精确暂存。
   - **消歧确认**：若发现疑似半成品、无关实验代码或拿不准是否应纳入本次提交的文件，优先调用 `ask_user` 请用户确认（非交互模式下则跳过存疑文件并在回复中说明）。

## 3. 生成并执行提交（Commit / `git commit`）

### Commit Message 规范

若仓库无特殊格式约定，默认采用 **Conventional Commits**：

```text
<type>(<scope>): <summary>

[optional body]
```

- **`type`（必填）**：
  - `feat`：新增功能、新 skill/工具或对用户可见的新能力
  - `fix`：修复 Bug、边界条件或错误行为
  - `refactor`：不改变外部行为的代码重构或结构整理
  - `docs`：仅文档、注释或说明更新
  - `chore`：配置、依赖、构建脚本或日常维护
  - `perf` / `test` / `style`：性能优化、测试补充、纯格式调整
- **`scope`（按需）**：沿用 `git log` 中已有的模块/子目录短名（如 `pi`、`nvim`、`parser`）；若改动跨越多处或仓库历史不用 `scope`，可省略。
- **`summary`（必填）**：简短祈使句（英文如 `add ...` / `fix ...` / `refactor ...`），不超过 72 字符，**末尾不加句号**，聚焦“做了什么及其意图”而非机械罗列文件名。
- **`body`（可选）**：仅当改动较大、包含多处联动或存在非显而易见的取舍时添加（空一行后写简短要点或段落）。
- **限制**：
  - 不添加 `Signed-off-by` 或 `Co-Authored-By` 等尾注（除非用户明确要求）。
  - **只执行 `git commit`，不执行 `git push`**（除非用户明确要求推送）。

执行提交后，运行 `git status --short --branch` 与 `git log -n 1 --stat` 验证提交成功。

## 4. 交付说明：改动解析与 Message 理由（Explain）

提交完成后，**必须**按以下三部分向用户输出清晰、精炼的总结（无需冗长寒暄，不要原样粘贴大段 diff）：

### 1) 提交结果概览
- **Commit**：`<short-hash>` — `<full commit subject>`
- **包含文件**：简要列出本次 `git add` 纳入提交的文件（若有特意排除/保留在工作区的未暂存文件，一句话说明原因）。

### 2) 这一版相比之前的改动（What Changed）
按**逻辑模块或功能意图**（而非按文件字母序记流水账）归纳本版相对上一版（`HEAD~1`）的变化：
- 改了哪些核心逻辑、新增了什么机制、修复了什么问题，或删除/简化了哪些冗余部分。
- 若涉及多个层面（如核心逻辑 + 配置更新 + 测试/文档），分点简明列出各层面的实质变化。

### 3) Commit Message 为什么这么写（Why This Message）
拆解并解释本次 commit message 的设计逻辑：
- **`type` 的选择**：为什么判定为 `feat` / `fix` / `refactor` / `chore` 等（例如：本次虽然修改了既有文件，但核心是引入了 X 新能力，因此用 `feat` 而非 `refactor`）。
- **`scope` 的选择**：为什么选用该 `scope`（或为什么省略），如何与仓库最近的 `git log` 历史惯例保持一致。
- **`summary`（及 `body`）的措辞考量**：为什么用这几个核心动词与宾语概括本次提交（抓住了什么主干意图、折中省略了哪些次要细节以保持标题精炼）。
