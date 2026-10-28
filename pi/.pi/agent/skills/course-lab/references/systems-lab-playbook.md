# Systems & Parallel Lab Playbook

按当前课程作业所属领域查阅对应章节，无需通读全文。

## 1. 数据并行与 GPU 编程（CS149 等）

### 1.1 并行分解与块内角色切换（Cooperative Role-Switching）
当问题同时具有“图元/任务维度（Circles / Tasks）”和“输出维度（Pixels / Bins）”，且输出存在保序或无锁要求时：
- **所有权保序（Owner-Computes）**：让每个线程固定负责一个输出位置（如一个 Pixel），即可天然消除跨线程写冲突，无需原子锁；若按输入顺序遍历图元，则天然满足顺序不变量。
- **块内协作过滤（Tile-Level Batch Compaction）**：若每个像素独立遍历全部 $N$ 个图元（$O(N)$ 全局访存），性能会受限于冗余计算。此时利用 **Thread Block = Pixel Tile**（例如 $16 \times 16 = 256$ 线程对应 $16 \times 16$ 像素块）：
  1. **角色 A（按图元并行）**：在每个大小为 $B=256$ 的图元批次 `[base, base + B)` 中，线程 `tid` 负责检测第 `base + tid` 个图元是否与当前 Tile 包围盒相交（先用 `circleInBoxConservative` 快速拒绝，通过后再调 `circleInBox` 精确判定），写入 `intersects[tid] = flag`。
  2. **块内流压缩与最小同步（Flag → Exclusive Scan → Scatter）**：
     - `sharedMemExclusiveScan` 内部仅由线程 `tid` 读取自身的 `sInput[tid]` 并写回自身的 `sOutput[tid]`（`sScratch` 在内部同步前即被当前 warp 写入），随后线程 `tid` 读取自身的 `intersects[tid]` 与 `prefix[tid]` 执行 `if (intersects[tid]) circleIndices[prefix[tid]] = circle;`。
     - **第 1 处外层 `__syncthreads()`（发布列表与总数）**：放在 Scatter **之后**，一次性确保所有线程都能安全读取 `circleIndices[0..count-1]` 以及最后一个线程的 `count = prefix[B - 1] + intersects[B - 1]`（Scan 前及 Scan 与 Scatter 之间无需额外外层 `__syncthreads()`）。
  3. **角色 B（按像素并行）**：`__syncthreads()` 后，每个有效像素线程回到自己负责的像素 `(x, y)`，遍历 `circleIndices[0..count-1]` 并在局部寄存器 `float4 pixelColor` 中累加颜色。
  4. **第 2 处外层 `__syncthreads()`（批次尾防覆盖）**：本批次像素着色结束后**必须 `__syncthreads()`**，防止快 warp 进入下一批次覆写慢 warp 仍在读取的 `circleIndices`、`intersects`、`prefix` 或 `sScratch`。

### 1.2 课程工具接入常见陷阱（CUDA Helpers）
- **共享内存前缀和（如 `exclusiveScan.cu_inl`）**：
  - **宏与块大小**：`#define SCAN_BLOCK_DIM <BLOCKSIZE>` 必须出现在 `#include "exclusiveScan.cu_inl"` 之前，且等于 `blockDim.x * blockDim.y`（2 的幂，$\le 1024$）。
  - **线性下标顺序**：必须是行优先 `tid = threadIdx.y * blockDim.x + threadIdx.x`，保证连续 32 个 `tid` 落入同一硬件 warp（内部依赖 `__activemask()` 与 `__syncwarp()`）。写成 `threadIdx.x * blockDim.y + threadIdx.y` 会打乱 warp 映射导致结果错误。
  - **类型与缓冲区大小**：输入、输出、临时数组必须是 `__shared__ uint`（不能是 `int`），且 `sScratch` 长度必须为 `2 * SCAN_BLOCK_DIM`。
  - **总命中数计算**：Exclusive Scan 输出 `prefix[B - 1]` 不包含最后一个元素 `flag[B - 1]`。本批次有效元素总数是 `prefix[B - 1] + flag[B - 1]`（只有在特定题目中已知末项 `flag` 恒为 0 时才可省略 `+ flag[B - 1]`，通用流压缩绝不可省）。
- **包围盒相交检测（如 `circleBoxTest.cu_inl`）**：
  - 注意参数顺序：`circleInBox(cx, cy, rad, boxL, boxR, boxT, boxB)` 中 **`boxT` 在 `boxB` 之前**，且要求归一化坐标满足 `boxR >= boxL`、`boxT >= boxB`。
  - Tile 边界 `boxL, boxR, boxT, boxB` 对同一 block 是常量，应在进入图元循环前算好，不要在内层循环重复计算。

