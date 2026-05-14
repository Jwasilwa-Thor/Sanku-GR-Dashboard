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
  status: string;
  position: "Support" | "Champion" | "Monitor" | "Oppose";
  ministry: string;
  summary: string;
  nextStep: string;
  stakeholderLinks: string[];
}
