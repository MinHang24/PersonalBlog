import {
  createElement,
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div"
  variant?: "hero" | "page" | "section" | "card" | "body" | "small" | "meta" | "eyebrow"
  children: ReactNode
}

type LinkProps = Omit<ComponentProps<typeof Link>, "href" | "as"> & {
  to: ComponentProps<typeof Link>["href"]
}

// Astra has no semantic typography or general-purpose blog surface primitive.
export function Typography({
  as = "p",
  variant = "body",
  className = "",
  children,
  ...props
}: TextProps) {
  return createElement(
    as,
    { ...props, className: `type-${variant} ${className}` },
    children,
  )
}

export function GlassSurface({
  as = "div",
  variant = "glass",
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside"
  variant?: "glass" | "reading"
  children: ReactNode
}) {
  return createElement(
    as,
    {
      ...props,
      className: `glass blog-surface blog-surface--${variant} ${className}`,
    },
    children,
  )
}

export function AppLink({ to, className = "", children, ...props }: LinkProps) {
  return (
    <Link href={to} {...props} className={`app-link ${className}`}>
      {children}
    </Link>
  )
}

export function TextLink({ children, ...props }: LinkProps) {
  return (
    <AppLink {...props} className={`text-link ${props.className || ""}`}>
      {children}
      <ArrowRight className="icon-sm" aria-hidden="true" />
    </AppLink>
  )
}

export function ExternalLink({
  href,
  children,
  className = "",
  ...props
}: Omit<LinkProps, "to"> & { href: string }) {
  if (!/^(https:\/\/|mailto:)/.test(href)) return <span>{children}</span>
  return (
    <Link
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={`app-link ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

export function SectionHeading({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow?: string
  children?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}
        <Typography as="h2" variant="section">
          {title}
        </Typography>
      </div>
      {children}
    </div>
  )
}
