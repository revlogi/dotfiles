---
type: concept
status: draft
domain: parallel-computing
aliases: [CUDA Execution Model, CUDA 线程层级, SIMT]
tags: [cs149, cuda]
sources: ["[[2026-10-25_09-21-10]]"]
created: 2026-10-25
---
# CUDA 执行模型

> [!abstract] Core Idea
> Grid → Block → Thread 是程序员的**逻辑分解**：block 是可以共享内存、互相同步的最大协作单位，也是调度到 SM 的单位；warp（32 线程）是硬件的**实际执行单位**，同一 warp 共用一条指令流，所以分支分歧会让各条路径串行执行。

## 机制

**逻辑层级（程序员决定）**

- 一次 kernel 启动 = 一个 grid，由若干 block 组成；每个 block 由若干 thread 组成。
- 每个线程通过 `blockIdx`、`blockDim`、`threadIdx` 算出自己负责的数据，这就是 **SPMD**：所有线程运行同一个程序，处理不同的数据。

**为什么需要 block 这一层**

- 同一 block 内的线程可以通过 `__shared__` 内存交换数据，用 `__syncthreads()` 同步。
- 不同 block 之间在一次 kernel 内没有同步手段，执行顺序也没有保证。正因为 block 互相独立，同一份代码才能在 SM 多或少的 GPU 上都能运行：多出来的 block 只是排队等待。
- 一个 block 整体驻留在一个 SM 上，直到执行完毕。

**硬件执行（GPU 决定）**

- SM 把 block 内的线程按编号每 32 个划分为一个 warp。warp 中的线程同时执行同一条指令，这就是 **SIMT**。
- 遇到分支时，warp 内走不同路径的线程会被分批执行（其余线程被屏蔽），因此分歧的代价是串行化，而不是出错。

## 例子

处理 n = 1000 个元素，每个 block 256 个线程：

```cpp
int blocks = (n + 255) / 256;          // 向上取整 = 4 个 block，共 1024 个线程
kernel<<<blocks, 256>>>(d_x, n);

__global__ void kernel(float* x, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;   // block 1 的 thread 5 → i = 261
    if (i < n) x[i] *= 2;                            // 多出的 24 个线程不能越界
}
```

每个 block 有 256 / 32 = 8 个 warp。若改为 `if (i % 2 == 0)`，每个 warp 内一半线程走分支，两条路径分两批执行。

## 陷阱

- **SIMT ≠ SIMD**：SIMD 把向量宽度暴露给程序员，一条指令显式处理一个向量；SIMT 中程序员写的是单个线程的标量代码，由硬件把线程组织成 warp，并且允许线程分歧。
- 向上取整多出来的线程必须靠 `if (i < n)` 挡住，这是常见的越界 bug。
- 不要假设 block 的执行顺序，也不要在一次 kernel 内等待别的 block 的结果。
- 逻辑线程数（例如 1024）不等于同时在执行的线程数。

## 关联

- [[CUDA 主机-设备编程流程]]：本篇讲 kernel 内部谁来做、怎么分工；那一篇讲数据怎么进出 GPU、结果什么时候可用。
- [[Stream Compaction]]：Find Repeats 的每一步都是“每个线程处理一个 i”的 kernel。

## 我的理解

- 💬「Hierachy: Grid -> Blocks -> Threads；Execution: Block -> warps (32 threads)」（S1 L11–12）
  ◐ 层级与 warp 大小记录正确；还没有说明为什么需要 block 这一层（共享内存与同步）。
- 💬「SPMD programming；SIMT/SIMD execution」（S1 L13–14）
  ◐ 两个术语都已记下；SIMT 和 SIMD 是不同的模型，CUDA 属于 SIMT（见“陷阱”）。
- ❓ 为什么 `__syncthreads()` 只在 block 内有效，而不能跨 block？

## Recall

1. 如果一个 kernel 需要所有线程共享一个中间结果，block 内和 block 间分别怎么办？
2. 每个 block 的线程数从 256 改为 100，warp 的利用率会怎样？

## 参考

- 来源：[[2026-10-25_09-21-10]] L9–14
- [CUDA C++ Programming Guide — Programming Model](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model)：线程层级、block 独立性、shared memory 与 `__syncthreads()`
- [CUDA C++ Programming Guide — SIMT Architecture](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#simt-architecture)：warp、分歧、SIMT 与 SIMD 的区别
