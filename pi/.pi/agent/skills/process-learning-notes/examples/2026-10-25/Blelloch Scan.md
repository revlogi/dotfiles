---
type: concept
status: draft
domain: parallel-computing
mastery: partial
last_reviewed: 2026-10-25
aliases: [Blelloch 扫描, work-efficient scan, 工作高效前缀和]
tags: [cs149, scan]
sources: ["[[2026-10-25_09-22-47]]"]
created: 2026-10-25
---
# Blelloch Scan

> [!abstract] Core Idea
> Upsweep 自底向上建求和树，Downsweep 自顶向下传递“该区间**左边**所有元素之和”（左孩子继承父值，右孩子 $=$ 父值 $+$ 左兄弟区间和），传到叶子就是 exclusive 前缀和；每个树节点只处理常数次，所以工作量 $O(n)$、深度 $O(\log n)$。

## 机制

**Upsweep（归约）**：相邻两两相加，逐层向上，节点存子树区间和，根是总和 $\sum_{i=0}^{n-1} a_i$。

**Downsweep（分发）**：把根设为单位元 $0$，然后每层对每个节点：

```
left  ← parent              // 左区间左边的元素和 = 父区间左边的元素和
right ← parent + sum(left)  // 右区间左边 = 父区间左边 + 整个左区间和
```

不变量：**进入一个节点时，它的值等于该区间左边所有元素的和。** 叶子区间是单个元素 $a_i$，因此得到 exclusive 前缀和 $\sum_{j < i} a_j$。

**为什么是 $O(n)$**：两趟各访问树的每个内部节点一次，共约 $2(n-1)$ 次加法。Hillis–Steele 扫描每一层对所有元素都加一次，总工作量为 $O(n \log n)$。

**要求**：运算 $\oplus$ 满足结合律，并且有单位元（加法为 $0$，$\max$ 为 $-\infty$）。

## 例子：$[3, 1, 2, 4]$

Upsweep：子树和为 $[3,1] \to 4$，$[2,4] \to 6$，根为 $10$。

Downsweep：

| 节点 | 进入值 | 左孩子 | 右孩子 |
|---|---|---|---|
| 根 $[3,1,2,4]$ | $0$ | $0$ | $0 + 4 = 4$ |
| $[3,1]$ | $0$ | $0$ | $0 + 3 = 3$ |
| $[2,4]$ | $4$ | $4$ | $4 + 2 = 6$ |

叶子：$[0, 3, 4, 6]$，即 exclusive scan。

原地数组版本：Upsweep 后数组为 `[3, 4, 2, 10]` $\to$ 末尾置 $0$ 得 `[3, 4, 2, 0]` $\to$ 步长 $2$：`[3, 0, 2, 4]` $\to$ 步长 $1$：`[0, 3, 4, 6]`。

## 陷阱

- 原地实现时，Downsweep 每一步要先保存左孩子的旧值（左子树和），再把左孩子覆盖为父值，然后右孩子 $=$ 父值 $+$ 旧值。顺序弄错就会丢失左子树和。
- 经典写法要求 $n$ 是 $2$ 的幂，否则需要用单位元补齐到 $2^{\lceil \log_2 n \rceil}$。
- 末尾置 $0$ 这一步就是“exclusive”的来源；想要 inclusive 结果，需要再逐项加上原值。

## 关联

- [[Stream Compaction]]：它的第 2 步需要 exclusive scan，本算法是这一步的 $O(n)$ 工作量并行实现。

## 我的理解

- 💬「upsweep 是在构建一个二叉规约树，downsweep 是将树分为左右两部分然后分别构建 prefix sum。」（H2）
  ◐ Upsweep 理解正确。Downsweep 只描述了“分成左右”，缺少关键的一环：每个节点传下去的值表示什么（该区间左边所有元素的和）。
- 💬「4，右子树需要根结点的值加上左子树总和，即0+4」（Q-B1）
  ✅ 右孩子规则解释正确，并且给出了原因。
- ❓ 为什么左孩子直接继承父节点的值，不需要加任何东西？
- ❓ 为什么递归到叶子时得到的是 exclusive 而不是 inclusive？

## Recall

1. Downsweep 中每个节点的值表示什么？由此推出左右孩子的更新公式。
2. 为什么 Blelloch 的总工作量是 $O(n)$，而 Hillis–Steele 是 $O(n \log n)$？

## 参考

- 来源：[[2026-10-25_09-22-47]] L21；回答 H2、Q-B1 见 `_triage-2026-10-25`
- [GPU Gems 3 §39.2.2 A Work-Efficient Parallel Scan](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)：Upsweep/Downsweep 的定义、$O(n)$ 工作量分析
- Blelloch, *Prefix Sums and Their Applications* (1990)：结合律与单位元的要求
