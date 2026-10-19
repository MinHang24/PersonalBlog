import type { Article } from "../types"

export const article: Article = {
  slug: "go-graceful-shutdown",
  title: "一个 Go 服务如何优雅退出",
  excerpt:
    "停止接收、等待在途、释放资源。把进程退出写成可测试的流程，而不是最后一行 os.Exit。",
  category: "go",
  tags: ["Go", "服务端", "生命周期"],
  publishedAt: "2025-05-28",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "服务启动路径通常得到很多关注，退出路径却常常只剩一个信号处理函数。实际上，发布、扩容、配置更新都会频繁触发退出。如果停机流程没有顺序，请求可能完成了一半，消息可能被重复处理，日志也可能来不及写出。优雅退出应该从服务设计之初就被当作正常路径。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "stop-accepting",
      text: "第一步：不再接收新工作",
    },
    {
      kind: "paragraph",
      content: [
        "收到终止信号后，先让就绪检查返回不可用，并停止消费新的队列消息。负载均衡器感知状态通常需要时间，因此需要根据部署环境保留适当的摘流窗口。不要在这一步就关闭数据库，因为仍在处理的请求可能还需要它。退出顺序应与依赖关系的逆序一致。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "wait-in-flight",
      text: "第二步：给在途请求一段时间",
    },
    {
      kind: "paragraph",
      content: [
        "http.Server.Shutdown 会关闭监听并等待活动连接，但这个等待不应该没有期限。使用一个独立于已经取消的根 context 的清理上下文，为剩余请求分配最终预算。这里创建新的 Background 是有意义的：它属于退出阶段，而不是继续假装请求仍然有效。",
      ],
    },
    {
      kind: "code",
      language: "go",
      code: 'signals, stop := signal.NotifyContext(\n    context.Background(), os.Interrupt, syscall.SIGTERM,\n)\ndefer stop()\n\n<-signals.Done()\n\nshutdownCtx, cancel := context.WithTimeout(\n    context.Background(), 10*time.Second,\n)\ndefer cancel()\n\nif err := server.Shutdown(shutdownCtx); err != nil {\n    log.Printf("shutdown deadline: %v", err)\n    _ = server.Close()\n}',
    },
    {
      kind: "paragraph",
      content: [
        "长期连接、后台任务和自建 goroutine 不一定在 HTTP 服务的管理范围内，需要明确注册到自己的生命周期协调器。每个模块提供停止接收和等待完成两个动作，通常比暴露一个含义不清的 Close 更容易组织。等待期限耗尽后可以强制结束，但要留下足够的诊断信息。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "release-resources",
      text: "第三步：按依赖顺序释放资源",
    },
    {
      kind: "paragraph",
      content: [
        "等业务工作结束后，再关闭连接池、临时目录和遥测客户端。日志系统尽量最后关闭，这样清理阶段的错误仍然可见。避免在多个组件里重复关闭同一个资源；资源创建者负责释放，使用者只负责停止使用。对于不可避免的清理失败，记录上下文，但不要无限重试。",
      ],
    },
    {
      kind: "list",
      ordered: true,
      items: [
        ["关闭就绪状态，停止新的任务来源。"],
        ["等待在途请求，广播后台任务退出信号。"],
        ["等待 worker 并持久化必要的进度。"],
        ["关闭数据连接，刷新日志与可观测数据。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "shutdown-tests",
      text: "让退出流程可重复验证",
    },
    {
      kind: "paragraph",
      content: [
        "为关闭过程编写集成测试：先创建一个可控的慢请求，开始退出，再确认请求在预算内完成，而新请求无法进入。还要验证第二次信号、超时强制退出和空闲服务退出。不要仅用进程最终结束来判断成功，因为丢失的任务同样会让进程很快结束。",
      ],
    },
    {
      kind: "quote",
      content: [
        "优雅退出不是“多等几秒”，而是在有限时间内兑现已经接受的工作承诺。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "当关闭逻辑能独立运行、能被观察、能在测试中重放，发布就会变得平常。一个服务的可靠性，不仅取决于它运行时做得多好，也取决于它离开时留下了什么。",
      ],
    },
  ],
}
