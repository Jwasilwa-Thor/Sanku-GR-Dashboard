import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { fmtKES } from "@/utils/grData";
import { Link } from "react-router-dom";

const statusColors = {
  "Active": "bg-chart-2/10 text-chart-2",
  "Under Review": "bg-chart-3/10 text-chart-3",
  "Monitoring": "bg-muted text-muted-foreground",
  "Completed": "bg-secondary text-secondary-foreground",
};

const positionColors = {
  Champion: "bg-primary/10 text-primary",
  Support: "bg-chart-2/10 text-chart-2",
  Monitor: "bg-muted text-muted-foreground",
  Oppose: "bg-destructive/10 text-destructive",
};

const emptyPolicy = { title: "", type: "Policy", status: "Active", position: "Support", ministry: "", summary: "", nextStep: "", stakeholderLinks: [] };

export default function PolicyAdvocacy() {
  const [policies, setPolicies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [stakeholders, setStakeholders] = useState([]);
  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.Policy.list(),
      base44.entities.Project.list(),
      base44.entities.Stakeholder.list(),
    ])
      .then(([pols, projs, sh]) => {
        if (!cancelled) {
          setPolicies(pols);
          setProjects(projs);
          setStakeholders(sh);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const types = ["All", ...new Set(policies.map((p) => p.type))];
  const filtered = filter === "All" ? policies : policies.filter((p) => p.type === filter);

  async function save(data) {
    try {
      if (modal.mode === "add") {
        const created = await base44.entities.Policy.create(data);
        setPolicies((prev) => [...prev, created]);
      } else {
        const updated = await base44.entities.Policy.update(String(data.id), data);
        setPolicies((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      }
    } catch {
      /* ignore */
    }
    setModal(null);
  }

  async function deletePolicy(id) {
    try {
      await base44.entities.Policy.delete(String(id));
      setPolicies((prev) => prev.filter((x) => x.id !== id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy &amp; Advocacy</h1>
          <p className="text-muted-foreground mt-1 text-sm">Policy priorities, advocacy positions, and stakeholder alignment</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "add", data: { ...emptyPolicy } })}>
          <Plus className="w-4 h-4" /> Add Policy
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[1000px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[220px]">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Position</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-40">Ministry / Body</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[160px]">Summary</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[160px]">Next Step</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-24">Stakeholders</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-36">Total Spend</th>
              <th className="w-16 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const linkedSh = (p.stakeholderLinks || []).map((sid) => stakeholders.find((s) => s.id === sid)).filter(Boolean);
              const linkedProjects = projects.filter((proj) => (proj.linkedPolicies || []).includes(p.id));
              const totalSpend = linkedProjects.reduce((s, proj) => s + proj.spentKES, 0);
              const totalBudget = linkedProjects.reduce((s, proj) => s + proj.budgetKES, 0);
              return (
                <>
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleRow(p.id)}>
                    <td className="px-4 py-3 font-medium text-foreground leading-snug">
                      <div className="flex items-center gap-1.5">
                        {expanded[p.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        {p.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[p.status] || "bg-muted text-muted-foreground"}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${positionColors[p.position] || "bg-muted text-muted-foreground"}`}>{p.position}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.ministry}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{p.summary}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{p.nextStep}</td>
                    <td className="px-4 py-3 text-center">
                      {linkedSh.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                          <Users className="w-3 h-3" />{linkedSh.length}
                        </span>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {totalSpend > 0 ? (
                        <div>
                          <p className={`text-xs font-semibold ${totalSpend > totalBudget ? "text-destructive" : "text-chart-2"}`}>{fmtKES(totalSpend)}</p>
                          <p className="text-[10px] text-muted-foreground">{linkedProjects.length} project{linkedProjects.length !== 1 ? "s" : ""}</p>
                        </div>
                      ) : <span className="text-muted-foreground/40 text-xs">—</span>}
                    </td>
                    <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ mode: "edit", data: { ...p } })}
                          className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => deletePolicy(p.id)}
                          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded[p.id] && (
                    <tr key={p.id + "-exp"} className="bg-muted/30">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
                          <div>
                            <p className="font-semibold text-foreground mb-1">Summary</p>
                            <p className="text-muted-foreground leading-relaxed">{p.summary}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Next Step</p>
                            <p className="text-muted-foreground leading-relaxed">{p.nextStep}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-2 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> Linked Stakeholders
                            </p>
                            {linkedSh.length === 0 ? (
                              <p className="text-muted-foreground italic">No stakeholders linked yet. Edit to add.</p>
                            ) : (
                              <div className="space-y-1">
                                {linkedSh.map((s) => (
                                  <Link key={s.id} to={`/stakeholders/${s.id}`}
                                    className="flex items-center gap-2 hover:text-accent transition-colors"
                                    onClick={(e) => e.stopPropagation()}>
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                                      {(s.full_name || "?").charAt(0)}
                                    </div>
                                    <span className="text-muted-foreground hover:text-accent">{s.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground/60">&middot; {s.organization}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-2">Budget &amp; Spend</p>
                            {linkedProjects.length === 0 ? (
                              <p className="text-muted-foreground italic">No projects linked to this policy yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {linkedProjects.map((proj) => {
                                  const pct = proj.budgetKES > 0 ? Math.round((proj.spentKES / proj.budgetKES) * 100) : 0;
                                  return (
                                    <div key={proj.id} className="rounded-lg border bg-background px-3 py-2">
                                      <p className="font-medium text-foreground mb-1 leading-snug">{proj.name}</p>
                                      <div className="flex justify-between text-muted-foreground mb-1">
                                        <span>{fmtKES(proj.spentKES)}</span>
                                        <span className={`font-semibold ${pct > 85 ? "text-destructive" : pct > 65 ? "text-chart-3" : "text-chart-2"}`}>{pct}%</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div className={`h-full rounded-full ${pct > 85 ? "bg-destructive" : pct > 65 ? "bg-chart-3" : "bg-chart-2"}`}
                                          style={{ width: `${Math.min(100, pct)}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between font-semibold pt-1 border-t">
                                  <span className="text-muted-foreground">{linkedProjects.length} project{linkedProjects.length !== 1 ? "s" : ""}:</span>
                                  <span className={totalSpend > totalBudget ? "text-destructive" : "text-chart-2"}>{fmtKES(totalSpend)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No policies found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <PolicyModal
          title={modal.mode === "add" ? "Add Policy / Initiative" : "Edit Policy / Initiative"}
          initial={modal.data}
          stakeholders={stakeholders}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function PolicyModal({ title, initial, stakeholders, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial, stakeholderLinks: initial.stakeholderLinks || [] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function toggleStakeholder(sid) {
    const current = form.stakeholderLinks || [];
    set("stakeholderLinks", current.includes(sid) ? current.filter((x) => x !== sid) : [...current, sid]);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div><Label className="text-xs mb-1 block">Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Type</Label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Legislation","Regulation","Policy","Bill","Framework","Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Active","Under Review","Monitoring","Completed"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Position</Label>
              <select value={form.position} onChange={(e) => set("position", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Champion","Support","Monitor","Oppose"].map((pos) => <option key={pos}>{pos}</option>)}
              </select>
            </div>
          </div>
          <div><Label className="text-xs mb-1 block">Ministry / Body</Label><Input value={form.ministry} onChange={(e) => set("ministry", e.target.value)} /></div>
          <div>
            <Label className="text-xs mb-1 block">Summary</Label>
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Next Step</Label>
            <textarea value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <Label className="text-xs mb-2 block">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Link Stakeholders to this Policy</span>
            </Label>
            {stakeholders.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No stakeholders in CRM yet.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {stakeholders.map((s) => {
                  const checked = form.stakeholderLinks.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleStakeholder(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors ${checked ? "bg-primary/5" : ""}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary" : "border-border"}`}>
                        {checked && <span className="text-primary-foreground text-[10px]">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{s.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.title ? `${s.title} · ${s.organization}` : s.organization}
                        </p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        s.support_level === "Champion" || s.support_level === "Supporter" ? "bg-chart-2/10 text-chart-2" :
                        s.support_level === "Opponent" || s.support_level === "Strong Opponent" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"}`}>{s.support_level}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {form.stakeholderLinks.length > 0 && (
              <p className="text-[11px] text-primary mt-1">{form.stakeholderLinks.length} stakeholder{form.stakeholderLinks.length > 1 ? "s" : ""} linked</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => onSave(form)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}