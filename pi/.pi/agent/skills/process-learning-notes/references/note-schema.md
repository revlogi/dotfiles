# Concept Distillation 与三层笔记（v0.3）

## 三层职责

- **Knowledge**：正文直接解释概念、关系、机制、应用与边界。脱离学习对话仍可阅读。
- **Learning State**：已解释的关系、部分理解、未解决问题与纠错。解释状态沿用 ASSESS，不因正文变准确而升级。
- **Sources / Provenance**：主张来自哪里、由谁表达或补充、核验到哪一步；使用轻量 Claim ID 连接，不重复整份评估日志。

层是职责，不强制套三个多余的大标题。正文先放 Core Idea、Mechanism 等，末尾另设 Learning State 与 Sources。避免在知识正文反复出现“你记录了/用户回答/AI 补充/尚未证明理解”；学习叙述移入辅助层，事实的不确定性与必要适用条件仍必须留在知识层。

## 内部 Concept Distillation

这是 SYNTHESIZE 内的编辑步骤，不增加状态、Agent 或工具系统。

1. 从 Sources 与实际回答提取可定位的知识主张，保留归属和原评估；不把原话直接拼接成正文。
2. 必要时用一手资料核验/补足关键关系；未能核验的关键事实保持限定，不能包装为确定结论。
3. 聚类主张：是否共同回答一个问题、能否用同一个机制解释、是否共享一个代表性例子？若需要两个独立中心和两套机制，考虑拆分；仅为例子、使用条件或子步骤不同不拆。
4. 找出组织这些主张的中心关系，不默认第一条 Source/第一个回答最重要。
5. 写 1–2 句 Core Idea，优先表达关键抽象、转换或因果关系，而非所有步骤。
6. 通过下面的 Core Idea 检查，再围绕它写机制、例子、使用条件；完整推导放后文。
7. 将真实理解边界移入 Learning State，给关键主张补 Claim Mapping。混合来源的一句要在表中按子主张拆分，不整体标用户已解释。
8. 做全篇连贯性检查；减少重复和过程叙述，不以删除关键知识或来源边界换取短小。

仅在质量评估需要时留下简短的“中心关系/边界决定/核验结果”摘要，不要求日常暴露冗长内部推理或建立额外台账。

## Core Idea Distillation Guidelines

Core Idea 必须 concept-centric、concise、precise、explanatory、self-contained、reusable、non-redundant：直接描述概念，通常 1–2 句，保留必要限定，揭示一个重要关系或抽象，离开对话也成立，能帮助以后恢复理解，且不重复后面的完整机制/例子/陷阱。

可回答“本质思想是什么”“揭示什么关系”“理解必须抓住什么机制”中的关键一项，不机械全答。它不是 Source 摘要、用户回答复述、教科书开场白、操作清单、理解评估或 Open Questions 总结。经核验的 AI 综合可以构成 Core Idea；这不等于用户已经掌握。

### Core Idea Quality Check

逐项判断并记录真正失败的原因：
- 是否抓住本质关系，而非只说用途或列术语？
- 是否存在无用背景、学习过程或评估叙述？
- 是否仅改写记录，缺少关系提炼？
- 能否在不损失技术限定的前提下更短？
- 单独读能否知道对象与关键关系，代词是否有指代？
- 是否夹杂多个独立中心？

任一关键项失败，先改写；若无法用同一个中心统领材料，调整概念边界。1–2 句是默认而非删限定的硬指标。

### Note Coherence Check

机制是否解释 Core Idea 的关键关系；例子是否展示该机制；Trigger/Usage 是否支持未来识别；是否有不属于中心的大段内容；Learning State 是否侵入正文；是否重复解释同一关系。若正文正确但关键事实仅在来源表里，须恢复到正文，不能用追溯表代替学习资料。

## 按需模块

最小核心：标题、Core Idea、关键 Mechanism/Definition、Recall（1–3 题）、短 Learning State 与 Sources。Learning State 有缺口时保留具体 Open Questions，无证据时写未评估，不凭术语推断。
A 型按需加 Trigger & Transformation、Method/不变量、Worked Example、Pitfalls；B 型按需加 Motivation/Usage、必要类型、机制例子。复杂概念才加局部证明、第二个对比例子、Correction 或 Connections。重复模块合并，不填满所有标题。

Recall 是未来回忆提示，不是当前追加提问。Connections 必须解释联系，不盲建链接。仍遵循 Clarification 门槛，未回答且无预览授权时不能以“写知识资料”为理由跳过等待。

## 轻量 Claim-Level Mapping

正文用稳定 `[C1]` 等标记一组紧密相关主张；同一主张再次出现可复用 ID。末尾表写“ID/精确主张范围/归属及证据/核验状态”。不按每句机械贴标签，也不把整章混合归属压成一个不可分标签。

例如 Core Idea 同时包含前缀计数与稳定输出：前者由 H1 支持，后者的证明来自 AI；表中分别写 C1 的两个子范围。User-expressed 不等于正确或掌握；AI-supplemented 即使核验也不能变为用户理解。已知错误原话保留在 Learning State/Correction，附原来源、修正与依据；不能无痕改写。详细原文与评估链接到 transcript，不整份复制。

metadata 沿用 `status: draft`、`provisional`。既有缺口仍在则保持 true；改进文笔不改变解释等级或人工 Review 状态。
