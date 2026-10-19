import Image from "next/image"
import { Avatar } from "./astra"
import type { PublicSite } from "@/lib/content/dto"

export function AuthorAvatar({
  site,
  size = "medium",
}: {
  site: PublicSite
  size?: "medium" | "large"
}) {
  if (!site.avatar)
    return (
      <Avatar
        type="initial"
        initials={site.initials}
        alt={site.authorName}
        size={size}
      />
    )
  return (
    <Image
      src={site.avatar.url}
      alt={site.avatar.alt || site.authorName}
      width={site.avatar.width}
      height={site.avatar.height}
      className={`${
        size === "large"
          ? "size-(--blog-control-size)"
          : "size-(--blog-avatar-medium)"
      } rounded-corner-full object-cover`}
      sizes="10vw"
    />
  )
}
