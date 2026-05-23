import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Handshake,
  DollarSign,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { crmClient } from '../api/crmClient';
import { Stakeholder, Engagement, Policy, Partner, Project } from '../types';
import logo from '../assets/logo.png';
import { fmtKES } from '../utils/grData';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<{
    stakeholders: Stakeholder[];
    engagements: Engagement[];
    policies: Policy[];
    partners: Partner[];
    projects: Project[];
  }>({
    stakeholders: [],
    engagements: [],
    policies: [],
    partners: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [sh, eng, pol, part, proj] = await Promise.all([
        crmClient.entities.Stakeholder.list(),
        crmClient.entities.Engagement.list(),
        crmClient.entities.Policy.list(),
        crmClient.entities.Partner.list(),
        crmClient.entities.Project.list(),
      ]);
      setData({
        stakeholders: sh,
        engagements: eng,
        policies: pol,
        partners: part,
        projects: proj,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const { stakeholders, engagements, policies, partners, projects } = data;
    
    // Policy Metrics
    const activePolicies = policies.filter(p => p.stage !== "Closed").length;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hearingsThisWeek = policies.filter(p => {
      if (!p.deadline || p.stage === "Closed") return false;
      const d = new Date(p.deadline);
      return d >= now && d <= nextWeek;
    }).length;

    // Partnership Metrics
    const activePartners = partners.filter(p => p.stage === "Active").length;
    
    // Financial Metrics
    const totalBudget = projects.reduce((s, p) => s + (p.budgetKES || 0), 0);
    const totalSpent = projects.reduce((s, p) => s + (p.spentKES || 0), 0);

    return {
      stakeholders: stakeholders.length,
      engagements: engagements.length,
      activePolicies,
      hearingsThisWeek,
      activePartners,
      totalBudget,
      totalSpent,
      utilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    };
  }, [data]);

  const stats = [
    { label: 'Stakeholders', value: metrics.stakeholders, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Engagements', value: metrics.engagements, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Policies', value: metrics.activePolicies, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Partners', value: metrics.activePartners, icon: Handshake, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const engagementData = useMemo(() => {
    const types = ['Meeting', 'Call', 'Email', 'In Person'];
    return types.map(type => ({
      name: type,
      count: data.engagements.filter(e => e.type === type).length
    }));
  }, [data.engagements]);

  const outcomes = useMemo(() => {
    const total = data.engagements.length || 1;
    const pos = data.engagements.filter(e => e.outcome === 'Positive').length;
    const neu = data.engagements.filter(e => e.outcome === 'Neutral').length;
    const fol = data.engagements.filter(e => e.outcome === 'Needs Follow-up').length;
    
    return [
      { type: 'Positive', count: pos, percentage: Math.round((pos / total) * 100), color: '#10B981' },
      { type: 'Neutral', count: neu, percentage: Math.round((neu / total) * 100), color: '#64748B' },
      { type: 'Needs Follow-up', count: fol, percentage: Math.round((fol / total) * 100), color: '#F59E0B' },
    ];
  }, [data.engagements]);

  const COLORS = ['#FF6B00', '#0A192F', '#64748B', '#94A3B8'];

  if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-muted-foreground">Loading Executive Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-4">
          <img src={logo} alt="Sanku Logo" className="h-10 w-auto" />
          <div className="pb-0.5">
            <h2 className="text-2xl font-bold text-slate-900 leading-none">Executive Dashboard</h2>
            <p className="text-slate-500 mt-1">Sanku Kenya Government Relations Performance</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Hearings This Week</p>
            <p className={`text-xl font-bold ${metrics.hearingsThisWeek > 0 ? 'text-destructive' : 'text-slate-900'}`}>
              {metrics.hearingsThisWeek}
            </p>
          </div>
          <div className="text-right border-l pl-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Budget Utilization</p>
            <p className="text-xl font-bold text-slate-900">{metrics.utilization}%</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Engagement Distribution</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              <Clock size={12} /> Real-time data
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {engagementData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcomes Summary */}
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Outcome Analysis</h3>
          <div className="space-y-6">
            {outcomes.map((outcome) => (
              <div key={outcome.type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{outcome.type}</span>
                  <span className="text-sm font-bold text-slate-900">{outcome.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: `${outcome.percentage}%`, 
                      backgroundColor: outcome.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-primary mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-slate-900">Financial Pulse</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Total GR spend to date: <span className="font-bold">{fmtKES(metrics.totalSpent)}</span> against a budget of {fmtKES(metrics.totalBudget)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Recent Engagement Log</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {data.engagements.slice(0, 5).map((engagement) => {
            const stakeholder = data.stakeholders.find(s => s.id === engagement.stakeholderId);
            return (
              <div key={engagement.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {stakeholder?.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{engagement.summary}</p>
                    <p className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{stakeholder?.full_name ?? "Unknown"}</span> •{" "}
                      {engagement.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-900">{engagement.date}</p>
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    engagement.outcome === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 
                    engagement.outcome === 'Needs Follow-up' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {engagement.outcome}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
