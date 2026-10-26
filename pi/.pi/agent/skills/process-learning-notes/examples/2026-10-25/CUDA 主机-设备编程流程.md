---
type: concept
status: draft
domain: parallel-computing
aliases: [CUDA Host-Device Workflow, CUDA 内存拷贝, CUDA 异步执行]
tags: [cs149, cuda]
sources: ["[[2026-10-25_09-21-10]]", "[[2026-10-25_09-22-47]]"]
created: 2026-10-25
---
# CUDA 主机-设备编程流程

> [!abstract] Core Idea
> Host（CPU）和 Device（GPU）默认使用**两块独立的内存**，所以数据必须显式地拷进拷出：分配 → 拷入 → 启动 kernel → 拷出 → 释放。kernel 启动对 host 是**异步**的，能安全读取结果，依靠的是同一 stream 内的顺序执行：之后的同步 `cudaMemcpy` 会先等 kernel 执行完，再完成拷贝后才返回。

## 机制

```cpp
float *d_x;
cudaMalloc(&d_x, bytes);                                  // 1 在 device 上分配，d_x 是 device 指针
cudaMemcpy(d_x, h_x, bytes, cudaMemcpyHostToDevice);      // 2 拷入
kernel<<<blocks, threads>>>(d_x, n);                      // 3 立即返回，GPU 稍后执行
cudaMemcpy(h_x, d_x, bytes, cudaMemcpyDeviceToHost);      // 4 排在 kernel 之后；拷贝完成才返回
cudaFree(d_x);                                            // 5 释放
```

- **为什么要拷贝**：host 指针和 device 指针指向不同的地址空间。device 指针在 host 上不能解引用，反之亦然（统一内存 `cudaMallocManaged` 是例外）。
- **为什么第 4 步之后可以读结果**：第 3、4 步都提交到默认 stream，同一 stream 内的操作按提交顺序执行；同步的 D2H `cudaMemcpy` 会阻塞 host，直到拷贝完成。
- **条件**：这一结论依赖“同一 stream + 同步拷贝”。如果 kernel 在另一条 stream 上，或者用的是 `cudaMemcpyAsync`，就需要用 `cudaStreamSynchronize` / event 显式建立依赖。

## 陷阱（常见 bug）

| 症状 | 原因 | 对策 |
|---|---|---|
| 段错误或结果全是垃圾 | 把 host 指针传给 kernel，或在 host 上解引用 device 指针；`cudaMemcpy` 方向参数写反 | 用 `d_`/`h_` 前缀区分；核对方向枚举 |
| 越界写入、偶发错误 | kernel 里没有 `if (i < n)`：grid 向上取整多出的线程越界 | 见 [[CUDA 执行模型]] 的例子 |
| `cudaFree` 报错或崩溃 | 传入的不是 `cudaMalloc` 返回的那个 device 指针（传了 host 指针，或者偏移后的指针） | 只 free 原指针，free 后置空 |
| 错误出现在“无关”的地方 | kernel 是异步的，它的错误要到下一次同步调用才报告 | 调试时在 launch 后调用 `cudaGetLastError()` 和 `cudaDeviceSynchronize()` |

## 关联

- [[CUDA 执行模型]]：第 3 步内部线程如何组织；本篇讲第 3 步前后的数据流和完成条件。

## 我的理解

- 💬「cudaMalloc -> cudaMemcpy -> kernal(async) -> cudaMemcpy -> cudaFree」（S1 L18）
  ✅ 流程和 kernel 的异步性都记对了。
- 💬「调用kernel后再去调用cudaMemcpy的话，cudaMemcpy应该会等待kernel执行完吧」（Q-C1）
  ✅ 判断正确：在同一默认 stream 中，同步拷贝会排在 kernel 之后。
- 💬「代码错误：device与host之间数据传输；kernel里边界检查；free里传的是不是正确指针」（S4 L29–32）
  ◐ 三类错误都对应本流程中的某一步（见“陷阱”表）；原记录没有写症状和原因，表中的这些内容是补充的。
- ❓ kernel 和拷贝分别放在两条 stream 上时，怎样保证拷贝在 kernel 之后？

## Recall

1. 为什么 kernel 是异步的，host 却能在 `cudaMemcpy` 返回后放心读取结果？这个结论在什么情况下不成立？
2. 一个 kernel 里的越界错误，为什么可能在下一次 `cudaMemcpy` 时才报出来？

## 参考

- 来源：[[2026-10-25_09-21-10]] L16–18；[[2026-10-25_09-22-47]] L29–32；回答 Q-C1 见 `_triage-2026-10-25`
- [CUDA Runtime API — API synchronization behavior](https://docs.nvidia.com/cuda/cuda-runtime-api/api-sync-behavior.html)：同步 `cudaMemcpy` 的阻塞语义
- [CUDA C++ Programming Guide — Asynchronous Concurrent Execution / Streams](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#asynchronous-concurrent-execution)：kernel 启动的异步性、stream 内的顺序、默认 stream
- [CUDA C++ Programming Guide — Error Checking](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#error-checking)：异步错误的报告时机
