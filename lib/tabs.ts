export const tabConfig = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    component: "DashboardContent",
  },
  clients: {
    id: "clients", 
    label: "Clients",
    component: "ClientsContent",
  },
  assignments: {
    id: "assignments",
    label: "Assignments",
    component: "AssignmentsContent",
  },
  "generate-edit": {
    id: "generate-edit",
    label: "Generate & Edit",
    component: "GenerateEditContent",
  },
  settings: {
    id: "settings",
    label: "Settings",
    component: "SettingsContent",
  },
    "add-client": {
    id: "add-client",
    label: "Add Client",
    component: "AddClientContent",
  },
} as const

export type TabId = keyof typeof tabConfig
