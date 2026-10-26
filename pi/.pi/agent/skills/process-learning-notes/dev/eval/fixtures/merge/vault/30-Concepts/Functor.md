---
aliases:
  - 函子
tags: [haskell]
---
# Functor

fmap :: (a -> b) -> f a -> f b

把函数作用到“盒子”里的值上。Maybe 的 fmap 遇到 Nothing 保持 Nothing。

定律：fmap id = id；fmap (g . h) = fmap g . fmap h
