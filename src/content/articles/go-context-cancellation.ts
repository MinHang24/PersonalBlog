import type { Article } from "../types"

export const article: Article = {
  slug: "go-context-cancellation",
  title: "把 context 取消信号传到任务边界",
  excerpt:
    "取消不是一个布尔值，而是一段生命周期。让超时、退出和资源释放沿着调用链自然传播。",
  category: "go",
  tags: ["Go", "Context", "可靠性"],
  publishedAt: "2025-06-12",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "在一个服务里，最难发现的浪费往往来自已经没有人等待的工作：请求结束了，查询还在运行；窗口关闭了，后台任务还在重试。context 的作用，是让一组有关联的操作共享生命周期，而不是给每个函数增加一个看起来规范的参数。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "lifecycle",
      text: "取消表达的是生命周期",
    },
    {
      kind: "paragraph",
      content: [
        "从请求入口创建的 context 应当传到数据库、HTTP 调用和任务排队等真正等待的边界。不要在中间层随手替换成 context.Background，这会切断取消关系。如果某个任务需要脱离请求继续执行，那是一个新的生命周期，需要独立的拥有者和退出机制。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "ctx.Err 说明调用是否已被取消，但它不会主动停止任意一段计算。计算密集的循环需要在合适的批次间检查信号；阻塞的网络调用则应使用支持 context 的 API。先定位操作在哪里等待，才能判断取消逻辑是否真的有效。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "deadlines",
      text: "在等待处建立截止时间",
    },
    {
      kind: "paragraph",
      content: [
        "截止时间应当来自整体预算。上游只剩一秒时，下游不应该重新得到五秒。WithTimeout 会继承更早的父级截止时间，这使预算能够自然收敛。即使操作很快完成，也要调用 cancel，及时释放计时器与父子关系。示例中的 defer 不是取消业务，而是完成作用域的资源回收。",
      ],
    },
    {
      kind: "code",
      language: "go",
      code: 'func fetch(ctx context.Context, url string) error {\n    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)\n    defer cancel()\n\n    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)\n    if err != nil {\n        return fmt.Errorf("build request: %w", err)\n    }\n    res, err := http.DefaultClient.Do(req)\n    if err != nil {\n        return fmt.Errorf("fetch media: %w", err)\n    }\n    defer res.Body.Close()\n    return nil\n}',
    },
    {
      kind: "heading",
      level: 2,
      id: "bounded-wait",
      text: "提交和重试也要能够取消",
    },
    {
      kind: "paragraph",
      content: [
        "不仅执行操作需要监听取消，提交到队列、等待信号量、退避重试也需要。把 time.Sleep 换成可选择的计时器，让 select 同时等待定时器和 ctx.Done。否则一次本来两秒就应该结束的任务，可能在重试间隔里额外停留几十秒。",
      ],
    },
    {
      kind: "list",
      items: [
        ["把 context 作为第一个参数传递，不把它长期存进业务对象。"],
        ["取消后停止产生新工作，已经执行的操作按约定退出。"],
        ["区分调用方取消与真实业务失败，避免误报异常。"],
        ["不把可选业务参数放进 context.Value。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "test-cancel",
      text: "用测试验证“确实停止了”",
    },
    {
      kind: "paragraph",
      content: [
        "测试取消行为不应只断言返回了一个错误，还要确认后台 goroutine 能退出、资源能够释放、后续步骤没有继续发生。可以使用通知通道控制任务到达某个阶段，再触发取消，以免测试依赖不稳定的 sleep。对于外部 API，使用可控制的本地测试服务制造阻塞。",
      ],
    },
    {
      kind: "quote",
      content: [
        "取消信号抵达真正的工作边界时，context 才从一个参数变成了可靠性机制。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "当生命周期与资源所有权被清晰表达，超时就不再是零散的补丁。入口负责建立预算，中间层负责保持关系，边界负责及时响应，这三件事比四处检查一个状态值更重要。",
      ],
    },
  ],
}
