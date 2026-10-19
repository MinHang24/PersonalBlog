import type { Article } from "../types"

export const article: Article = {
  slug: "rust-cli-error-handling",
  title: "Rust CLI 的错误处理与可观测性",
  excerpt:
    "让错误不仅能够返回，还能帮助使用者行动：区分类型、补充上下文，并保留完整原因链。",
  category: "rust",
  tags: ["Rust", "CLI", "错误处理"],
  publishedAt: "2025-05-21",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "一个工具失败时，使用者最需要的不是一段调试堆栈，而是三个答案：哪一步失败、为什么失败、接下来可以做什么。Rust 的 Result 提供了很好的基础，但仅仅把错误用问号一路传到 main，并不会自动得到一个好用的命令行程序。错误信息也需要被认真设计。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "classify-errors",
      text: "先区分预期失败与内部故障",
    },
    {
      kind: "paragraph",
      content: [
        "用户输入无效、文件不存在、外部服务暂时不可用，都可能是正常运行中的预期失败。程序内部违反约定则属于另一类问题。把两者分开，才能决定退出码、重试策略和展示方式。库层使用有语义的错误类型，应用边界再把它转换成适合人的说明。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "不要过早把所有错误变成字符串。字符串会丢掉类型信息，使上层只能通过匹配文字判断是否重试。保留原始原因，并在穿过模块边界时增加上下文，能够同时照顾程序处理与人工排查。错误链的每一层都应增加新的信息，而不是重复一句“操作失败”。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "useful-context",
      text: "在真正理解操作的地方补充上下文",
    },
    {
      kind: "code",
      language: "rust",
      code: 'use std::{fs, io, path::Path};\n\nfn read_config(path: &Path) -> Result<String, io::Error> {\n    fs::read_to_string(path).map_err(|cause| {\n        io::Error::new(\n            cause.kind(),\n            format!("cannot read config {}: {cause}", path.display()),\n        )\n    })\n}\n\nfn main() {\n    if let Err(error) = read_config(Path::new("config.toml")) {\n        eprintln!("配置读取失败：{error}");\n        std::process::exit(1);\n    }\n}',
    },
    {
      kind: "paragraph",
      content: [
        "这个简化例子保留了 IO 错误的类别，并指出具体配置路径。真实工程中可以用自定义错误枚举保留完整的 source 链，或者在应用层采用上下文工具。关键不在于选择哪个库，而在于错误发生时是否仍然知道操作对象和所在阶段。敏感路径或令牌则需要在输出前脱敏。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "stdout-stderr",
      text: "让标准输出保持可组合",
    },
    {
      kind: "paragraph",
      content: [
        "成功结果写到 stdout，进度与诊断写到 stderr，这样工具就能被管道组合。面向人的默认输出应当简洁；详细日志通过显式开关启用。需要机器处理时，提供稳定的结构化格式，并把字段契约当作公共接口，不要在同一输出流里混入装饰性文本。",
      ],
    },
    {
      kind: "list",
      items: [
        ["错误提示包含阶段和可行动的建议。"],
        ["日志不输出密钥、令牌和完整私人配置。"],
        ["相同类别的失败返回稳定的非零退出码。"],
        ["不在底层库中直接调用 process::exit。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "testing-errors",
      text: "把失败体验也放进测试",
    },
    {
      kind: "paragraph",
      content: [
        "为缺失文件、无效参数、无权限目录和下游超时建立测试。除了验证退出码，也检查关键说明是否存在，标准输出是否仍然保持干净。对完整错误文案做快照时应当谨慎，临时目录等环境差异会让测试脆弱。断言稳定的语义信息，通常更值得。",
      ],
    },
    {
      kind: "quote",
      content: [
        "错误信息是失败时的用户界面，也应该拥有和成功路径一样清楚的设计。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "一个可观察的 CLI 不一定需要复杂的日志系统。明确的输出通道、保留下来的原因链和可以预测的退出行为，就能让它在脚本、终端和自动化流水线中都更可靠。",
      ],
    },
  ],
}
