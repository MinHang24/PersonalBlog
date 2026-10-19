import type { Article } from "../types"

export const article: Article = {
  slug: "rust-ownership-in-practice",
  title: "用所有权理清 Rust 工程边界",
  excerpt:
    "借用检查器不只是编译门槛。把所有权当作设计工具，让资源、状态与模块职责更加清晰。",
  category: "rust",
  tags: ["Rust", "所有权", "软件设计"],
  publishedAt: "2025-06-15",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "刚接触 Rust 时，很容易把编译器当成一个需要说服的对手。遇到借用冲突，就尝试 clone、加锁，或者把引用生命周期写得更长。但许多报错其实在提示同一个问题：这份数据究竟由谁负责，哪些模块只是暂时使用它？回答这个问题，往往比调整语法更接近解决方案。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "ownership-as-design",
      text: "先画出资源的拥有者",
    },
    {
      kind: "paragraph",
      content: [
        "以一个媒体处理任务为例，任务拥有输入路径、输出目录和处理参数；探测阶段只借用输入路径，转码阶段借用配置，最终产物则独立拥有自己的路径。不要让每个阶段都握住整个应用状态，这会让模块关系变得模糊，也让测试难以构造最小输入。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "把需要长期保存的数据放进有明确生命周期的结构体中，把临时访问表达为参数。所有权转移说明调用者不再使用这份值，借用说明接收者不能把它据为己有。它们既是编译器规则，也是接口向读者作出的承诺。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "borrowing-interfaces",
      text: "让函数签名解释意图",
    },
    {
      kind: "paragraph",
      content: [
        "只读取文本的函数通常接收 &str，而不是要求调用方提供一个 String。需要保存路径的构造函数可以接收 impl Into<PathBuf>，在边界处取得所有权。不要为了灵活而过度泛型化；先让调用方式自然，再在真实出现重复时抽象。下面的例子把输入借用与输出拥有明确分开。",
      ],
    },
    {
      kind: "code",
      language: "rust",
      code: "use std::path::{Path, PathBuf};\n\nstruct Artifact {\n    path: PathBuf,\n    bytes: u64,\n}\n\nfn inspect(input: &Path) -> std::io::Result<Artifact> {\n    let metadata = std::fs::metadata(input)?;\n    Ok(Artifact {\n        path: input.to_path_buf(),\n        bytes: metadata.len(),\n    })\n}",
    },
    {
      kind: "heading",
      level: 2,
      id: "state-transitions",
      text: "用类型表达状态转换",
    },
    {
      kind: "paragraph",
      content: [
        "如果任务必须先验证再执行，可以让验证函数消耗 DraftJob 并返回 ReadyJob。执行函数只接受 ReadyJob，这样“未经验证就运行”的状态就无法轻易表达。类型不必记录所有细枝末节，但关键阶段值得有明确的边界。这比散落的布尔值更容易审查，也更不容易忘记检查。",
      ],
    },
    {
      kind: "list",
      items: [
        ["临时读取：优先使用不可变借用。"],
        ["修改状态：让可变借用的作用域尽可能短。"],
        ["跨线程共享：先问能否传递消息，再考虑共享可变状态。"],
        ["需要 clone：确认复制成本与语义，不把它当作消除报错的默认动作。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "practical-balance",
      text: "在清晰与复杂之间保持平衡",
    },
    {
      kind: "paragraph",
      content: [
        "不是每个字段都需要一个自定义生命周期，也不是每次复制都值得优化。配置字符串少量 clone 往往比复杂的引用关系更容易维护。需要关注的是大缓冲区、昂贵资源和隐藏的共享修改。先使用简单的拥有值版本建立行为，再通过测量决定哪里需要借用优化。",
      ],
    },
    {
      kind: "quote",
      content: [
        "最好的所有权设计，让读者即使不运行编译器，也能看懂资源会在哪里结束。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "当函数签名开始讲清楚谁拥有、谁借用、谁能修改，借用检查器就不再只是阻力。它把我们原本应该在设计里回答的问题，提前变成了可以验证的约束。",
      ],
    },
  ],
}
