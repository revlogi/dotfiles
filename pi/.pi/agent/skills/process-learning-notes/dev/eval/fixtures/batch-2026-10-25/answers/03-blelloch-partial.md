# Test D：部分理解 → 一次追问 → 局部更新

输入为 S4 L21 与 H2（用户在任务中提供的真实历史回答），不是模拟回答。

**追问前评估：** Upsweep 的二叉规约树直觉为 User-expressed；Downsweep 的“左右分别构建”不足以解释传播规则，Partial。此时右子树规则仍 Unresolved，不能因为 AI 知道算法就标用户已懂。

**实际追问：** Q-B1 使用 [3,1,2,4]、左右总和 4/6、根前缀 0，询问右侧初始前缀及原因；没有先给出正确值。

**真实回答：** “4，右子树需要根结点的值加上左子树总和，即0+4”。[User-expressed · Q-B1]

**更新：** 对本例右子树规则有明确解释（Explained），不是仅答数值。尚未解释左子树为何继承父前缀、递归至叶为何得到 exclusive scan，整套 Downsweep 仍不标全部 Explained。

## 机制补充（局部案例，不新增正式候选 Note）

Upsweep 每个子树存区间和；Downsweep 进入某子树时带的是该区间之前的和 p。左侧继承 p，右侧用 p+左区间和；递归到叶即该元素之前的和。对本例叶前缀为 `[0,3,4,6]`。左右顺序和不变量是 AI 补充，用户仅明确表达本例右侧规则。[AI-supplemented · R3]

加法情形根前缀为 0；这种树传播依赖结合律，若推广算子需单位元并保持操作顺序。这些泛化也没有用户理解证据。[AI-supplemented · R3]

证据：[原始回答与评估](transcript.md)、[NVIDIA GPU Gems §39.2.2](https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda)。未再追问，遵守全批一轮追问预算。
