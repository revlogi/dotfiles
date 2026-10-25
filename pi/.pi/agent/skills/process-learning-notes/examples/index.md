# 成品案例（非通用规则）

这些是固定的 v0.3 人工 Review 样例，作为 v1.0 的参考资料，非正式知识库内容。通用规则在 references/，实际输出必须根据当前 Sources/Answers 重新提炼。不要照抄案例的 Core、问题数量、拆分决定、Learning State 或 Claim 证据。

| 案例 | 值得参考的写法 | 不应机械复用 |
|---|---|---|
| [Stream Compaction](notes/stream-compaction.md) | 从计数关系到位置公式，例子解释冲突条件 | 不将所有算法都套 Flag/Scan/Scatter |
| [Functor](notes/functor.md) | 类型链说明抽象，kind 直觉与 fmap 理解分开 | 不把实例名当作用户理解 laws |
| [CUDA Execution Model](notes/cuda-execution-model.md) | 一个中心思想组织机制和例子 | 不默认所有 CUDA 输入都需同样章节 |
| [CUDA Asynchronous Execution](notes/cuda-asynchronous-execution.md) | 概念边界拆分，保留同步条件 | 不默认每次都拆出异步篇 |

优先只读一篇相关案例。需要核对归属时读 evidence/；sources/ 是只读案例快照，不是新批次输入。source-manifest.json 保留历史原路径/slug；离开原机器时应使用相对快照。案例中的用户回答只属于此案例，不能套用于其他学习者或新 Sources。原始回答与既有评估保持不变，不将案例状态视为默认掌握程度。
