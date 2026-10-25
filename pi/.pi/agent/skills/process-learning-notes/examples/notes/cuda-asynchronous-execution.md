---
status: draft
provisional: true
---
# CUDA Asynchronous Execution

## Core Idea

Kernel 启动对 host 异步，提交工作不等于结果已可用；安全使用结果需要先保证相关 GPU 操作的依赖顺序，再确认所需计算和数据传输已经完成。[C1]

## Mechanism / Example

同一 stream 内按提交顺序执行。若同一 host 线程把 kernel 和同步 device-to-host 拷贝提交到同一默认 stream，则拷贝在 kernel 后执行，且同步 D2H 返回时拷贝已完成。[C2]

```cpp
kernel<<<grid, block>>>(d_out);
cudaMemcpy(h_out, d_out, bytes, cudaMemcpyDeviceToHost);
// 成功返回后，可读取这次拷贝到 h_out 的结果
```

这是说明顺序的片段，省略分配与错误处理。[C3]

## Pitfalls / Connection

不能把结论扩展为“所有 cudaMemcpy 等待所有 kernel”：跨独立 stream 必须建立依赖，不同方向或异步拷贝的 host 同步语义也不同。[C4]

[Execution Model](cuda-execution-model.md)说明工作如何分配；本篇说明依赖和完成条件，二者分别回答“谁做”和“何时可用”。[C4]

## Recall

如果 kernel 改在另一条独立 stream 启动，仅保持 host 代码调用顺序为什么不够？

## Learning State

Q-C1 原话：“调用kernel后再去调用cudaMemcpy的话，cudaMemcpy应该会等待kernel执行完吧”。该猜测在 C2 的条件下成立，但原答没有给方向或 stream，评估仍为 Partial。

未决：原实验是否满足同一默认 stream、同步 D2H？条件、代码与跨 stream 限制仍是补充；没有把原话无痕改写成已解释的完整结论。

## Sources / Provenance

S1 L16–18：[原调用链](../sources/2026-10-25_09-21-10.md)；[原路径/slug](../source-manifest.json)。Q-C1：[原始答复](../evidence/transcript.md#q-c1)。R2：[CUDA Runtime API 同步语义](https://docs.nvidia.com/cuda/cuda-runtime-api/api-sync-behavior.html)；R4：[NVIDIA Asynchronous Execution](https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html)。

| Claim | 归属与范围 | 核验 |
|---|---|---|
| C1 | AI-supplemented：依赖与完成关系；S1 仅写过 async | R2/R4 |
| C2 | AI-supplemented：Q-C1 的条件化精炼；条件不能归给用户 | R2 同步 D2H + R4 stream 顺序 |
| C3 | AI-supplemented：沿用 v0.2 解释片段 | 按上述语义核对，未运行 CUDA |
| C4 | AI-supplemented：跨 stream 限制及概念联系 | R2/R4 |

此篇是从旧 CUDA 样例拆出的短概念笔记，不新增输入或改变学习状态。
