import api from "../lib/api";
import { mockStakeholders, mockEngagements, mockProjects, mockPolicies, mockPartners, mockKPIs, mockMeetings, mockProcesses } from "../data/mock";
import { Stakeholder, Engagement, Project, Policy, Partner, KPI, Meeting, Process } from "../types";

// This is a robust CRM client that handles both live Azure API calls 
// and gracefully falls back to mock data when the API is unconfigured.

const IS_MOCK_MODE = !import.meta.env.VITE_AZURE_API_BASE_URL;

class EntityClient<T> {
  private name: string;
  private mockData: T[];

  constructor(name: string, initialData: T[]) {
    this.name = name;
    this.mockData = [...initialData];
  }

  private async handleRequest<R>(req: () => Promise<R>, mockAction: () => R): Promise<R> {
    if (IS_MOCK_MODE) {
      console.warn(`[API MOCK] Executing ${this.name} action locally.`);
      return mockAction();
    }
    try {
      return await req();
    } catch (err) {
      console.error(`[API ERROR] ${this.name} request failed:`, err);
      // Fallback to mock on network error if in development
      if (import.meta.env.DEV) {
        return mockAction();
      }
      throw err;
    }
  }

  async list(sort?: string): Promise<T[]> {
    return this.handleRequest(
      async () => {
        const response = await api.get(`/entities/${this.name}${sort ? `?sort=${sort}` : ""}`);
        return response.data;
      },
      () => [...this.mockData]
    );
  }

  async get(id: string | undefined): Promise<T | null> {
    if (!id) return null;
    return this.handleRequest(
      async () => {
        const response = await api.get(`/entities/${this.name}/${id}`);
        return response.data;
      },
      () => (this.mockData as unknown as Record<string, unknown>[]).find((i) => i.id === id) as T || null
    );
  }

  async filter(params: Record<string, string | undefined>, sort?: string): Promise<T[]> {
    return this.handleRequest(
      async () => {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        const response = await api.get(`/entities/${this.name}?${query}${sort ? `&sort=${sort}` : ""}`);
        return response.data;
      },
      () => {
        let filtered = [...this.mockData];
        Object.keys(params).forEach(key => {
          if (params[key]) {
            filtered = filtered.filter((item) => (item as Record<string, unknown>)[key] === params[key]);
          }
        });
        return filtered;
      }
    );
  }

  async create(form: Partial<T>): Promise<T> {
    return this.handleRequest(
      async () => {
        const response = await api.post(`/entities/${this.name}`, form);
        return response.data;
      },
      () => {
        const newItem = { ...form, id: Math.random().toString(36).substr(2, 9) } as unknown as T;
        this.mockData.push(newItem);
        return newItem;
      }
    );
  }

  async update(id: string, form: Partial<T>): Promise<T> {
    return this.handleRequest(
      async () => {
        const response = await api.patch(`/entities/${this.name}/${id}`, form);
        return response.data;
      },
      () => {
        const index = (this.mockData as unknown as Record<string, unknown>[]).findIndex((i) => i.id === id);
        if (index === -1) throw new Error(`${this.name} not found`);
        this.mockData[index] = { ...this.mockData[index], ...form };
        return this.mockData[index];
      }
    );
  }

  async delete(id: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await api.delete(`/entities/${this.name}/${id}`);
      },
      () => {
        this.mockData = (this.mockData as unknown as Record<string, unknown>[]).filter((i) => i.id !== id) as unknown as T[];
      }
    );
  }
}

export const crmClient = {
  entities: {
    Stakeholder: new EntityClient<Stakeholder>("Stakeholders", mockStakeholders),
    Engagement: new EntityClient<Engagement>("Engagements", mockEngagements),
    Project: new EntityClient<Project>("Projects", mockProjects),
    Policy: new EntityClient<Policy>("Policies", mockPolicies),
    Partner: new EntityClient<Partner>("Partners", mockPartners),
    KPI: new EntityClient<KPI>("KPIs", mockKPIs),
    Meeting: new EntityClient<Meeting>("Meetings", mockMeetings),
    Process: new EntityClient<Process>("Processes", mockProcesses),
  }
};
