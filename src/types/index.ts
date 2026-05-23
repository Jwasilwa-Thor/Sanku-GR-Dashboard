export type InfluenceLevel = "Very High" | "High" | "Medium" | "Low";
export type SupportLevel = "Strong Opponent" | "Opponent" | "Neutral" | "Supporter" | "Champion";

export interface Stakeholder {
  id: string;
  full_name: string;
  title?: string;
  organization: string;
  category: string;
  influence_level: InfluenceLevel | string;
  support_level: SupportLevel | string;
  email?: string;
  phone?: string;
  district?: string;
  party_affiliation?: string;
  priority?: string;
  status?: string;
  notes?: string;
  lastEngaged?: string;
}

export type EngagementType = "Meeting" | "Call" | "Email" | "In Person";
export type EngagementOutcome = "Positive" | "Neutral" | "Needs Follow-up" | "Negative";

export interface Engagement {
  id: string;
  stakeholderId: string;
  date: string;
  type: EngagementType;
  subject: string;
  summary: string;
  outcome: EngagementOutcome;
  followUpDate?: string;
  attendees?: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Planning" | "Completed" | "On Hold";
  owner: string;
  description: string;
  start: string;
  end: string;
  budgetLine: string;
  budgetKES: number;
  spentKES: number;
  meetings: Array<{ date: string; title: string }>;
  followUps: Array<{ date: string; label: string }>;
  travel: Array<{ who: string; destination: string; days: number; perDiem: number; transport: number }>;
  linkedPolicies: string[];
}

export interface Policy {
  id: string;
  title: string;
  type: string;
  stage: "Monitoring" | "Analysis" | "Engagement" | "Decision pending" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: string;
  position: "Support" | "Champion" | "Monitor" | "Oppose";
  ministry: string;
  summary: string;
  nextStep: string;
  deadline?: string;
  assignedTo?: string[];
  stakeholderStances?: Array<{ stakeholderId: string; stance: "Supportive" | "Neutral" | "Opposed" }>;
  microWorkflow?: Array<{ step: string; completed: boolean; date?: string }>;
  ourPosition?: string;
  lastMovedAt?: string;
  documents?: Array<{ title: string; url: string; version: string }>;
  stakeholderLinks: string[];
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  stage: "Exploratory" | "Negotiation" | "Active" | "Renewing" | "Closed";
  status: string;
  focus: string;
  mou: string;
  contact: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  deadline?: string;
  assignedTo?: string[];
  lastMovedAt?: string;
}

export interface KR {
  id: string;
  label: string;
  metric: string;
  quarter: string;
  target: string;
  current: string;
  startDate: string;
  dueDate: string;
  owner: string;
  status: string;
  confidence: string;
  notes: string;
}

export interface KPI {
  id: string;
  objective: string;
  expanded: boolean;
  krs: KR[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  type: string;
  attendees: string;
  notes: string;
  actions: string[];
}

export interface Process {
  id: string;
  title: string;
  detail: string;
}
