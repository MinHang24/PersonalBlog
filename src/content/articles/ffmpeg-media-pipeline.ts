import type { Article } from "../types"

export const article: Article = {
  slug: "ffmpeg-media-pipeline",
  title: "用 FFmpeg 组织可靠的媒体处理流水线",
  excerpt:
    "从一条命令到一条流水线：让探测、转码、校验和发布各司其职，失败也可以安全重试。",
  category: "multimedia",
  tags: ["FFmpeg", "音视频", "流水线"],
  publishedAt: "2025-06-08",
  blocks: [
    {
      kind: "paragraph",
      content: [
        "能成功运行的 FFmpeg 命令，只是媒体处理系统的起点。面对不同编码、损坏文件、异常时间戳和资源限制，一条超长命令很快就会变成难以排查的黑盒。把处理过程拆成几个有输入、输出和验证条件的阶段，才能让它成为可以维护的流水线。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "probe-first",
      text: "在处理之前，先了解输入",
    },
    {
      kind: "paragraph",
      content: [
        "使用 ffprobe 读取容器、流、编码格式、尺寸与时长，并保留结构化结果。不要仅凭扩展名决定处理方式，也不要假设每个视频都有音轨。输入探测还能帮助选择合理的处理策略，例如是否需要旋转、补齐奇数尺寸，以及能否直接复用编码而不做转码。",
      ],
    },
    {
      kind: "code",
      language: "shell",
      code: "ffprobe -v error \\\n  -show_format \\\n  -show_streams \\\n  -of json \\\n  input.mp4",
    },
    {
      kind: "paragraph",
      content: [
        "对探测结果建立最小约束：至少存在一条目标流，尺寸在可接受范围内，时长信息可解释。某些输入没有可靠的总时长，应当允许未知进度，而不是为了展示百分比编造一个值。对异常输入尽早失败，比等待转码到最后一步更节约资源。",
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "explicit-stages",
      text: "让每个阶段都产生可识别的产物",
    },
    {
      kind: "paragraph",
      content: [
        "一个常见划分是探测、规范化、转码、校验和发布。中间结果写到任务独占的临时目录，只有全部校验通过后才移动到最终位置。避免直接覆盖原始文件；重试时根据输入指纹和处理参数判断是否可以复用中间结果，而不是仅仅检查文件是否存在。",
      ],
    },
    {
      kind: "code",
      language: "shell",
      code: "ffmpeg -hide_banner -nostdin -i input.mp4 \\\n  -map 0:v:0 -map 0:a:0? \\\n  -c:v libx264 -preset medium -crf 22 \\\n  -c:a aac -b:a 128k \\\n  -movflags +faststart \\\n  output.pending.mp4",
    },
    {
      kind: "heading",
      level: 2,
      id: "validation",
      text: "进程成功，不代表产物正确",
    },
    {
      kind: "paragraph",
      content: [
        "退出码为零只是最低要求。输出文件还应当能被重新探测，包含预期的流，时长差异在合理范围内，必要时抽样解码。对于重要任务，还需要验证音轨、分辨率和关键帧策略。校验规则应由使用场景决定，不必把所有输入都强制变成同一种格式。",
      ],
    },
    {
      kind: "list",
      ordered: true,
      items: [
        ["输入探测：得到明确的流信息和处理参数。"],
        ["资源调度：控制 CPU、磁盘与同时运行的进程数量。"],
        ["转码执行：记录命令、版本、退出状态和错误摘要。"],
        ["产物校验：重新探测，通过后原子发布。"],
      ],
    },
    {
      kind: "heading",
      level: 2,
      id: "retry-and-cleanup",
      text: "让重试和清理同样可靠",
    },
    {
      kind: "paragraph",
      content: [
        "重试前先区分暂时性故障与确定性输入错误。磁盘临时不可用可以延迟重试，损坏的输入重复执行通常没有意义。取消任务时终止子进程并等待它退出，再清理临时文件。对超时退出留下任务阶段和错误上下文，而不是只记录“处理失败”。",
      ],
    },
    {
      kind: "quote",
      content: [
        "一条好的媒体流水线，不只是知道如何完成，也知道如何解释失败、如何重新开始。",
      ],
    },
    {
      kind: "paragraph",
      content: [
        "把长命令拆成稳定阶段后，优化会更有方向：瓶颈是探测、解码、编码还是磁盘，都可以单独观察。可靠性来自明确的契约，而不是越来越多难以解释的命令参数。",
      ],
    },
  ],
}