### 1.3 GPU 性能诊断清单
1. **活跃线程利用率**：是否存在 `if (tid == 0)` 让 1 个线程做筛选、255 个线程在 `__syncthreads()` 等待？或者 Blelloch Scan 每层启动 $N$ 个线程但只有 $N / 2^{d+1}$ 个线程有效？
2. **访存层次（Register vs. Shared vs. Global）**：
   - 循环内是否反复读写全局内存指针（如 `*imagePtr`）？若单线程独占该输出位置，应先读入 `float4 acc = *imagePtr;` 寄存器局部变量，循环结束后写回一次 `*imagePtr = acc;`。
   - 多个线程读取同一图元属性时，是否可通过 `__shared__` 缓存已筛选图元的 `position / radius / color`，避免每个像素线程重复去全局内存随机读取？
3. **计时与同步语义**：
   - Kernel 启动默认相对 Host 异步；单测 Kernel 耗时必须在末尾加 `cudaDeviceSynchronize()`。
   - 同步 `cudaMemcpy` 本身包含隐式等待，端到端计时在最后一次 `cudaMemcpy` 后无需额外 `cudaDeviceSynchronize()`。

---

## 2. 操作系统与并发实验（CS162 / MIT 6.S081 等）

### 2.1 虚拟内存与页表（Page Tables / COW / Lazy Allocation）
- **映射与解映射契约**：检查 `mappages` / `uvmunmap` 的对齐要求（`PGROUNDDOWN` / `PGROUNDUP`）、权限位（`PTE_V | PTE_U | PTE_W | PTE_R`）以及失败路径上的物理页释放（避免 `kalloc` 泄漏）。
- **Copy-on-Write (COW)**：
  - `fork` 时清除父子页表的 `PTE_W`、置位自定义 `PTE_COW`，并原子递增物理页引用计数（必须在映射生效前递增）。
  - Page fault 处理时区分真实非法地址与合法 COW 页；当引用计数为 1 时可直接恢复 `PTE_W` 并清除 `PTE_COW`，无需重新分配与拷贝。
  - 别忘了用户态向内核传递指针（如 `copyin` / `copyout` / 系统调用写缓冲区）时同样需要触发或处理 COW 逻辑。

### 2.2 并发、锁与调度（Locks / Condition Variables / Sleep-Wakeup）
- **自旋锁（Spinlock）不变量**：持有自旋锁期间关中断、严禁调用会睡眠或让出 CPU 的函数（`sleep`、磁盘 I/O、可能阻塞的分配器）。
- **条件等待模式**：等待条件必须在 `while (!cond)` 循环中检查，防止虚假唤醒或被其他线程抢先消费状态。
- **Lost Wakeup 防护**：从“检查条件不满足”到“将当前线程标记为 `SLEEPING`”之间，必须由保护该条件状态的同一把锁覆盖。
- **死锁排查**：多锁获取顺序必须全局一致（如先父目录锁再子 inode 锁，先进程表锁再具体 `proc->lock`）。

---

## 3. 实验报告（Write-up）与可迁移概念提炼模板

当用户完成一个模块或需要准备课程 Write-up 时，按以下结构简洁输出：

### 3.1 Write-up 核心要点（基于代码与 Git 演进）
1. **问题分解与任务映射（Decomposition & Mapping）**：Grid / Block / Thread（或进程/线程/锁）各自对应什么数据粒度？是否在阶段间切换了线程角色？
2. **同步与正确性保障（Synchronization & Invariants）**：如何保证原子性与顺序性？哪里使用了同步原语（如 `__syncthreads()`、`cudaDeviceSynchronize()`、锁），为什么每一处都不可省略？
3. **通信与带宽优化（Bandwidth & Locality）**：如何减少全局内存访问或跨核同步（如寄存器累加、shared memory 批次压缩、保守包围盒预筛）？
4. **演进路径与被否决方案（Iterative Journey）**：结合 `git log` 中曾尝试过的方案（如单线程剔除、无剔除逐像素遍历），用量化原因说明其为何不够快或为何失败。

### 3.2 可迁移概念卡片（Concept Seed）
仅在确有新机制值得沉淀时，用 4 行提炼：
- **概念名**：`<名称>`
- **触发信号**：什么场景下应该想到这个模式？
- **核心机制（Core Idea）**：为什么它能解决矛盾？
- **常见陷阱**：本次实现中踩过或最易出错的边界条件是什么？
