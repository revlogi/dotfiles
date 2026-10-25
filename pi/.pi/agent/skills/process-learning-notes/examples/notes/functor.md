---
status: draft
provisional: true
---
# Functor

## Core Idea

Functor 抽象了在保留结构或计算上下文 `f` 的情况下，将普通函数 `a -> b` 提升为 `f a -> f b` 的映射；这个由 `fmap` 提供的映射须满足恒等律与复合律。[C1]

## Mechanism / Usage

```haskell
fmap :: Functor f => (a -> b) -> f a -> f b
```

当转换函数作用于 a，而手中对象是 `f a` 时，fmap 将转换带入 f。Maybe 的映射保持 Nothing/Just 形状；IO 的映射变换动作的结果；`(->) r` 的映射变换函数的输出，共同点并不是物理“容器”。[C2]

## Worked Example

对函数实例，固定 r 后，`f a` 就是 `r -> a`。给定 `h :: r -> a` 和 `g :: a -> b`，输入 x 先经 h 得到 a，再经 g 得到 b，所以 `fmap g h = g . h`。[C3]

```haskell
h :: Int -> Int
h x = x + 2

mapped :: Int -> Int
mapped = fmap (*3) h
-- mapped 4 = 3 * (4 + 2) = 18
```

映射没有改变输入类型或输入值，改变的是输出的处理方式。

## Laws / Pitfalls

`fmap id = id`：映射恒等函数不改变结果；`fmap (g . h) = fmap g . fmap h`：一次映射组合函数与依次映射一致。例如 `fmap id (Just 2)` 应为 `Just 2`，不能丢成 Nothing。[C4]

接收一个类型参数的形状本身还不足以说明一个 lawful Functor；还需要相应的映射行为与定律。[C5]

## Recall

1. 从 `h :: r -> a` 与 `g :: a -> b` 怎样推导函数实例的 fmap？
2. 如果映射 id 会把 Just 变成 Nothing，违背了哪条关系？

## Learning State

Q-F1 表达了“它们都需要接受一个具体类型才能变成具体类型”，支持对共同类型形状的认识，仍为 Partial。并未解释 fmap、三个实例的统一机制或 laws；这些内容虽出现在知识正文中，仍不能标已掌握。

未决：哪个实例最有直觉、哪个还不清楚？能否用一个实例解释 laws 的约束？原话没有声称类型形状是充分条件，因此不判为已证实错误。

## Sources / Provenance

S1 L24–27：[原文](../sources/2026-10-25_09-21-10.md)，[路径与 slug](../source-manifest.json)。Q-F1：[v0.2 真实回答与评估](../evidence/transcript.md#q-f1)。R5：[Haskell base 4.14.1.0 Data.Functor](https://hackage-content.haskell.org/package/base-4.14.1.0/docs/Data-Functor.html)；版本仅为引用版本。

| Claim | 归属与范围 | 核验 |
|---|---|---|
| C1 | AI-supplemented：核心映射抽象与 laws；不是 Q-F1 的同义改写 | R5 |
| C2 | AI-supplemented：签名与三实例映射行为；S1 仅列过实例名 | R5 |
| C3 | AI-supplemented：函数实例推导、自构数值例子 | 类型链/求值手工核对；未运行 GHC |
| C4 | AI-supplemented：两条 laws 与 Maybe 例子 | R5、定义核对 |
| C5 | AI-supplemented：必要类型形状与完整契约的区分 | R5 的签名及定律；非用户错误诊断 |

User-expressed 的类型形状原话仅在 Learning State，未被提升为 C1–C5 的理解证据。
