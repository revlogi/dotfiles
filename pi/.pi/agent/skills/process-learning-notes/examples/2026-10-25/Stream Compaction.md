---
type: concept
status: draft
domain: parallel-computing
aliases: [流压缩, 并行筛选, Flag-Scan-Scatter]
tags: [cs149, scan]
sources: ["[[2026-10-25_09-22-47]]"]
created: 2026-10-25
---
# Stream Compaction

> [!abstract] Core Idea
> 并行筛选的难点是每个线程不知道该写到输出的哪里：把“是否保留”编码成 $0/1$ flag 并做 Exclusive Scan，每个保留项就得到“它前面有几个保留项”，这正是它在紧凑输出中的下标，于是各线程可以独立、无冲突、保序地写入。

## 机制

**触发信号**：每个元素能够独立判断去留，而结果要求连续存放（筛选、去重、提取满足条件的下标）。

三步，每一步都可以完全并行：

1. **Flag**：$\text{flag}[i] = \begin{cases} 1, & \text{若位置 } i \text{ 需要保留} \\ 0, & \text{否则} \end{cases}$
2. **Exclusive Scan**：$\text{pos}[i] = \sum_{j < i} \text{flag}[j]$
3. **Scatter**：若 $\text{flag}[i] = 1$，写入 $\text{out}[\text{pos}[i]] = \text{要输出的值或下标}$

**为什么不冲突、顺序不变**：对任意两个保留项 $i < k$，由于 $\text{flag}[i] = 1$ 且其余项 $\ge 0$，有：

$$\text{pos}[k] - \text{pos}[i] = \sum_{j=i}^{k-1} \text{flag}[j] \ge \text{flag}[i] = 1 \implies \text{pos}[k] > \text{pos}[i]$$

因此不同保留项的目标下标严格递增，既互不冲突，也保持原有相对顺序。$\text{pos}$ 中出现重复值没有关系：重复只发生在 $\text{flag}[i] = 0$ 的位置上，而它们不写入。

输出总长度 $= \text{pos}[n-1] + \text{flag}[n-1]$。

## 例子：CS149 Find Repeats

题目：输出所有满足 $A[i] = A[i+1]$ 的下标 $i$。

| $i$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| $A[i]$ | 1 | 2 | 2 | 1 | 1 | 1 | 3 | 5 | 3 | 3 |
| $\text{flag}[i]$ | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 1 | 0 |
| $\text{pos}[i]$ | 0 | 0 | 1 | 1 | 2 | 3 | 3 | 3 | 3 | 4 |

Scatter 写入的是**下标 $i$** 而不是元素值：$\text{out} = [1, 3, 4, 8]$，长度为 $4 + 0 = 4$。
注意 $i = 3, 4$ 都被标记：三个连续的 $1$ 构成两对相邻相等的元素。

## 陷阱

- 必须用 **Exclusive** Scan。Inclusive Scan 包含当前项 $\text{flag}[i]$，得到的是从 $1$ 开始的计数，需要减 $1$ 才能作为零基下标。
- Flag 阶段要做边界检查：$A[i+1]$ 在 $i = n-1$ 时越界，这一项的 flag 应置为 $0$。
- Scatter 可以写元素值 $A[i]$，也可以写下标 $i$ 或任何派生数据，取决于题目需求。

## 关联

- [[Blelloch Scan]]：第 2 步 Exclusive Scan 的一种 $O(n)$ 工作量并行实现。使用本模式时，并不需要关心 scan 内部如何实现。
- [[CUDA 执行模型]]：三步分别对应三个 kernel（或合并以减少全局内存读写），每个线程处理一个下标 $i$。

## 我的理解

- 💬「因为 flag 数组标记了所有重复开始的地方，之后任意位置的前缀和就是目标位置之前有几个合法位置，也即 scatter 的下标/目标位置。」（H1）
  ✅ 抓住了核心：前缀计数就是输出下标。“重复开始的地方”与题目规格稍有出入：被标记的是每一个满足 $A[i]=A[i+1]$ 的 $i$，所以三个连续相同值会产生两个下标（见例子）。
- 💬「找出某个数列中所有符合某个条件的值。」（H3）
  ✅ 正确地把作业推广为一般的条件筛选。
- ❓ 为什么 $\text{pos}$ 有重复值时 Scatter 仍然不会冲突？（答案见“机制”中的不等式推导；可用来自测）

## Recall

1. 为什么“前面有几个保留项”恰好就是零基输出下标？
2. 用 $\text{pos}[k] - \text{pos}[i]$ 说明为什么不同保留项不会写到同一个位置。

## 参考

- 来源：[[2026-10-25_09-22-47]] L19–20；回答 H1、H3 见 `_triage-2026-10-25`
- [CS149 Asst3](https://github.com/stanford-cs149/asst3)：Find Repeats 的题目规格与示例
- [GPU Gems 3 §39.3.1 Stream Compaction](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)：Flag-Scan-Scatter 的标准表述
