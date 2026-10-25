# 交互协议与恢复

## 先检查宿主

运行时检查当前已暴露工具及 schema。磁盘装有扩展不等于当前 Agent 可调用；不能假造 ask_user。Pi 有等价工具时检查参数、freeform/取消语义后复用。没有则明确说明，回退当前宿主真实提问工具；也没有则普通对话提问并等待。不要把 Codex 的异步提问称为 Pi 测试成功。

调查本机配置时仅看包/扩展启用信息，不读取凭据。不要自动安装扩展或编写替代扩展。用户确认安装后才可执行上游命令 `pi install npm:pi-ask-user`；安装后按宿主方式重新加载并检查实际暴露工具。新版本接口优先于下列核验记录。

## 已核验的 pi-ask-user 接口（2026-10-25）

依据 [上游 README](https://github.com/edlsh/pi-ask-user#parameters) 与 [源码](https://github.com/edlsh/pi-ask-user/blob/main/index.ts)。当前实验未安装该包；这里是接入说明，不是成功调用记录。

单题自由文本：
```json
{"question":"针对记录中的 scan → scatter，你如何解释目标位置的由来？可以不知道或跳过。","allowFreeform":true}
```
两至四个独立问题用 `questions`，每项 `question`、可选 `context`、`allowFreeform:true`；省略 options 进入文本输入。批量时不要在顶层同时传 context/options/allowMultiple/allowFreeform。Q ID 记录在本地数组中，或放入 question 文本，不能发未经 schema 允许的 id。依赖问题下一次调用。

读取结果 details（保留原始结果，不仅提炼摘要）：
- 单题：`question, context?, options, response, cancelled`；freeform response 是 `{kind:"freeform",text:...}`，选择型是 `{kind:"selection",selections:[...],comment?:...}`。
- 批量：`kind:"batch", questions, answers, cancelled`。按提交时顺序映射；每项为 `{status:"answered",response:...}` 或 `{status:"skipped"}`。取消批次 answers 可为空，不能补空答案。先检查 cancelled 再解释 answers。
- 失败结果不保证上述形状；error、空结果、索引数量不符均不得认定回答。未暴露明确原因的 null/cancelled 不推断是超时还是手动取消。
- 批量页面中的草稿不是提交答案；fallback 模式取消一题可能取消全批。
- 默认不设短 timeout。工具超时不自动跳过；保留未确认，允许恢复。

## 轻量持久化（不建数据库）

每批实验目录保存 session.json（当前状态）和 transcript.md（问题/原始结果/评估的追加记录），加来源清单或快照。提问前写状态，结果到达先保存原始内容，再评估，再更新状态；写临时文件并原子替换 session.json。不要把这些文件写进 Sources。

session.json 最少字段：batch_id、skill_version、stage、source_refs、question_order、questions（id/source_refs/text/round/depends_on/status/answer_ref/assessment_ref）、followup_rounds_used、tool（name/availability）、preview_authorization、notes、next_action。状态如 pending/answered/skipped/unknown/cancelled/error 与解释等级分别存储。

transcript.md 每条记录有稳定 ID、来源（live-tool / live-chat / user-supplied-history）、问题原文、答案原文、工具原始返回或对话定位、评估、剩余缺口。引用历史回答不可伪造 tool_call_id。日志包含本批学习回答，避免顺手复制整个私有会话。

恢复时核对 batch_id、来源和问题顺序，读原始答复并检查最新状态；回答/评估引用缺失时保持等待。真实结果已存但状态未更新，可重做评估，不能重问已答题。没有新回复不重复弹同一批问题。无法写盘就给可复制状态包，说明需用户下次带回，不声称可靠持久化。

## 状态门槛

| 事件 | 状态与下一步 |
|---|---|
| 有待问题 | ANALYZE → AWAITING_CLARIFICATION，调用并停等 |
| 收到提交 | 先记原文，再 ASSESS；部分提交仍未答项保持 pending |
| 实际答复需要关键追问 | ASSESS → AWAITING_CLARIFICATION；最多一轮 |
| 全部已处理，或用户明确结束澄清并继续草稿 | ASSESS → SYNTHESIZE → REVIEW；跳过缺口仍保留 |
| 初始零题且理由充分 | ANALYZE → ASSESS（仅来源评估）→ SYNTHESIZE |
| 取消/错误/超时/异步工具仅返回 accepted | AWAITING_CLARIFICATION；不生成依赖答案的笔记 |
| 本次明确授权未澄清预览 | 主状态仍等待；另存 preview 草稿与授权证据，不能伪装完成正常流程 |

异步宿主的 accepted 仅表示表单发出；真实新消息才是答复。等待期间可以修改 Skill、整理来源、检查接口，不能把 elapsed time 当回答。普通对话回退应清楚给问题并结束该轮；用户可稍后继续。
