import React, { useState, useEffect, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Link2, History } from "lucide-react";
import { crmClient } from "@/api/crmClient";
import { fmtKES } from "@/utils/grData";
import { toast } from "sonner";
import { Budget as BudgetType, Project, BudgetLink } from "@/types";

// ─── Linkage Sub-table ────────────────────────────────────────────────────────
function LinkageTable({ links, projects, onUnlink }) {
  return (
    <div className="mt-4 border rounded-xl overflow-hidden bg-slate-50/50">
      <div className="bg-slate-100/50 px-4 py-2 border-b flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Link2 className="w-3 h-3" /> Associated Allocations
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-slate-400 border-b">
            <th className="px-4 py-2 font-bold uppercase text-[9px]">Entity</th>
            <th className="px-4 py-2 font-bold uppercase text-[9px]">Type</th>
            <th className="px-4 py-2 font-bold uppercase text-[9px] text-right">Allocated</th>
            <th className="px-4 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {links.map((link) => {
            const project = projects.find(p => p.id === link.projectId);
            const activity = project?.travel.find(t => t.id === link.activityId) || project?.meetings.find(m => m.id === link.activityId);
            
            return (
              <tr key={link.id} className="hover:bg-white transition-colors">
                <td className="px-4 py-2">
                  <p className="font-bold text-slate-900">{project?.name || "Unknown Project"}</p>
                  {activity && <p className="text-[10px] text-slate-500 italic">{activity.destination || activity.title}</p>}
                </td>
                <td className="px-4 py-2">
                  <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-1.5 h-4">
                    {link.activityId ? "Activity" : "Project"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right font-mono font-bold text-slate-700">
                  {link.allocatedAmount.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => onUnlink(link.id)} className="text-slate-300 hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
          {links.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No project or activity links established.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Table View ────────────────────────────────────────────────────────────────
function TableView({ items, projects, onEdit, onDelete, onLink, onDeleteLink }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="futuristic-table-container overflow-x-auto">
      <table className="futuristic-table min-w-[1000px]">
        <thead>
          <tr>
            <th>Line Item</th>
            <th className="w-32">Category</th>
            <th className="w-24 text-center">FY</th>
            <th className="w-40 text-right">Total Budget (KES)</th>
            <th className="w-40 text-right">Allocated</th>
            <th className="w-32 text-center">Utilization</th>
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => {
            const allocated = (b.links || []).reduce((s, l) => s + l.allocatedAmount, 0);
            const pct = b.totalBudget > 0 ? Math.round((allocated / b.totalBudget) * 100) : 0;
            
            return (
              <Fragment key={b.id}>
                <tr className="cursor-pointer group" onClick={() => toggle(b.id)}>
                  <td>
                    <div className="glow-accent" />
                    <div className="flex items-center gap-2">
                      {expanded[b.id] ? <ChevronDown className="w-4 h-4 text-sanku-orange" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="font-bold text-slate-900 leading-tight">{b.lineItem}</span>
                    </div>
                  </td>
                  <td className="text-slate-600 font-medium">{b.category}</td>
                  <td className="text-center font-bold text-slate-500">{b.fiscalYear}</td>
                  <td className="text-right font-mono text-slate-900 font-bold tabular-nums">{b.totalBudget.toLocaleString()}</td>
                  <td className="text-right font-mono text-slate-600 tabular-nums">{allocated.toLocaleString()}</td>
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[11px] font-black ${pct > 90 ? "text-destructive" : pct > 70 ? "text-sanku-orange" : "text-emerald-600"}`}>{pct}%</span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${pct > 90 ? "bg-destructive" : pct > 70 ? "bg-sanku-orange" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onLink(b)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors" title="Link Project/Activity"><Link2 className="w-4 h-4" /></button>
                      <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(b.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                {expanded[b.id] && (
                  <tr className="bg-slate-50/80 backdrop-blur-sm">
                    <td colSpan={7} className="p-0">
                      <div className="px-12 py-6 border-l-2 border-sanku-orange/30 animate-in fade-in slide-in-from-left-2 duration-300">
                        <LinkageTable 
                          links={b.links || []} 
                          projects={projects} 
                          onUnlink={(linkId) => onDeleteLink(b.id, linkId)}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Budget() {
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit" | "link"; data: BudgetType | Partial<BudgetLink> | Record<string, unknown> } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([
        crmClient.entities.Budget.list(),
        crmClient.entities.Project.list()
      ]);
      setBudgets(b);
      setProjects(p);
    } catch {
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  }

  async function saveBudget(data: Partial<BudgetType>) {
    try {
      if (modal?.mode === "edit") {
        const updated = await crmClient.entities.Budget.update(data.id!, data);
        setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
        toast.success("Budget updated");
      } else {
        const created = await crmClient.entities.Budget.create({ ...data, links: [] } as BudgetType);
        setBudgets(prev => [...prev, created]);
        toast.success("Budget entry created");
      }
      setModal(null);
    } catch {
      toast.error("Operation failed");
    }
  }

  async function deleteBudget(id: string) {
    if (!confirm("Delete budget line? This will unlink all associated projects.")) return;
    try {
      await crmClient.entities.Budget.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success("Budget deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  async function createLink(budgetId: string, linkData: Partial<BudgetLink>) {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    const allocated = (budget.links || []).reduce((s, l) => s + l.allocatedAmount, 0);
    if (allocated + linkData.allocatedAmount! > budget.totalBudget) {
      toast.error("Over-budget assignment! Allocation exceeds available funds.");
      return;
    }

    try {
      const newLink: BudgetLink = {
        id: crypto.randomUUID(),
        budgetId,
        ...linkData,
        linkedAt: new Date().toISOString(),
        linkedBy: "Current User"
      } as BudgetLink;

      const updatedLinks = [...(budget.links || []), newLink];
      const updated = await crmClient.entities.Budget.update(budgetId, { links: updatedLinks });
      
      // Create Audit Log
      await crmClient.entities.AuditLog.create({
        entityType: "Link",
        entityId: newLink.id,
        action: "Link",
        changes: `Linked ${linkData.activityId ? "activity" : "project"} to budget '${budget.lineItem}' with amount ${linkData.allocatedAmount}`,
        timestamp: new Date().toISOString(),
        userId: "Current User"
      });

      setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success("Link established and logged");
      setModal(null);
      fetchData(); // Refresh audit logs
    } catch {
      toast.error("Linking failed");
    }
  }

  async function onDeleteLink(budgetId: string, linkId: string) {
    if (!confirm("Remove this budget allocation?")) return;
    
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return;

    try {
      const linkToRemove = budget.links.find(l => l.id === linkId);
      const updatedLinks = budget.links.filter(l => l.id !== linkId);
      const updated = await crmClient.entities.Budget.update(budgetId, { links: updatedLinks });

      // Create Audit Log
      await crmClient.entities.AuditLog.create({
        entityType: "Link",
        entityId: linkId,
        action: "Unlink",
        changes: `Unlinked ${linkToRemove?.activityId ? "activity" : "project"} from budget '${budget.lineItem}' (Reversed allocation: ${linkToRemove?.allocatedAmount})`,
        timestamp: new Date().toISOString(),
        userId: "Current User"
      });

      setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success("Allocation removed and logged");
      fetchData();
    } catch {
      toast.error("Failed to remove link");
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-slate-400">Loading Budget Oversight...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Budget Oversight</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Financial Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 text-slate-500" onClick={() => {/* Show Audit Modal */}}>
            <History className="w-4 h-4" /> Audit Log
          </Button>
          <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ mode: "add", data: {} })}>
            <Plus className="w-4 h-4" /> New Budget Line
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Fiscal Budget</p>
          <p className="text-2xl font-black text-slate-900">{fmtKES(budgets.reduce((s, b) => s + b.totalBudget, 0))}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Allocated</p>
          <p className="text-2xl font-black text-emerald-600">{fmtKES(budgets.reduce((s, b) => s + (b.links || []).reduce((ls, l) => ls + l.allocatedAmount, 0), 0))}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Unallocated Reserve</p>
          <p className="text-2xl font-black text-sanku-orange">{fmtKES(budgets.reduce((s, b) => s + b.totalBudget, 0) - budgets.reduce((s, b) => s + (b.links || []).reduce((ls, l) => ls + l.allocatedAmount, 0), 0))}</p>
        </div>
      </div>

      <TableView 
        items={budgets} 
        projects={projects}
        onEdit={(b) => setModal({ mode: "edit", data: b })}
        onDelete={deleteBudget}
        onLink={(b) => setModal({ mode: "link", data: { budgetId: b.id } })}
        onDeleteLink={onDeleteLink}
      />

      {/* Modals */}
      {modal && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {modal.mode === "add" ? "New Budget Line" : modal.mode === "edit" ? "Edit Budget Line" : "Link Project/Activity"}
              </DialogTitle>
            </DialogHeader>
            
            {modal.mode === "link" ? (
              <LinkageForm 
                budgetId={modal.data.budgetId}
                projects={projects}
                budgets={budgets}
                onSave={createLink}
                onClose={() => setModal(null)}
              />
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Line Item Name</Label>
                  <Input value={modal.data.lineItem || ""} onChange={e => setModal({ ...modal, data: { ...modal.data, lineItem: e.target.value } })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fiscal Year</Label>
                    <Input value={modal.data.fiscalYear || "2026"} onChange={e => setModal({ ...modal, data: { ...modal.data, fiscalYear: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select className="w-full h-10 border rounded-md px-3 text-sm bg-white" value={modal.data.category || "Operations"} onChange={e => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}>
                      {["Personnel", "Operations", "Travel", "Advocacy", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Budget (KES)</Label>
                  <Input type="number" value={modal.data.totalBudget || 0} onChange={e => setModal({ ...modal, data: { ...modal.data, totalBudget: Number(e.target.value) } })} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button className="bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => saveBudget(modal.data)}>
                    {modal.mode === "add" ? "Create" : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LinkageForm({ budgetId, projects, budgets, onSave, onClose }) {
  const [projectId, setProjectId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [amount, setAmount] = useState(0);

  const selectedProject = projects.find(p => p.id === projectId);
  const activities = selectedProject ? [...selectedProject.travel, ...selectedProject.meetings] : [];

  const budget = budgets.find(b => b.id === budgetId);
  const remaining = budget ? budget.totalBudget - (budget.links || []).reduce((s, l) => s + l.allocatedAmount, 0) : 0;

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Select Project</Label>
        <select className="w-full h-10 border rounded-md px-3 text-sm bg-white" value={projectId} onChange={e => { setProjectId(e.target.value); setActivityId(""); }}>
          <option value="">Choose a project...</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Select Activity (Optional)</Label>
        <select className="w-full h-10 border rounded-md px-3 text-sm bg-white" value={activityId} onChange={e => setActivityId(e.target.value)} disabled={!projectId}>
          <option value="">Full Project Allocation</option>
          {activities.map(a => (
            <option key={a.id} value={a.id}>
              {a.destination ? `Travel: ${a.destination} (${a.who})` : `Meeting: ${a.title}`}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Allocation Amount (KES)</Label>
          <span className="text-[10px] font-bold text-slate-400">Max Available: {remaining.toLocaleString()}</span>
        </div>
        <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          disabled={!projectId || amount <= 0 || amount > remaining}
          className="bg-slate-900 text-white font-bold" 
          onClick={() => onSave(budgetId, { projectId, activityId: activityId || undefined, allocatedAmount: amount })}
        >
          Establish Link
        </Button>
      </div>
    </div>
  );
}