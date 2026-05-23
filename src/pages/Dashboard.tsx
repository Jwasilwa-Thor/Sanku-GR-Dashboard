import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  Shield, 
  Handshake, 
  Clock, 
  LayoutDashboard, 
  Target, 
  CalendarDays, 
  Activity, 
  ArrowUpRight
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
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from 'recharts';
import { crmClient } from '../api/crmClient';
import { Stakeholder, Engagement, Policy, Partner, Project, SupportLevel, InfluenceLevel } from '../types';
import logo from '../assets/logo.png';
import { fmtKES } from '../utils/grData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

const SUPPORT_LEVELS: SupportLevel[] = ["Strong Opponent", "Opponent", "Neutral", "Supporter", "Champion"];
const INFLUENCE_LEVELS: InfluenceLevel[] = ["Very High", "High", "Medium", "Low"];

const dotColor: Record<string, string> = {
  "Strong Opponent": "#ef4444",
  "Opponent": "#fb923c",
  "Neutral": "#94a3b8",
  "Supporter": "#34d399",
  "Champion": "#059669",
};

const dotColorClass: Record<string, string> = {
  "Strong Opponent": "bg-red-500",
  "Opponent": "bg-orange-400",
  "Neutral": "bg-slate-400",
  "Supporter": "bg-emerald-400",
  "Champion": "bg-emerald-600",
};

const priorityColors: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-chart-3/20 text-chart-3",
  High: "bg-chart-4/20 text-chart-4",
  Critical: "bg-destructive/20 text-destructive",
};

