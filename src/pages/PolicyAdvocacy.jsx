import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Users, AlertCircle, Clock, CheckCircle2, FileText, Target, MapPin, Search, DollarSign, Table2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { crmClient } from "@/api/crmClient";
import { fmtKES } from "@/utils/grData";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const STAGES = ["Monitoring", "Analysis", "Engagement", "Decision pending", "Closed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const priorityColors = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-chart-3/20 text-chart-3",
  High: "bg-chart-4/20 text-chart-4",
  Critical: "bg-destructive/20 text-destructive",
};

const stageColors = {
  Monitoring: "border-muted text-muted-foreground",
  Analysis: "border-chart-3 text-chart-3",
  Engagement: "border-primary text-primary",
  "Decision pending": "border-chart-4 text-chart-4",
  Closed: "border-chart-2 text-chart-2",
};

const emptyPolicy = { 
  title: "", 
  type: "Legislation", 
  stage: "Monitoring",
  priority: "Medium",
  status: "Active", 
  position: "Monitor", 
  ministry: "", 
  summary: "", 
  nextStep: "", 
  stakeholderLinks: [],
  microWorkflow: [
    { step: "Issue identified", completed: false },
    { step: "Impact assessment", completed: false },
    { step: "Brief drafted", completed: false },
    { step: "Stakeholder alignment", completed: false },
    { step: "Submission", completed: false },
  ]
};

