import type { Article } from "../types"

export const article: Article = {
  slug: "go-worker-pool",
  title: "Go 并发任务池：从可用到可控",
  excerpt:
    "当 goroutine 不再是答案本身：从并发限制、任务取消到优雅退出，构建一个真正可控的任务池。",
  category: "go",
  tags: ["Go", "并发编程", "工程实践"],
  publishedAt: "2025-06-18",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "启动一个 goroutine 很容易，但让一组并发任务稳定地完成，并不是加一个 go 关键字那么简单。当输入的速度超过处理速度，内存、连接和下游服务就会一起承受压力。这篇示例笔记从一个最小任务池出发，讨论并发系统真正需要的边界。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "define-boundaries",
      text: "先定义边界，再增加并发",
    },
    {
      kind: "paragraph",
      content: [
        "任务池的目标不是“尽可能多地执行”，而是在有限资源中提供可预测的吞吐。首先列出任务消耗什么资源：CPU、数据库连接、文件句柄，还是远端接口配额。并发度应该由最紧张的资源决定。队列同样需要上限，否则只是把请求堆积从一个地方挪到另一个地方。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "一个实用的约定是把任务接收与任务执行分开。接收方负责说明任务是否已经进入队列；执行方负责报告任务是否完成。队列已满、任务超时和任务自身失败是三种不同状态，不应当用同一个模糊的错误掩盖它们。",
      ],
    },
    {
      kind: "list",
      items: [
        ["并发上限：同时执行的任务数量。"],
        ["队列容量：允许等待的任务数量。"],
        ["接收策略：阻塞等待、立即拒绝，或由调用方重试。"],
        ["退出约定：停止接收后，等待任务还是取消任务。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "minimal-worker",
      text: "一个可以解释清楚的 worker",
    },
    {
      kind: "paragraph",
      content: [
        "下面的实现刻意保持简单：调用方拥有队列，worker 只消费队列。每个任务收到同一个生命周期上下文，便于将退出信号传到网络或文件操作。生产实现还需要收集任务结果，但结果通道也必须有消费者，否则 worker 会卡在报告结果这一步。",
      ],
    },
    {
      kind: "code",
      language: "go",
      code: 'type Job func(context.Context) error\n\nfunc worker(ctx context.Context, jobs <-chan Job) {\n    for {\n        select {\n        case <-ctx.Done():\n            return\n        case job, ok := <-jobs:\n            if !ok {\n                return\n            }\n            if err := job(ctx); err != nil {\n                log.Printf("job failed: %v", err)\n            }\n        }\n    }\n}',
    },
    {
      kind: "heading",
      level: 3,
      id: "channel-ownership",
      text: "谁创建通道，谁负责关闭",
    },
    {
      kind: "paragraph",
      content: [
        "关闭通道是所有权问题，不是清理习惯。多个生产者存在时，需要先确认它们全部停止，再关闭队列。不要在消费者中关闭输入通道，也不要用 recover 把重复关闭隐藏起来。把关闭动作集中到协调者中，通常比在每条路径上补一个 defer 更容易验证。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "backpressure",
      text: "背压是设计的一部分",
    },
    {
      kind: "paragraph",
      content: [
        "当队列已满，让提交操作等待是一种自然的背压，但等待也必须能被取消。提交时同时监听 ctx.Done，才能避免客户端已经离开而提交方仍然占着连接。对于批处理任务，可以返回明确的繁忙状态，让上游按退避策略重试，而不是无限增长缓冲。",
      ],
    },
    {
      kind: "table",
      headers: ["指标", "说明", "观察方向"],
      rows: [
        ["等待时长", "任务从提交到执行的间隔", "是否持续增长"],
        ["执行时长", "任务实际占用 worker 的时间", "长尾与超时"],
        ["队列深度", "当前等待任务数量", "是否接近容量"],
        ["拒绝数量", "无法接收的任务总数", "上游是否需要限速"],
      ],
    },
    { kind: "heading", level: 2, id: "shutdown", text: "让退出也成为正常路径" },
    {
      kind: "paragraph",
      content: [
        "退出时先停止接收新任务，再决定是否清空已有队列，最后等待 worker 结束。为这一过程设置独立的截止时间，避免一个无法取消的外部调用拖住整个进程。测试应当覆盖空队列退出、任务执行中取消、生产者阻塞时退出，以及重复发起关闭等情况。",
      ],
    },
    {
      kind: "quote",
      content: [
        "好的并发设计，不是让更多事情同时发生，而是让发生的事情始终处于可理解的边界之内。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "先写清生命周期，再选择合适的并发度；先看到队列与延迟，再谈性能优化。一个规模适中、职责明确的任务池，通常比一组精巧但难以解释的 goroutine 更值得长期维护。",
      ],
    },
  ],
}
