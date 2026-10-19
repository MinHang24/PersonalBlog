import type { AdminViewServerProps } from "payload"
import { DefaultTemplate } from "@payloadcms/ui/rsc"
import { Dashboard } from "./Dashboard"

export function DashboardView(props: AdminViewServerProps) {
  return (
    <DefaultTemplate
      {...props}
      req={props.initPageResult.req}
      visibleEntities={props.initPageResult.visibleEntities}
      viewType="dashboard"
    >
      <div className="gutter--left gutter--right dashboard__wrap">
        <Dashboard />
      </div>
    </DefaultTemplate>
  )
}
