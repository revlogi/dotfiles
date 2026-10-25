# 质量标杆：真实历史回答，而非默认答案

下列三条回答由用户在 v0.2 任务的“CS149 案例”中提供，属于 user-supplied-history。它们是 Few-shot 与评估输入，不是新任务用户的默认理解。对其他用户或批次不得复制回答。问题数量按缺口选择，不固定三题。

## H1：scan 到 scatter 的桥梁

来源：`Find Repeats，generate flags → exclusive scan → scatter。Blelloch Scan。`
问题：为什么 Exclusive Scan 的结果可以作为 Scatter 的目标位置？
用户历史原话：
> 因为 flag 数组标记了所有重复开始的地方，之后任意位置的前缀和就是目标位置之前有几个合法位置，也即 scatter 的下标/目标位置。

评估：核心计数关系 Explained；“重复开始”指代仍 Unclear，不在没有题目规格时判错。正文保留“前面有效项的数量决定输出位置”为 User-expressed；`p[i]=sum(flag[0:i])`、唯一性推导为 AI-supplemented。如果题意是相邻相等对，连续三个相同值可产生两个合法索引，不一定只取重复段的首位——这是条件化说明，不是已证实用户错误。

## H2：分阶段评估 Blelloch

问题：Upsweep 与 Downsweep 分别在做什么？
用户历史原话：
> upsweep 是在构建一个二叉规约树，downsweep 是将树分为左右两部分然后分别构建 prefix sum。

评估：Upsweep 的规约树直觉已表达；Downsweep 只描述结果形状，缺少“节点携带区间之前的前缀”的不变量，整体 Partial，不标全部理解。
一次依赖 H2 的追问：给数组 `[3,1,2,4]`，已知左右子树总和 4、6，根前缀 0；你会给右子树什么初始前缀？为什么？
这里不把正确值写进问题。答“4”但无原因仅支持结果；答不知道则 Unknown、结束追问；未回复为 Pending。完整传播规则只能留 AI-supplemented 或 Unresolved。

## H3：从题目到模式

问题：除了 Find Repeats，还有哪些问题能用 Flag → Scan → Scatter？
用户历史原话：
> 找出某个数列中所有符合某个条件的值。

评估：Generalization Explained，筛选是用户表达的可复用 Trigger；不推断掌握稳定性、空数组或 GPU 实现细节。不再重复问同一个泛化问题。

## Haskell：没有历史回答的对照

Source：`Functor; Maybe, IO, (->) r; Functor law`。
优先一题：你凭什么共同特征联系这几个实例？选最有直觉的一个说明，并指出哪个还不清楚。
若回答显示函数实例仍卡住且愿继续，下一轮给出 `h :: r -> a` 与 `g :: a -> b` 问如何得到 `r -> b`。不要预先给出组合等式当提示答案。若只记得名称则保留 Unknown/Unclear，定律正文为 AI-supplemented。即使 Maybe 解释充分，也不能提升 IO、函数实例和 laws 的归属。

## v0.3：从学习叙述到概念提炼

这些是编辑示例，不是新增用户回答。

- Stream Compaction：不要用“用户已解释前缀计数”作核心。应提炼为“将保留条件编码成 Flag，再用 Exclusive Scan 把有效项之前的数量转换为紧凑输出下标；只散射有效项即可稳定筛选”。计数直觉由 H1 支持，公式/稳定性推导仍归 AI。
- Functor：不要用“它们接受一个类型参数”代替核心。中心是保持 f 的结构/计算上下文，将 `a -> b` 提升为 `f a -> f b`，遵守恒等与复合律。用户只谈类型形状的答复留在 Learning State，不能借正确 Core Idea 把 laws 升级。
- CUDA：线程组织与执行分组属于一个中心；host 何时能读回结果需要 stream/同步机制，是另一中心。若原文两者都有，主篇解释 grid/block/thread 与 warp，异步另篇，互相给一个明确关联。不要为了只交三篇而悄悄删除同步条件。

三例的 Core Idea 都可由 AI 综合可靠资料形成。质量来自关系清晰、限定准确，不来自与用户原话字面相似。不是每次都要拆 CUDA，也不是每次都需三篇；依据实际主张聚类。
