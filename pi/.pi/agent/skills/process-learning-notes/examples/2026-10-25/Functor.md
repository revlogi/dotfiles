---
type: concept
status: draft
domain: haskell
aliases: [函子, fmap]
tags: [haskell, typeclass]
sources: ["[[2026-10-25_09-21-10]]"]
created: 2026-10-25
---
# Functor

> [!abstract] Core Idea
> Functor 是能“只变换里面的值、不改变外层结构”的类型构造器（Maybe 的有/无、IO 的副作用、`r -> _` 的输入）：`fmap` 把 `a -> b` 提升为 `f a -> f b`，两条定律正是“只动值、不动结构”的形式化。

## 机制

```haskell
class Functor f where
  fmap :: (a -> b) -> f a -> f b
```

`f` 必须是“缺一个类型参数”的类型构造器（kind `* -> *`）：`f a` 才能是具体类型。

| 实例 | “结构” | `fmap g` 做什么 |
|---|---|---|
| `Maybe` | 有值还是 `Nothing` | `Just x → Just (g x)`；`Nothing` 保持不变 |
| `IO` | 要执行的副作用 | 执行同样的动作，把结果再交给 g |
| `(->) r` | 输入 `r` | 先用原函数得到 a，再交给 g：`fmap g h = g . h` |

**函数实例的推导**：固定 r 后，`f a = r -> a`。手里有 `h :: r -> a` 和 `g :: a -> b`，要得到 `r -> b`，唯一自然的做法是 `\x -> g (h x)`，也就是 `g . h`。

## 定律

```haskell
fmap id      = id                  -- 恒等：什么都不改，结构也不能变
fmap (g . h) = fmap g . fmap h     -- 复合：分两次映射和一次映射组合函数，结果相同
```

例：如果某个 `fmap` 把 `Just 2` 映射成 `Nothing`，那么 `fmap id (Just 2) = Nothing ≠ Just 2`，违反恒等律，它“动了结构”。

## 例子

```haskell
fmap (*3) (Just 4)          -- Just 12
fmap (*3) Nothing           -- Nothing
fmap length getLine         -- IO Int：读一行，返回它的长度
(fmap (*3) (+2)) 4          -- 3 * (4 + 2) = 18
```

## 陷阱

- **kind 正确 ≠ 是 Functor**：kind `* -> *` 是必要条件；还需要一个满足定律的 `fmap`。
- **Functor 不一定是“容器”**：`IO` 和函数里并没有“存着”一个值，“结构”指的是计算上下文。
- `fmap` 不能改变“有几个、有没有”：想让结果依赖值来决定结构（例如可能失败的下一步），需要 Applicative/Monad。

## 关联

- 本批没有其他相关笔记。以后学到 Applicative、Monad 时，它们都是在 Functor 之上增加能力。

## 我的理解

- 💬「Functor；e.g. Maybe, IO, (->) r；Functor law」（S1 L25–27）
  ◐ 记下了典型实例和“定律”这个名词；没有说明 `fmap` 在各实例上做什么，也没有说明定律的内容。
- 💬「它们都需要接受一个具体类型才能变成具体类型」（Q-F1）
  ✅ 对“共同特征”的回答正确：它们都是 kind `* -> *` 的类型构造器（`(->) r` 需要先固定 r）。这是成为 Functor 的必要条件，但不是充分条件。
- ❓ 能否不看笔记推导出 `(->) r` 的 `fmap`？
- ❓ 两条定律分别排除了哪种“错误”的 `fmap`？

## Recall

1. 从 `h :: r -> a` 和 `g :: a -> b` 推导函数实例的 `fmap`。
2. 写一个类型正确但违反恒等律的 `Maybe` 的 `fmap`。

## 参考

- 来源：[[2026-10-25_09-21-10]] L24–27；回答 Q-F1 见 `_triage-2026-10-25`
- [Hackage base — Data.Functor](https://hackage.haskell.org/package/base/docs/Data-Functor.html)：类型类定义、定律、实例
