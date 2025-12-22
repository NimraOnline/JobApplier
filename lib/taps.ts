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
} as const

export type TabId = keyof typeof tabConfig
