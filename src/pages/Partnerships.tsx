import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Handshake, Target, Clock, Search, UserCircle, Table2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crmClient } from "@/api/crmClient";
import { Partner } from "@/types";
import { toast } from "sonner";

const STAGES = ["Exploratory", "Negotiation", "Active", "Renewing", "Closed"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

const priorityColors = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-chart-3/20 text-chart-3",
  High: "bg-chart-4/20 text-chart-4",
  Critical: "bg-destructive/20 text-destructive",
};

const stageColors = {
  Exploratory: "border-muted text-muted-foreground",
  Negotiation: "border-chart-3 text-chart-3",
  Active: "border-chart-2 text-chart-2",
  Renewing: "border-chart-4 text-chart-4",
  Closed: "border-muted/50 text-muted-foreground/50",
};

const emptyPartner: Partial<Partner> = {
  name: "",
  type: "NGO",
  stage: "Exploratory",
  status: "Active",
  focus: "",
  mou: "No",
  contact: "",
  priority: "Medium",
};

export default function Partnerships() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; data: Partner } | null>(null);
  const [detailItem, setDetailItem] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"table" | "pipeline">("table");

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    setLoading(true);
    try {
      const data = await crmClient.entities.Partner.list();
      setPartners(data);
    } catch {
      toast.error("Could not load partners");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return partners;
    const s = searchTerm.toLowerCase();
    return partners.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.focus.toLowerCase().includes(s) || 
      p.contact.toLowerCase().includes(s)
    );
  }, [partners, searchTerm]);

  async function savePartner(data: Partner) {
    try {
      if (modal?.mode === "add") {
        const created = await crmClient.entities.Partner.create({ ...data, lastMovedAt: new Date().toISOString() });
        setPartners((prev) => [...prev, created]);
        toast.success("Partner added");
      } else {
        const updated = await crmClient.entities.Partner.update(data.id, data);
        setPartners((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        toast.success("Partner updated");
      }
      setModal(null);
    } catch {
      toast.error("Failed to save partner");
    }
  }

  async function updateStage(partner: Partner, newStage: Partner['stage']) {
    try {
      const updated = await crmClient.entities.Partner.update(partner.id, { 
        stage: newStage, 
        lastMovedAt: new Date().toISOString() 
      });
      setPartners(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(`Partner moved to ${newStage}`);
    } catch {
      toast.error("Failed to update stage");
    }
  }

  async function deletePartner(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await crmClient.entities.Partner.delete(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success("Partner removed");
    } catch {
      toast.error("Failed to delete partner");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen animate-pulse text-muted-foreground">Loading Partnerships...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Partnership Pipeline</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Strategic Alliances</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-50 rounded-lg p-1">
            <button onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Table2 className="w-3.5 h-3.5" /> Table
            </button>
            <button onClick={() => setView("pipeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "pipeline" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutDashboard className="w-3.5 h-3.5" /> Pipeline
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 w-40 lg:w-48 text-xs rounded-xl border-slate-200 bg-slate-50/50" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9 px-4 gap-1.5 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ mode: "add", data: { ...emptyPartner } as Partner })}>
            <Plus className="w-4 h-4" /> New Partner
          </Button>
        </div>
      </div>

      {/* Content View */}
      {view === "pipeline" ? (
        <div className="flex gap-4 overflow-x-auto pb-8 min-h-[600px]">
          {STAGES.map(stage => (
            <div key={stage} className="flex-1 min-w-[280px] bg-muted/30 rounded-xl p-3 border border-border/50">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full border-2 ${stageColors[stage].split(' ')[0]}`} />
                  {stage}
                  <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                    {filtered.filter(p => p.stage === stage).length}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {filtered.filter(p => p.stage === stage).map(partner => (
                  <PartnerCard 
                    key={partner.id} 
                    partner={partner} 
                    onClick={() => setDetailItem(partner)}
                    onEdit={() => setModal({ mode: "edit", data: { ...partner } })}
                  />
                ))}
                {filtered.filter(p => p.stage === stage).length === 0 && (
                  <div className="text-[11px] text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg opacity-50">
                    No partners in {stage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="futuristic-table-container overflow-x-auto">
          <table className="futuristic-table min-w-[1000px]">
            <thead>
              <tr>
                <th>Organization</th>
                <th className="w-32">Stage</th>
                <th className="w-28">Priority</th>
                <th className="w-28">MOU Status</th>
                <th className="w-48">Primary Contact</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="cursor-pointer group" onClick={() => setDetailItem(p)}>
                  <td>
                    <div className="glow-accent" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight">{p.name}</span>
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
                  <td>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.mou === "Yes" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {p.mou}
                    </span>
                  </td>
                  <td className="text-slate-600 font-medium">{p.contact}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ mode: "edit", data: { ...p } })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletePartner(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityColors[detailItem.priority]}`}>
                      {detailItem.priority} Priority
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">{detailItem.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{detailItem.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
                    <Handshake className="w-4 h-4" /> {detailItem.mou === "Yes" ? "MOU Active" : detailItem.mou === "In Progress" ? "MOU In Progress" : "No MOU"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Current Stage</Label>
                  <select 
                    className={`h-9 rounded-lg border-2 bg-background px-3 text-sm font-bold ${stageColors[detailItem.stage].split(' ')[0]}`}
                    value={detailItem.stage}
                    onChange={(e) => updateStage(detailItem, e.target.value as Partner['stage'])}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Strategic Focus
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50 text-sm leading-relaxed">
                    {detailItem.focus}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-primary" /> Key Contact
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50 text-sm">
                    <p className="font-bold">{detailItem.contact}</p>
                    <p className="text-muted-foreground mt-1 text-[11px]">Primary lead for partnership activities</p>
                  </div>
                </section>
              </div>

              <div className="flex justify-between items-center pt-6 border-t text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Last moved: {detailItem.lastMovedAt ? new Date(detailItem.lastMovedAt).toLocaleDateString() : "Unknown"}
                </div>
                <Button variant="destructive" size="sm" className="h-7 text-[10px]" onClick={() => { deletePartner(detailItem.id); setDetailItem(null); }}>
                  <Trash2 className="w-3 h-3 mr-1" /> Delete Partner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {modal && (
        <Dialog open={!!modal} onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-xl" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{modal.mode === "add" ? "New Strategic Partner" : "Edit Partner"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div className="col-span-2 space-y-2">
                <Label>Organization Name</Label>
                <Input value={modal.data.name} onChange={e => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.type} onChange={e => setModal({ ...modal, data: { ...modal.data, type: e.target.value } })}>
                  <option>NGO</option>
                  <option>UN Agency</option>
                  <option>Government</option>
                  <option>Regulatory Body</option>
                  <option>Academic</option>
                  <option>Donor</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.priority} onChange={e => setModal({ ...modal, data: { ...modal.data, priority: e.target.value as Partner['priority'] } })}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>MOU Status</Label>
                <select className="w-full h-9 rounded-md border bg-background px-3" 
                  value={modal.data.mou} onChange={e => setModal({ ...modal, data: { ...modal.data, mou: e.target.value } })}>
                  <option>Yes</option>
                  <option>No</option>
                  <option>In Progress</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Primary Contact</Label>
                <Input value={modal.data.contact} onChange={e => setModal({ ...modal, data: { ...modal.data, contact: e.target.value } })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Strategic Focus</Label>
                <textarea className="w-full rounded-md border bg-background px-3 py-2 min-h-[80px]" 
                  value={modal.data.focus} onChange={e => setModal({ ...modal, data: { ...modal.data, focus: e.target.value } })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setModal(null)}>Cancel</Button>
              <Button size="sm" onClick={() => savePartner(modal.data)}>Save Partner</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PartnerCard({ partner, onClick, onEdit }: { partner: Partner; onClick: () => void; onEdit: () => void }) {
  const isStalled = partner.lastMovedAt && 
    (new Date().getTime() - new Date(partner.lastMovedAt).getTime()) > (7 * 24 * 60 * 60 * 1000) && 
    partner.stage !== "Closed";

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-card border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${stageColors[partner.stage].split(' ')[0]} ${isStalled ? 'ring-1 ring-orange-500/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
          {partner.type}
        </span>
        <div className="flex gap-1.5">
          {isStalled && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500 animate-pulse">
              <Clock className="w-2.5 h-2.5" /> STALLED
            </div>
          )}
          <div className={`w-2 h-2 rounded-full ${priorityColors[partner.priority].split(' ')[0]}`} />
        </div>
      </div>
      
      <h4 className="text-[13px] font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {partner.name}
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <UserCircle className="w-3 h-3" />
          <span className="truncate">{partner.contact}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${partner.mou === "Yes" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"}`}>
            MOU: {partner.mou}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {partner.lastMovedAt ? new Date(partner.lastMovedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "New"}
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