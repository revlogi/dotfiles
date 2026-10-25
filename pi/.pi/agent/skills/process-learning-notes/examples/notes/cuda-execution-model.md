---
status: draft
provisional: true
---
# CUDA Execution Model

## Core Idea

Grid、Block、Thread 组织一次 CUDA kernel 的并行工作；block 内的线程再划分为由 32 个线程位置组成的 warp，按 SIMT 模型执行。区分工作组织层级与执行分组，有助于理解线程如何分工以及控制流分歧如何影响执行。[C1]

## Mechanism

Grid 包含多个 block，block 包含多个 thread；在线程程序中，索引决定各线程负责的数据。每个 block 被分配到一个 SM 上执行，其内部按 warp 分组。Warp 是执行分组，不是额外一级由程序员单独启动的工作单元。[C2]

SPMD 描述多个线程运行同一程序、处理不同数据；SIMT 允许线程沿不同控制路径。在一个 warp 内发生分支分歧时，不同路径由相应的活动线程执行，不能据“同一程序”断言所有线程始终做相同的事。[C3]

## Worked Example / Usage

一维启动 2 个 block、每个 64 个 thread，共 128 个逻辑线程；每个 block 分成 2 个 warp。用 `i = blockIdx.x * blockDim.x + threadIdx.x` 分配数组元素：block 1 的 thread 5 对应 i=69。[C4]

若 kernel 内有 `if (i % 2 == 0)`，同一 warp 内只有部分线程进入分支。工作分配仍由 i 决定，执行分歧则发生在 warp 层面。[C4]

## Pitfalls / Connections

逻辑线程数量不等于同一时刻实际并行执行的线程数量；最后一个不足 32 线程的 warp 可有未使用位置。不要把 warp 当作“32 个线程在所有情形下都可省略同步”的保证。[C5]

[CUDA Asynchronous Execution](cuda-asynchronous-execution.md)讨论另一问题：已启动的工作何时完成、host 何时可读结果。组织层级本身不能回答完成时间。[C6]

## Recall

1. 每个 block 的线程数变了，线程索引与 warp 划分分别如何变化？
2. 为什么运行同一 kernel 的线程仍可能产生分支分歧？

## Learning State

S1 明确记录过组织层级与 warp 大小，但没有解释控制流或性能机制。`SIMT/SIMD` 的斜杠含义仍未确认，不能直接判为混淆。关于 cudaMemcpy 的 Q-C1 回答及其限制移入关联异步笔记，未删除或提升其评估。

## Sources / Provenance

S1 L9–14：[原文](../sources/2026-10-25_09-21-10.md)，[路径与 slug](../source-manifest.json)。R1：[NVIDIA CUDA Programming Model §1.2.2](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html)。

| Claim | 归属与范围 | 核验 |
|---|---|---|
| C1：层级、warp 大小 | User-expressed：S1 L11–12；表述精炼为 AI 综合 | R1 |
| C1：SIMT、分歧与解释价值 | AI-supplemented；S1 L13–14 只提术语 | R1 |
| C2、C3 | AI-supplemented：映射到 SM、执行/编程模式关系 | R1 |
| C4 | AI-supplemented：自构配置、索引、分歧例子 | R1 规则与算术核对，非运行结果 |
| C5、C6 | AI-supplemented：执行限制与概念边界 | R1 及关联笔记的同步依据 |

已表达层级不代表已解释 C2–C6；本轮没有新增学习回答。
