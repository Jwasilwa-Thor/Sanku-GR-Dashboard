import type { LucideIcon } from "lucide-react";
import {
  Users,
  Map,
  LayoutGrid,
  Target,
  BarChart2,
  Layers,
  Activity,
  DollarSign,
  Shield,
  Handshake,
  Settings,
  LayoutDashboard,
} from "lucide-react";

export const mainNavItems: Array<{ path: string; label: string; icon: LucideIcon }> = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/stakeholders", label: "Stakeholders", icon: Users },
  { path: "/power-map", label: "Power Map", icon: Map },
  { path: "/about", label: "About", icon: LayoutGrid },
];

export type AppModule = {
  path: string;
  /** Short label for header / mobile nav */
  label: string;
  /** Title shown on the GR Overview module table */
  overviewTitle: string;
  icon: LucideIcon;
  description: string;
  iconBg: string;
};

export const appModules: AppModule[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    overviewTitle: "Dashboard",
    icon: LayoutDashboard,
    description:
      "Live overview of stakeholder counts, engagement metrics, outcome summaries, and recent activity.",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    path: "/gr-mandate",
    label: "GR Mandate",
    overviewTitle: "GR Mandate & Mission",
    icon: Target,
    description:
      "Our mandate, objectives, purpose, mission and vision guiding Sanku Kenya's government relations function.",
    iconBg: "bg-chart-1/10 text-chart-1",
  },
  {
    path: "/kpis",
    label: "KPIs",
    overviewTitle: "KPIs",
    icon: BarChart2,
    description:
      "Key performance indicators tracking the GR team's targets, progress, and results against annual goals.",
    iconBg: "bg-chart-2/10 text-chart-2",
  },
  {
    path: "/services-strategy",
    label: "Services & Strategy",
    overviewTitle: "Menu of Services & Strategy",
    icon: Layers,
    description:
      "The full range of GR services offered and the strategic approach to achieving our advocacy goals.",
    iconBg: "bg-accent/10 text-accent",
  },
  {
    path: "/activity-projects",
    label: "Activity & Projects",
    overviewTitle: "Activity & Projects",
    icon: Activity,
    description:
      "Ongoing and planned GR activities, campaigns, and projects with Gantt timeline and budget tracking.",
    iconBg: "bg-chart-3/10 text-chart-3",
  },
  {
    path: "/budget",
    label: "Budget & Expense",
    overviewTitle: "Budget & Expense",
    icon: DollarSign,
    description:
      "Track GR budget allocations, spend to date, category breakdowns, and utilisation rates.",
    iconBg: "bg-chart-3/10 text-chart-3",
  },
  {
    path: "/policy-advocacy",
    label: "Policy & Advocacy",
    overviewTitle: "Policy & Advocacy",
    icon: Shield,
    description:
      "Policy priorities, advocacy positions, and active legislative or regulatory initiatives.",
    iconBg: "bg-chart-4/10 text-chart-4",
  },
  {
    path: "/partnerships",
    label: "Partnerships",
    overviewTitle: "Partnerships",
    icon: Handshake,
    description:
      "Strategic partners, MOUs, collaboration frameworks, and relationship status with external organisations.",
    iconBg: "bg-chart-5/10 text-chart-5",
  },
  {
    path: "/internal-ops",
    label: "Internal Ops",
    overviewTitle: "Internal Ops & Meetings",
    icon: Settings,
    description:
      "Internal team meetings, operational processes, decisions, action items, and governance workflows.",
    iconBg: "bg-secondary text-secondary-foreground",
  },
  {
    path: "/about",
    label: "About",
    overviewTitle: "About",
    icon: LayoutGrid,
    description: "Overview of the Sanku Kenya Government Relations CRM platform.",
    iconBg: "bg-primary/10 text-primary",
  },
];
