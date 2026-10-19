import path from "path"
import { buildFigmaConfig } from "@payloadcms/figma"
import { mcpPlugin } from "@payloadcms/plugin-mcp"
import { en as adminLanguage } from "@payloadcms/translations/languages/en"
import { zh } from "@payloadcms/translations/languages/zh"
import { fileURLToPath } from "url"
import { Admins } from "./collections/Admins"
import { Media } from "./collections/Media"
import { Folders } from "./collections/Folders"
import { Tags } from "./collections/Tags"
import { Posts } from "./collections/Posts"
import { Projects } from "./collections/Projects"
import { ActivityLogs } from "./collections/ActivityLogs"
import { ProtectedDownloads } from "./collections/ProtectedDownloads"
import { SiteSettings } from "./globals/SiteSettings"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildFigmaConfig({
  admin: {
    user: Admins.slug,
    constrainWidth: false,
    meta: { titleSuffix: "· 敏航内容工作台" },
    components: {
      providers: ["/admin/AdminDesignSystemProvider#AdminDesignSystemProvider"],
      views: { dashboard: { Component: "/admin/DashboardView#DashboardView" } },
      graphics: {
        Logo: "/admin/Brand#Brand",
        Icon: "/admin/Brand#BrandIcon",
      },
    },
    dashboard: {
      widgets: [],
      defaultLayout: [],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: "zh",
    supportedLanguages: { en: adminLanguage, zh },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    Posts,
    Projects,
    ActivityLogs,
    ProtectedDownloads,
  ],
  globals: [SiteSettings],
  localization: {
    locales: [{ code: "en", label: "English" }],
    fallback: true,
    defaultLocale: "en",
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [mcpPlugin({})],
  figma: {},
})