const statusColors: Record<string, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Planning: "bg-chart-3/10 text-chart-3",
  Completed: "bg-muted text-muted-foreground",
  "On Hold": "bg-destructive/10 text-destructive",
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
    const activePolicies = policies.filter(p => p.stage !== "Closed").length;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hearingsThisWeek = policies.filter(p => {
      if (!p.deadline || p.stage === "Closed") return false;
      const d = new Date(p.deadline);
      return d >= now && d <= nextWeek;
    }).length;
    const activePartners = partners.filter(p => p.stage === "Active").length;
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

  // Power Map Chart Data
  const powerMapData = useMemo(() => {
    return data.stakeholders.map(s => ({
      x: SUPPORT_LEVELS.indexOf(s.support_level as SupportLevel) + 1,
      y: INFLUENCE_LEVELS.length - INFLUENCE_LEVELS.indexOf(s.influence_level as InfluenceLevel),
      name: s.full_name,
      support: s.support_level,
      influence: s.influence_level,
      id: s.id,
      organization: s.organization
    }));
  }, [data.stakeholders]);

  // Project Gantt Helpers
  const { GANTT_START, GANTT_END, months, totalDays } = useMemo(() => {
    if (data.projects.length === 0) {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000));
      return {
        GANTT_START: start,
        GANTT_END: end,
        months: eachMonthOfInterval({ start, end }),
        totalDays: differenceInDays(end, start) + 1
      };
    }

    const projectDates = data.projects.flatMap(p => [parseISO(p.start), parseISO(p.end)]);
    const minDate = new Date(Math.min(...projectDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...projectDates.map(d => d.getTime())));
    
    const start = startOfMonth(new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1));
    const end = endOfMonth(new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0));
    
    return {
      GANTT_START: start,
      GANTT_END: end,
      months: eachMonthOfInterval({ start, end }),
      totalDays: differenceInDays(end, start) + 1
    };
  }, [data.projects]);

  const dayOffset = (dateStr: string) => Math.max(0, differenceInDays(parseISO(dateStr), GANTT_START));
  const daySpan = (s: string, e: string) => Math.max(1, differenceInDays(parseISO(e), parseISO(s)) + 1);

  if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-muted-foreground">Loading Executive Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Sanku Logo" className="h-8 w-auto" />
          <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-none whitespace-nowrap">Executive Dashboard</h2>
            <p className="text-slate-500 text-xs mt-1 whitespace-nowrap">Government Relations Performance</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Hearings Week</p>
            <p className={`text-lg font-bold ${metrics.hearingsThisWeek > 0 ? 'text-destructive' : 'text-slate-900'}`}>
              {metrics.hearingsThisWeek}
            </p>
          </div>
          <div className="text-right border-l pl-6">
            <p className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Budget Util.</p>
            <p className="text-lg font-bold text-slate-900">{metrics.utilization}%</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-xl shadow-sm h-12">
          <TabsTrigger value="overview" className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Activity size={16} /> Overview
          </TabsTrigger>
          <TabsTrigger value="powermap" className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <Target size={16} /> Power Map
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <LayoutDashboard size={16} /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="timelines" className="rounded-lg gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            <CalendarDays size={16} /> Timelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 text-lg">Engagement Distribution</h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border">
                  <Clock size={12} /> Real-time activity
                </div>
              </div>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outcomes */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-6">Matter Outcomes</h3>
              <div className="space-y-6">
                {outcomes.map((outcome) => (
                  <div key={outcome.type}>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{outcome.type}</p>
                      <p className="text-sm font-black text-slate-900">{outcome.percentage}%</p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
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
                    <p className="text-xs font-bold text-slate-900">Financial Pulse</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                      Total GR spend: <span className="font-bold">{fmtKES(metrics.totalSpent)}</span> against a budget of {fmtKES(metrics.totalBudget)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="powermap" className="space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="font-bold text-slate-900 text-lg">Stakeholder Power Map</h3>
              <div className="flex flex-wrap gap-4">
                {SUPPORT_LEVELS.map((sl) => (
                  <div key={sl} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className={`w-2 h-2 rounded-full ${dotColorClass[sl]}`} />
                    {sl}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Support" 
                    domain={[0.5, 5.5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(val) => SUPPORT_LEVELS[val - 1]}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    axisLine={false}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Influence" 
                    domain={[0.5, 4.5]} 
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(val) => INFLUENCE_LEVELS[INFLUENCE_LEVELS.length - val]}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    axisLine={false}
                  />
                  <ZAxis type="number" range={[100, 100]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-xl shadow-xl">
                            <p className="font-bold text-xs text-slate-900">{d.name}</p>
                            <p className="text-[10px] text-slate-500">{d.organization}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={powerMapData} onClick={(d) => navigate(`/stakeholders/${d.id}`)}>
                    {powerMapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={dotColor[entry.support as SupportLevel]} className="cursor-pointer" />
                    ))}
                    <LabelList dataKey="name" position="top" offset={10} style={{ fontSize: '9px', fontWeight: 700, fill: '#64748b' }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
            {["Monitoring", "Analysis", "Engagement", "Decision pending", "Closed"].map(stage => (
              <div key={stage} className="flex-1 min-w-[250px] bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                  {stage}
                  <span className="bg-white border px-1.5 py-0.5 rounded-md shadow-sm">
                    {data.policies.filter(p => p.stage === stage).length}
                  </span>
                </h4>
                <div className="space-y-3">
                  {data.policies.filter(p => p.stage === stage).map(policy => (
                    <div 
                      key={policy.id} 
                      onClick={() => navigate('/policy-advocacy')}
                      className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-slate-900"
                    >
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-2">{policy.title}</h5>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[policy.priority]}`}>
                          {policy.priority}
                        </span>
                        {policy.deadline && (
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(policy.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timelines" className="space-y-6">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div style={{ minWidth: 900 }}>
                <div className="flex border-b bg-slate-50/50">
                  <div className="w-48 shrink-0 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r">Project</div>
                  <div className="flex-1 relative flex">
                    {months.map((m) => {
                      const mDays = differenceInDays(endOfMonth(m), startOfMonth(m)) + 1;
                      return (
                        <div key={m.toISOString()} style={{ width: `${(mDays / totalDays) * 100}%` }}
                          className="text-[9px] text-center py-4 font-bold border-r last:border-r-0 text-slate-400 uppercase tracking-tighter">
                          {format(m, "MMM yy")}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {data.projects.map((p) => {
                    const off = dayOffset(p.start);
                    const span = daySpan(p.start, p.end);
                    const pct = Math.round((p.spentKES / p.budgetKES) * 100);
                    return (
                      <div key={p.id} className={`flex border-b last:border-b-0 group hover:bg-slate-50 transition-colors`}>
                        <div className="w-48 shrink-0 p-4 border-r">
                          <p className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{p.name}</p>
                          <span className={`text-[9px] font-bold uppercase mt-1 inline-block ${statusColors[p.status]}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex-1 relative h-16">
                          <div className="absolute top-4 h-6 rounded-lg flex items-center px-2 overflow-hidden shadow-sm"
                            style={{
                              left: `${(off / totalDays) * 100}%`,
                              width: `${(span / totalDays) * 100}%`,
                              backgroundColor: 'rgba(10, 25, 47, 0.05)',
                              border: '1px solid rgba(10, 25, 47, 0.1)',
                            }}>
                            <div className="absolute inset-0 bg-slate-900 opacity-[0.03]" />
                            <span className="text-[9px] font-bold text-slate-600 truncate relative z-10">{p.name}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
                            <div className="h-full bg-emerald-500/40" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Recent Engagement Log</h3>
          <button onClick={() => navigate('/stakeholders')} className="text-slate-900 text-xs font-bold flex items-center gap-1 hover:underline">
            View All Contacts <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {data.engagements.slice(0, 5).map((e) => (
            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {e.type[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{e.subject}</p>
                  <p className="text-xs text-slate-500">{e.date}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