export default function PolicyAdvocacy() {
  const [policies, setPolicies] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pols, sh, projs] = await Promise.all([
        crmClient.entities.Policy.list(),
        crmClient.entities.Stakeholder.list(),
        crmClient.entities.Project.list(),
      ]);
      setPolicies(pols);
      setStakeholders(sh);
      setProjects(projs);
    } catch (err) {
      toast.error("Failed to load advocacy data");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return policies;
    const s = searchTerm.toLowerCase();
    return policies.filter(p => 
      p.title.toLowerCase().includes(s) || 
      p.ministry.toLowerCase().includes(s) || 
      p.summary.toLowerCase().includes(s)
    );
  }, [policies, searchTerm]);

  async function save(data) {
    try {
      if (modal.mode === "add") {
        const created = await crmClient.entities.Policy.create({ ...data, lastMovedAt: new Date().toISOString() });
        setPolicies(prev => [...prev, created]);
        toast.success("Matter created");
      } else {
        const updated = await crmClient.entities.Policy.update(data.id, data);
        setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success("Matter updated");
      }
      setModal(null);
    } catch (err) {
      toast.error("Failed to save matter");
    }
  }

  async function updateStage(policy, newStage) {
    try {
      const updated = await crmClient.entities.Policy.update(policy.id, { 
        stage: newStage, 
        lastMovedAt: new Date().toISOString() 
      });
      setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(`Moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to update stage");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen animate-pulse">Loading Pipeline...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Policy Pipeline</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Advocacy Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 w-40 lg:w-48 text-xs rounded-xl border-slate-200 bg-slate-50/50" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9 px-4 gap-1.5 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ mode: "add", data: { ...emptyPolicy } })}>
            <Plus className="w-4 h-4" /> New Matter
          </Button>
        </div>
      </div>

      <div className="futuristic-table-container overflow-x-auto">
        <table className="futuristic-table min-w-[1000px]">
          <thead>
            <tr>
              <th>Title</th>
              <th className="w-32">Stage</th>
              <th className="w-28">Priority</th>
              <th className="w-48">Ministry</th>
              <th className="w-32">Deadline</th>
              <th className="w-32 text-right">Budget Utilization</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const linkedProjects = projects.filter(proj => (proj.linkedPolicies || []).includes(p.id));
              const totalSpent = linkedProjects.reduce((s, proj) => s + proj.spentKES, 0);
              const isOverdue = p.deadline && new Date(p.deadline) < new Date() && p.stage !== "Closed";

              return (
                <tr key={p.id} className="cursor-pointer group" onClick={() => setDetailItem(p)}>
                  <td>
                    <div className="glow-accent" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight">{p.title}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{p.type}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stageColors[p.stage]}`}>
                      {p.stage}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityColors[p.priority]}`}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="text-slate-600 font-medium">{p.ministry}</td>
                  <td>
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isOverdue ? 'text-destructive' : 'text-slate-500'}`}>
                      {p.deadline ? new Date(p.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2y' }) : '—'}
                      {isOverdue && <AlertCircle className="w-3 h-3 animate-pulse" />}
                    </div>
                  </td>
                  <td className="text-right">
                    {totalSpent > 0 ? (
                      <span className="font-mono text-slate-700 font-bold tabular-nums">{totalSpent.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-300 font-mono text-[10px]">---</span>
                    )}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ mode: "edit", data: { ...p } })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if(confirm("Delete matter?")) crmClient.entities.Policy.delete(p.id).then(fetchData) }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Panel Modal */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailPanel 
              policy={detailItem} 
              stakeholders={stakeholders}
              projects={projects}
              onUpdateStage={(s) => updateStage(detailItem, s)}
              onClose={() => setDetailItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {modal && (
        <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modal.mode === "add" ? "New Policy Matter" : "Edit Matter"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={modal.data.title} onChange={e => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.type} onChange={e => setModal({ ...modal, data: { ...modal.data, type: e.target.value } })}>
                  <option>Legislation</option>
                  <option>Regulatory</option>
                  <option>Budget</option>
                  <option>Policy</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ministry / Body</Label>
                <Input value={modal.data.ministry} onChange={e => setModal({ ...modal, data: { ...modal.data, ministry: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={modal.data.deadline || ""} onChange={e => setModal({ ...modal, data: { ...modal.data, deadline: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.priority} onChange={e => setModal({ ...modal, data: { ...modal.data, priority: e.target.value } })}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Our Position</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.position} onChange={e => setModal({ ...modal, data: { ...modal.data, position: e.target.value } })}>
                  <option>Champion</option>
                  <option>Support</option>
                  <option>Monitor</option>
                  <option>Oppose</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Summary</Label>
                <textarea className="w-full rounded-md border bg-background px-3 py-2 min-h-[80px]" 
                  value={modal.data.summary} onChange={e => setModal({ ...modal, data: { ...modal.data, summary: e.target.value } })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Next Action</Label>
                <Input value={modal.data.nextStep} onChange={e => setModal({ ...modal, data: { ...modal.data, nextStep: e.target.value } })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setModal(null)}>Cancel</Button>
              <Button size="sm" onClick={() => save(modal.data)}>Save Matter</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MatterCard({ policy, onClick, onEdit }) {
  const isOverdue = policy.deadline && new Date(policy.deadline) < new Date() && policy.stage !== "Closed";
  const overdueDays = policy.deadline ? Math.floor((new Date().getTime() - new Date(policy.deadline).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const isStalled = policy.lastMovedAt && 
    (new Date().getTime() - new Date(policy.lastMovedAt).getTime()) > (7 * 24 * 60 * 60 * 1000) && 
    policy.stage !== "Closed";

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-card border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${stageColors[policy.stage].split(' ')[0]} ${isStalled ? 'ring-1 ring-orange-500/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
          {policy.type}
        </span>
        <div className="flex gap-1.5">
          {isStalled && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500 animate-pulse">
              <Clock className="w-2.5 h-2.5" /> STALLED
            </div>
          )}
          <div className={`w-2 h-2 rounded-full ${priorityColors[policy.priority].split(' ')[0]}`} />
        </div>
      </div>
      
      <h4 className="text-[13px] font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {policy.title}
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{policy.ministry}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {(policy.assignedTo || ["GR"]).map((name, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[8px] font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {isOverdue && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-destructive animate-pulse">
                <AlertCircle className="w-3 h-3" />
                {overdueDays}d
              </div>
            )}
            {policy.deadline && !isOverdue && (
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(policy.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="absolute top-2 right-2 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

function DetailPanel({ policy, stakeholders, projects, onUpdateStage, onClose }) {
  const linkedSh = (policy.stakeholderLinks || []).map(sid => stakeholders.find(s => s.id === sid)).filter(Boolean);
  const linkedProjects = projects.filter(p => (p.linkedPolicies || []).includes(policy.id));
  
  return (
    <div className="space-y-8 py-4">
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityColors[policy.priority]}`}>
              {policy.priority} Priority
            </span>
            <span className="text-sm text-muted-foreground font-medium">{policy.type}</span>
          </div>
          <h2 className="text-2xl font-bold">{policy.title}</h2>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
            <MapPin className="w-4 h-4" /> {policy.ministry}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Current Stage</Label>
          <select 
            className={`h-9 rounded-lg border-2 bg-background px-3 text-sm font-bold ${stageColors[policy.stage].split(' ')[0]}`}
            value={policy.stage}
            onChange={(e) => onUpdateStage(e.target.value)}
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Context & Timeline */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Matter Overview
            </h3>
            <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
              <p className="text-sm leading-relaxed mb-4">{policy.summary}</p>
              <div className="bg-background rounded-lg p-3 border border-primary/20">
                <p className="text-[10px] font-bold uppercase text-primary mb-1">Our Stated Position</p>
                <p className="text-sm font-medium">{policy.ourPosition || "No formal position recorded yet."}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Micro-Workflow Timeline
            </h3>
            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-1 before:bottom-1 before:w-0.5 before:bg-border">
              {(policy.microWorkflow || []).map((step, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center z-10 ${step.completed ? 'bg-chart-2' : 'bg-muted'}`}>
                    {step.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.step}</p>
                    {step.date && <p className="text-[10px] text-muted-foreground">{new Date(step.date).toLocaleDateString()}</p>}
                    {!step.completed && i === (policy.microWorkflow.findIndex(s => !s.completed)) && (
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold ml-2">Current Focus</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Stakeholders & Finance */}
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Stakeholder Stance
            </h3>
            <div className="space-y-3">
              {linkedSh.length > 0 ? linkedSh.map(s => {
                const stanceObj = (policy.stakeholderStances || []).find(st => st.stakeholderId === s.id);
                const stance = stanceObj?.stance || "Neutral";
                const stanceColor = stance === "Supportive" ? "bg-chart-2/10 text-chart-2" : stance === "Opposed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground";
                
                return (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border bg-background group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {s.full_name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold truncate">{s.full_name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{s.organization}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${stanceColor}`}>
                      {stance}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-[11px] text-muted-foreground italic p-4 text-center border-2 border-dashed rounded-lg">
                  No key stakeholders linked
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Financial Exposure
            </h3>
            <div className="space-y-3">
              {linkedProjects.map(proj => {
                const pct = proj.budgetKES > 0 ? Math.round((proj.spentKES / proj.budgetKES) * 100) : 0;
                return (
                  <div key={proj.id} className="p-3 rounded-lg border bg-background">
                    <p className="text-[11px] font-bold mb-1 truncate">{proj.name}</p>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Spent: {fmtKES(proj.spentKES)}</span>
                      <span className="font-bold">{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full bg-primary`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
              {linkedProjects.length === 0 && (
                <div className="text-[11px] text-muted-foreground italic p-4 text-center border-2 border-dashed rounded-lg">
                  No budget allocations
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Key Contacts
            </h3>
            <div className="flex flex-wrap gap-2">
              {policy.assignedTo?.map(name => (
                <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-[10px] font-medium">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px]">{name[0]}</div>
                  {name}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}