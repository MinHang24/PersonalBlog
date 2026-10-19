import { article as workerPool } from "./go-worker-pool"
import { article as cancellation } from "./go-context-cancellation"
import { article as shutdown } from "./go-graceful-shutdown"
import { article as ownership } from "./rust-ownership-in-practice"
import { article as errors } from "./rust-cli-error-handling"
import { article as pipeline } from "./ffmpeg-media-pipeline"
import { article as sync } from "./av-sync-basics"
import { article as hongguo } from "./hongguo-manju-desktop-notes"
import { article as persistence } from "./desktop-state-persistence"

export const articles = [
  workerPool,
  cancellation,
  shutdown,
  ownership,
  errors,
  pipeline,
  sync,
  hongguo,
  persistence,
].sort(
  (a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
)
