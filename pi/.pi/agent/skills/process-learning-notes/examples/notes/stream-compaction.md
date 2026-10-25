---
status: draft
provisional: true
---
# Stream Compaction

## Core Idea

Flag 标记要保留的元素，Exclusive Scan 将每个有效元素之前的有效元素数量转成它在紧凑输出中的零基下标；只对有效元素执行 Scatter，就能按原顺序得到筛选结果。[C1]

## Trigger & Mechanism

当每个输入项能独立判断是否保留，而输出要连续排列时，可把筛选问题转化为位置分配问题。[C2]

令 `flag[i] ∈ {0,1}`，计算 `p[i] = Σ(j < i) flag[j]`，仅在 `flag[i]=1` 时写入 `out[p[i]] = input[i]`。对两个保留项 i<k，有 `p[k]-p[i]=Σ(i≤j<k)flag[j]≥1`，因此写入不冲突，且输出顺序与输入一致。[C3]

## Worked Example

保留正数：[C4]

| i | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| input | -2 | 5 | 0 | 7 | 3 |
| flag | 0 | 1 | 0 | 1 | 1 |
| p | 0 | 0 | 1 | 1 | 2 |

输出为 `[5,7,3]`。i=2 和 i=3 的 p 都是 1，但前者不写入，所以没有冲突。

## Pitfalls / Connections

非空输入的输出长度是 `p[n-1]+flag[n-1]`；空输入单独返回 0。Inclusive Scan 包含当前项，不能不经调整就当作这里的零基下标。[C5]

Parallel Prefix Scan 提供位置前缀；Blelloch Scan 是实现它的一种算法，具体树传播不是使用这一筛选模式的前提。[C6]

## Recall

1. 为什么有效项之前的数量恰好是输出下标？
2. p 有重复值时，什么条件保证 Scatter 不冲突？

## Learning State

H1 已解释前缀计数与位置的关系；H3 已把作业泛化为条件筛选。公式、无冲突证明和边界处理仍为补充，未有解释证据。

未决：“重复开始”指相邻相等对还是重复段首位（H1）？上面的正数例子不用于复原未知题意。Blelloch 的右侧前缀已由 Q-B1 解释，左侧继承与递归不变量仍未解释；详见 [原评估](../evidence/03-blelloch-partial.md)。

## Sources / Provenance

S4 L18–21：[原文](../sources/2026-10-25_09-22-47.md)；[原路径与 slug](../source-manifest.json)。H1/H3 为用户提供的历史答复，Q-B1 为 v0.2 真实交互答复，均见 [原始记录](../evidence/transcript.md)。R3：[NVIDIA GPU Gems 3 §39.1、39.2.2、39.3.1](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)。

| Claim | 归属与范围 | 核验 |
|---|---|---|
| C1：流程、计数直觉 | User-expressed：S4 L20、H1；Core 的概念化措辞为 AI 综合 | R3 支持 |
| C1：稳定输出结论 | AI-supplemented；不能由 H1 自动推出用户已解释稳定性 | R3 与 C3 推导 |
| C2 | User-expressed：H3 的条件筛选；独立判断/连续输出的适用条件为 AI-supplemented | R3 |
| C3 | AI-supplemented：精确公式、唯一性与顺序证明 | 代数推导核对 |
| C4 | AI-supplemented：自构正数例子，非原题 | 逐项演算核对 |
| C5、C6 | AI-supplemented：边界与算法关联 | 定义推导、R3 |

归属记录表达来源，不认证掌握；外部核验不提升学习状态。
