import { format } from "date-fns";

export const fmtKES = (n) => {
  if (n === undefined || n === null) return "KES 0";
  return `KES ${Number(n).toLocaleString()}`;
};

export const budgetLines = [
  "Core Operations",
  "Advocacy & Policy",
  "Stakeholder Engagement",
  "Regulatory Compliance",
  "Research & Analysis",
  "Travel & Per Diem",
  "Special Projects"
];

export const initialProjects = [
  {
    id: "1",
    name: "National Food Safety Bill Advocacy",
    category: "Policy",
    status: "Active",
    owner: "Jane Doe",
    description: "Engagement with Parliamentary Health Committee regarding the 2025 Food Safety Bill.",
    start: "2025-10-15",
    end: "2026-03-30",
    budgetLine: "Advocacy & Policy",
    budgetKES: 1500000,
    spentKES: 450000,
    meetings: [
      { date: "2025-11-10", title: "Initial Committee Briefing" }
    ],
    followUps: [
      { date: "2025-12-01", label: "Submit Memorandum" }
    ],
    travel: [
      { who: "Jane Doe", destination: "Nairobi", days: 2, perDiem: 5000, transport: 2000 }
    ],
    linkedPolicies: ["1"]
  },
  {
    id: "2",
    name: "KEBS Standard Alignment",
    category: "Engagement",
    status: "Planning",
    owner: "John Smith",
    description: "Aligning DosiFlo specifications with updated KEBS fortification standards.",
    start: "2025-12-01",
    end: "2026-06-15",
    budgetLine: "Regulatory Compliance",
    budgetKES: 800000,
    spentKES: 0,
    meetings: [],
    followUps: [],
    travel: [],
    linkedPolicies: ["2"]
  },
  {
    id: "3",
    name: "County Nutrition Action Plans (Nakuru)",
    category: "Advocacy",
    status: "Active",
    owner: "Sarah Omari",
    description: "Integration of fortification targets into Nakuru County's 5-year nutrition plan.",
    start: "2025-11-01",
    end: "2026-04-20",
    budgetLine: "Advocacy & Policy",
    budgetKES: 1200000,
    spentKES: 600000,
    meetings: [
      { date: "2025-11-15", title: "County Health Dept Meeting" }
    ],
    followUps: [],
    travel: [
      { who: "Sarah Omari", destination: "Nakuru", days: 3, perDiem: 6000, transport: 8000 }
    ],
    linkedPolicies: ["3"]
  }
];

export const initialPolicies = [
  { 
    id: "1", 
    title: "National Food Safety Bill 2025", 
    type: "Legislation", 
    status: "Under Review", 
    position: "Support", 
    ministry: "Ministry of Health", 
    summary: "Advocates for mandatory fortification of staple foods including maize flour and rice at milling stage.", 
    nextStep: "Submit written memorandum to Parliamentary Health Committee by May 2026.", 
    stakeholderLinks: [] 
  },
  { 
    id: "2", 
    title: "Kenya Food Fortification Regulation (Amendment)", 
    type: "Regulation", 
    status: "Active", 
    position: "Champion", 
    ministry: "Ministry of Agriculture", 
    summary: "Proposes updating fortification levels in KS 2062 to align with WHO recommendations and Sanku's DosiFlo specs.", 
    nextStep: "Follow up with KEBS technical committee in June 2026.", 
    stakeholderLinks: [] 
  },
  { 
    id: "3", 
    title: "County Nutrition Action Plans", 
    type: "Policy", 
    status: "Active", 
    position: "Support", 
    ministry: "County Governments", 
    summary: "Ensure county-level nutrition action plans include fortification as a key intervention across 10 priority counties.", 
    nextStep: "Present briefing paper to County Health Directors in Nakuru and Kisumu.", 
    stakeholderLinks: [] 
  },
  { 
    id: "4", 
    title: "Public Nutrition Procurement Policy", 
    type: "Policy", 
    status: "Monitoring", 
    position: "Monitor", 
    ministry: "National Treasury", 
    summary: "Ensure government procurement of food for institutions mandates fortified products.", 
    nextStep: "Monitor Public Procurement Regulatory Authority consultations.", 
    stakeholderLinks: [] 
  },
];
