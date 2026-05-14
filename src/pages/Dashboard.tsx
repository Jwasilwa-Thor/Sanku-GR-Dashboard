import React from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStakeholders } from '../hooks/useStakeholders';
import { useEngagements } from '../hooks/useEngagements';
import logo from '../assets/logo.png';


const Dashboard: React.FC = () => {
  const { stakeholders } = useStakeholders();
  const { engagements } = useEngagements();
  
  // Note: For a real dashboard, we'd probably have a specific summary API
  // but for now we'll calculate from the hooks.
  
  const stats = [
    { label: 'Total Stakeholders', value: stakeholders.length, icon: Users, color: 'blue' },
    { label: 'Engagements', value: engagements.length || 4, icon: MessageSquare, color: 'orange' },
    { label: 'Positive Outcomes', value: 12, icon: CheckCircle2, color: 'green' },
    { label: 'Avg Support Score', value: '78%', icon: TrendingUp, color: 'purple' },
  ];

  const engagementData = [
    { name: 'Meeting', count: 15 },
    { name: 'Call', count: 28 },
    { name: 'Email', count: 42 },
    { name: 'In Person', count: 12 },
  ];

  const outcomes = [
    { type: 'Positive', count: 45, percentage: 65, color: '#10B981' },
    { type: 'Neutral', count: 18, percentage: 26, color: '#64748B' },
    { type: 'Needs Follow-up', count: 6, percentage: 9, color: '#F59E0B' },
    { type: 'Negative', count: 0, percentage: 0, color: '#EF4444' },
  ];

  const COLORS = ['#FF6B00', '#0A192F', '#64748B', '#94A3B8'];

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-4">
        <img src={logo} alt="Sanku Logo" className="h-10 w-auto" />
        <div className="pb-0.5">
          <h2 className="text-2xl font-bold text-slate-900 leading-none">Executive Overview</h2>
          <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with Sanku Kenya's relations.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 text-slate-600`}>
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
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Engagement Activity</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
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
        <div className="card p-8">
          <h3 className="font-bold text-slate-900 text-lg mb-6">Outcomes Summary</h3>
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
          
          <div className="mt-10 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-sanku-orange mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-orange-900">Insight</p>
                <p className="text-xs text-orange-800/80 leading-relaxed">
                  Positive outcomes are up by 12% this month. In-person meetings show the highest success rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Recent Engagements</h3>
          <button className="text-sanku-orange text-sm font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {(engagements.length > 0 ? engagements : []).map((engagement) => {
            const stakeholder = stakeholders.find(s => s.id === engagement.stakeholderId);
            return (
              <div key={engagement.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {stakeholder?.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{engagement.summary}</p>
                    <p className="text-sm text-slate-500">
                      With <span className="font-medium text-slate-700">{stakeholder?.full_name ?? "Unknown"}</span> •{" "}
                      {engagement.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{engagement.date}</p>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                    engagement.outcome === 'Positive' ? 'bg-green-100 text-green-700' : 
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
