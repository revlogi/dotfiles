---
type: concept
status: draft
domain: algorithms
aliases: [Floyd Cycle Detection, 快慢指针, 龟兔赛跑, Tortoise and Hare]
tags: [leetcode, linked-list]
sources: ["[[2026-10-25_09-21-10]]", "[[2026-10-25_09-22-47]]"]
created: 2026-10-25
---
# Floyd 判圈

> [!abstract] Core Idea
> 快指针每步比慢指针多走 $1$ 格，入环后不可能跳过慢指针，所以有环必相遇；相遇时慢指针走过的路程是环长的整数倍，因此“表头到入口”与“相遇点到入口”的距离对环长同余，一个指针回到表头、两者同速前进就会在入口相遇，全程只需 $O(1)$ 额外空间。

## 机制

**触发信号**：序列由 $x_{k+1} = f(x_k)$ 生成，状态有限（链表的 `next`、数字变换、数组中“值即下一个下标”）。这样的序列最终一定进入一个环，形状像 $\rho$。

**第一阶段：判圈（LC 141）**

```
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow == fast: return True     # 有环
return False                          # fast 走到尾，无环
```

为什么必然相遇：两者都进入环后，每一步距离缩小 $1$，距离从 $d$ 递减到 $0$，中间不会跳过。

**第二阶段：找入口（LC 142）**

设表头到入口的距离为 $a$，入口到相遇点的距离为 $b$，环长为 $L$。相遇时慢指针走了 $a + b$，快指针走了 $2(a + b)$；两者相差的路程是在环里多绕的圈数 $kL$，所以：

$$2(a + b) - (a + b) = kL \implies a = kL - b = (k-1)L + (L - b)$$

$L - b$ 是从相遇点继续前进到入口的距离。因此一个指针从表头走 $a$ 步，另一个从相遇点走 $a$ 步，二者同时到达入口。

## 例子

链表 $1 \to 2 \to 3 \to 4 \to 5 \to 6 \to 3$（入口是 $3$，$a = 2$，$L = 4$）：

| 步 | slow | fast |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | 3 |
| 4 | 5 | 5 ← 相遇（$b = 2$） |

从 $1$ 和 $5$ 同速出发：$1 \to 2 \to 3$，$5 \to 6 \to 3$，在入口 $3$ 相遇。验证：$a = 2 = L - b = 4 - 2$。

## 陷阱

- 循环条件必须同时检查 `fast` 和 `fast.next`，否则无环时会空指针。
- 第二阶段两个指针都要**每次走 $1$ 步**。
- 用哈希集合也能做，但需要 $O(n)$ 空间；Floyd 的价值在于 $O(1)$ 空间。
- 同样的思路可用于 LC 287（寻找重复数：把数组看成 $i \to \text{nums}[i]$ 的链表）和 LC 202（快乐数）。

## 关联

- 本批没有其他相关笔记。

## 我的理解

- 💬「141 链表循环 快慢指针」（S1 L32）
  ◐ 方法记对了；没有说明为什么快指针不会跳过慢指针。
- 💬「142 寻找循环开始的节点 找到共同的之后 一个指针放回头再同时走」（S4 L26）
  ◐ 步骤正确；没有说明为什么会在入口相遇（见 `_triage` 中的问题 2）。
- ❓ 用 $a, b, L$ 推出 $a \equiv L - b \pmod L$。
- ❓ 如果快指针每次走 $3$ 步，还能保证相遇吗？

## Recall

1. 为什么快指针每次比慢指针多走 $1$ 步就不会跳过它？
2. 不看笔记，推导 $2(a+b) - (a+b) = kL \implies a = (k-1)L + (L-b)$，并解释它的几何意义。

## 参考

- 来源：[[2026-10-25_09-21-10]] L32；[[2026-10-25_09-22-47]] L26
- Knuth, *TAOCP* Vol. 2, §3.1 Exercise 6（Floyd 判圈）
- [Wikipedia — Cycle detection § Floyd's tortoise and hare](https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare)：正确性证明
