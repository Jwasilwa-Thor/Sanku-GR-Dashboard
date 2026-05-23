import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crmClient } from "@/api/crmClient";
import { toast } from "sonner";

const STATUSES = ["On Track", "Achieved", "At Risk", "Behind", "In Progress"];
const CONFIDENCE = ["High", "Medium", "Low"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const statusStyle = {
  "On Track": "bg-emerald-100 text-emerald-700",
  "Achieved": "bg-blue-100 text-blue-700",
  "At Risk": "bg-orange-100 text-orange-700",
  "Behind": "bg-red-100 text-red-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
};
const confStyle = {
  "High": "text-emerald-600 font-semibold",
  "Medium": "text-orange-500 font-semibold",
  "Low": "text-red-500 font-semibold",
};

function calcProgress(target, current) {
  const t = parseFloat(target);
  const c = parseFloat(current);
  if (!isNaN(t) && !isNaN(c) && t > 0) return ((c / t) * 100).toFixed(2) + "%";
  if (target && current) {
    if (target.toLowerCase() === current.toLowerCase()) return "100.00%";
    if (current.toLowerCase() === "yes" && target.toLowerCase() === "yes") return "100.00%";
    if (current.toLowerCase() === "no" && target.toLowerCase() === "yes") return "0.00%";
  }
  return "—";
}

const emptyKR = { label: "", metric: "", quarter: "Q1", target: "", current: "", startDate: "", dueDate: "", owner: "", status: "On Track", confidence: "High", notes: "" };

export default function KPIs() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // { kpiId, kr } or null
  const [addKpiModal, setAddKpiModal] = useState(false);
  const [newKpiName, setNewKpiName] = useState("");
  const [addKrModal, setAddKrModal] = useState(null); // kpiId

  useEffect(() => {
    fetchKPIs();
  }, []);

  async function fetchKPIs() {
    setLoading(true);
    try {
      const data = await crmClient.entities.KPI.list();
      setKpis(data);
    } catch (err) {
      console.error("Failed to fetch KPIs:", err);
      toast.error("Could not load KPIs");
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(kpiId) {
    setKpis((prev) => prev.map((k) => k.id === kpiId ? { ...k, expanded: !k.expanded } : k));
  }

  async function saveKR(kpiId, updated) {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) return;

    const nextKrs = kpi.krs.map((r) => r.id === updated.id ? updated : r);
    try {
      const updatedKpi = await crmClient.entities.KPI.update(kpiId, { ...kpi, krs: nextKrs });
      setKpis((prev) => prev.map((k) => k.id === kpiId ? updatedKpi : k));
      toast.success("Key Result updated");
      setEditModal(null);
    } catch (err) {
      console.error("Failed to update KR:", err);
      toast.error("Failed to update KR");
    }
  }

  async function deleteKR(kpiId, krId) {
    if (!confirm("Are you sure you want to delete this KR?")) return;
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) return;

    const nextKrs = kpi.krs.filter((r) => r.id !== krId);
    try {
      const updatedKpi = await crmClient.entities.KPI.update(kpiId, { ...kpi, krs: nextKrs });
      setKpis((prev) => prev.map((k) => k.id === kpiId ? updatedKpi : k));
      toast.success("Key Result deleted");
    } catch (err) {
      console.error("Failed to delete KR:", err);
      toast.error("Failed to delete KR");
    }
  }

  async function addKPI() {
    if (!newKpiName.trim()) return;
    try {
      const created = await crmClient.entities.KPI.create({
        objective: newKpiName.trim(),
        expanded: true,
        krs: []
      });
      setKpis((prev) => [...prev, created]);
      setNewKpiName("");
      setAddKpiModal(false);
      toast.success("KPI group added");
    } catch (err) {
      console.error("Failed to add KPI:", err);
      toast.error("Failed to add KPI group");
    }
  }

  async function deleteKPI(kpiId) {
    if (!confirm("Are you sure you want to delete this entire KPI group?")) return;
    try {
      await crmClient.entities.KPI.delete(kpiId);
      setKpis((prev) => prev.filter((k) => k.id !== kpiId));
      toast.success("KPI group deleted");
    } catch (err) {
      console.error("Failed to delete KPI:", err);
      toast.error("Failed to delete KPI group");
    }
  }

  async function addKR(kpiId, kr) {
    const kpi = kpis.find((k) => k.id === kpiId);
    if (!kpi) return;

    const num = (kpi?.krs.length || 0) + 1;
    const kpiIndex = kpis.findIndex((k) => k.id === kpiId) + 1;
    const newKr = { ...kr, id: `kr${kpiIndex}.${num}`, label: `KR ${kpiIndex}.${num}` };

    try {
      const updatedKpi = await crmClient.entities.KPI.update(kpiId, {
        ...kpi,
        krs: [...kpi.krs, newKr]
      });
      setKpis((prev) => prev.map((k) => k.id === kpiId ? updatedKpi : k));
      setAddKrModal(null);
      toast.success("Key Result added");
    } catch (err) {
      console.error("Failed to add KR:", err);
      toast.error("Failed to add Key Result");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">2026 Key Performance Indicators</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track objectives, key results, progress, and status across all GR functions</p>
        </div>
        <Button size="sm" onClick={() => setAddKpiModal(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add KPI Group
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[1100px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground w-16">#</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground min-w-[200px]">Objective / Key Result</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground min-w-[180px]">Metric / KPI</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-16">Quarter</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-20">Target</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-24">Current Value</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-24">Progress %</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-24">Start Date</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-24">Due Date</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground w-24">Owner</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-28">Status</th>
              <th className="px-3 py-2.5 text-center font-semibold text-muted-foreground w-24">Confidence</th>
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground min-w-[140px]">Notes / Blockers</th>
              <th className="px-3 py-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kpis.map((kpi, ki) => (
              <>
                {/* KPI Group row */}
                <tr key={kpi.id} className="bg-slate-100 dark:bg-muted/50 border-b">
                  <td className="px-3 py-2 font-bold text-foreground" colSpan={1}>
                    <button onClick={() => toggleExpand(kpi.id)} className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors">
                      {kpi.expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      KPI{ki + 1}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-bold text-foreground" colSpan={11}>{kpi.objective}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setAddKrModal(kpi.id)}
                        className="p-1 rounded hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground" title="Add KR">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteKPI(kpi.id)}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground" title="Delete KPI group">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* KR rows */}
                {kpi.expanded && kpi.krs.map((kr) => {
                  const prog = calcProgress(kr.target, kr.current);
                  return (
                    <tr key={kr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 text-muted-foreground pl-8">{kr.label}</td>
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-foreground">{kr.metric}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{kr.quarter}</td>
                      <td className="px-3 py-2 text-center font-medium">{kr.target}</td>
                      <td className="px-3 py-2 text-center font-medium">
                        {kr.current === "In Progress" ? (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[11px]">In Progress</span>
                        ) : kr.current}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-foreground">{prog}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{kr.startDate}</td>
                      <td className="px-3 py-2 text-center text-muted-foreground">{kr.dueDate}</td>
                      <td className="px-3 py-2 text-muted-foreground">{kr.owner}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle[kr.status] || "bg-muted text-muted-foreground"}`}>
                          {kr.status}
                        </span>
                      </td>
                      <td className={`px-3 py-2 text-center text-[11px] ${confStyle[kr.confidence] || ""}`}>{kr.confidence}</td>
                      <td className="px-3 py-2 text-muted-foreground">{kr.notes || "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEditModal({ kpiId: kpi.id, kr: { ...kr } })}
                            className="p-1 rounded hover:bg-accent/10 hover:text-accent transition-colors text-muted-foreground">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteKR(kpi.id, kr.id)}
                            className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit KR Modal */}
      {editModal && (
        <KRFormModal
          title={`Edit ${editModal.kr.label}`}
          initial={editModal.kr}
          onSave={(updated) => saveKR(editModal.kpiId, updated)}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Add KR Modal */}
      {addKrModal && (
        <KRFormModal
          title="Add Key Result"
          initial={{ ...emptyKR }}
          onSave={(kr) => addKR(addKrModal, kr)}
          onClose={() => setAddKrModal(null)}
        />
      )}

      {/* Add KPI Group Modal */}
      <Dialog open={addKpiModal} onOpenChange={setAddKpiModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add KPI Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs mb-1 block">Objective / Group Name</Label>
              <Input value={newKpiName} onChange={(e) => setNewKpiName(e.target.value)} placeholder="e.g. Stakeholder Engagement" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAddKpiModal(false)}>Cancel</Button>
              <Button size="sm" onClick={addKPI}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KRFormModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
          <div className="col-span-2">
            <Label className="text-xs mb-1 block">Metric / KPI Description</Label>
            <Input value={form.metric} onChange={(e) => set("metric", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Quarter</Label>
            <select value={form.quarter} onChange={(e) => set("quarter", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {QUARTERS.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Owner</Label>
            <Input value={form.owner} onChange={(e) => set("owner", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Target</Label>
            <Input value={form.target} onChange={(e) => set("target", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Current Value</Label>
            <Input value={form.current} onChange={(e) => set("current", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Start Date</Label>
            <Input value={form.startDate} onChange={(e) => set("startDate", e.target.value)} placeholder="e.g. 1-Jan-26" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Due Date</Label>
            <Input value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} placeholder="e.g. 30-Jun-26" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Status</Label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Confidence</Label>
            <select value={form.confidence} onChange={(e) => set("confidence", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {CONFIDENCE.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs mb-1 block">Notes / Blockers</Label>
            <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any blockers or notes..." />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}