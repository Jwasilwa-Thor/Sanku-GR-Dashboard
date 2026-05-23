import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseISO, differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { CalendarDays, DollarSign, TableIcon, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Plane, FileText, Users, Handshake, Target, Clock, AlertCircle, Search, MapPin, UserCircle } from "lucide-react";
import { crmClient } from "@/api/crmClient";
import { budgetLines, fmtKES } from "@/utils/grData";
import { toast } from "sonner";

const statusColors = {
  Active: "bg-chart-2/10 text-chart-2",
  Planning: "bg-chart-3/10 text-chart-3",
  Completed: "bg-muted text-muted-foreground",
  "On Hold": "bg-destructive/10 text-destructive",
};

// ─── Travel Sub-table ─────────────────────────────────────────────────────────
function TravelTable({ rows, onChange }) {
  const total = rows.reduce((s, r) => s + (Number(r.days) * Number(r.perDiem) + Number(r.transport)), 0);
  function setRow(i, k, v) {
    const next = rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r);
    onChange(next);
  }
  function addRow() { onChange([...rows, { who: "", destination: "", days: 1, perDiem: 5000, transport: 0 }]); }
  function removeRow(i) { onChange(rows.filter((_, idx) => idx !== i)); }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> Travel &amp; Per Diem</p>
        <button onClick={addRow} className="text-xs text-accent hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
      </div>
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Traveller(s)", "Destination", "Days", "Per Diem/Day (KES)", "Transport (KES)", "Total", ""].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => {
                const rowTotal = Number(r.days) * Number(r.perDiem) + Number(r.transport);
                return (
                  <tr key={i}>
                    <td className="px-2 py-1"><input value={r.who} onChange={(e) => setRow(i, "who", e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary" placeholder="—" /></td>
                    <td className="px-2 py-1"><input value={r.destination} onChange={(e) => setRow(i, "destination", e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary" placeholder="—" /></td>
                    <td className="px-2 py-1 w-12"><input type="number" min={1} value={r.days} onChange={(e) => setRow(i, "days", e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary text-center" /></td>
                    <td className="px-2 py-1 w-28"><input type="number" value={r.perDiem} onChange={(e) => setRow(i, "perDiem", e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary text-right" /></td>
                    <td className="px-2 py-1 w-24"><input type="number" value={r.transport} onChange={(e) => setRow(i, "transport", e.target.value)} className="w-full bg-transparent outline-none border-b border-transparent focus:border-primary text-right" /></td>
                    <td className="px-2 py-1 text-right font-medium text-foreground">{fmtKES(rowTotal)}</td>
                    <td className="px-1 py-1"><button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button></td>
                  </tr>
                );
              })}
              <tr className="border-t bg-muted/30">
                <td colSpan={5} className="px-2 py-1.5 text-right font-semibold text-xs">Total Travel Cost:</td>
                <td className="px-2 py-1.5 font-bold text-primary text-xs">{fmtKES(total)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && <p className="text-xs text-muted-foreground italic">No travel entries. Click "Add" to log travel/per diem.</p>}
    </div>
  );
}

// ─── Table View ────────────────────────────────────────────────────────────────
function TableView({ items, stakeholders, policies, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
      <table className="w-full text-xs min-w-[900px]">
        <thead>
          <tr className="border-b bg-muted/60">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[200px]">Project</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Category</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-24">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Owner</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-24">Start</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-24">End</th>
            <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-32">Budget (KES)</th>
            <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-28">Spent</th>
            <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-20">Used</th>
            <th className="w-16 px-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((p) => {
            const pct = p.budgetKES > 0 ? Math.round((p.spentKES / p.budgetKES) * 100) : 0;
            const travelCost = (p.travel || []).reduce((s, r) => s + Number(r.days) * Number(r.perDiem) + Number(r.transport), 0);
            const linkedPols = (p.linkedPolicies || []).map((pid) => policies.find((pl) => pl.id === pid)).filter(Boolean);
            return (
              <>
                <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggle(p.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {expanded[p.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      <div>
                        <p className="font-medium text-foreground leading-snug">{p.name}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[p.status] || "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(parseISO(p.start), "d MMM yy")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(parseISO(p.end), "d MMM yy")}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.budgetKES.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.spentKES.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-semibold ${pct > 85 ? "text-destructive" : pct > 65 ? "text-chart-3" : "text-chart-2"}`}>{pct}%</span>
                  </td>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => onEdit(p)} className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
                {expanded[p.id] && (
                  <tr key={p.id + "-exp"} className="bg-muted/30">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                        <div>
                          <p className="font-semibold text-foreground mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Linked Policies</p>
                          {linkedPols.length === 0 ? <p className="text-muted-foreground italic">None linked</p> :
                            <ul className="space-y-1">{linkedPols.map((pl) => <li key={pl.id} className="text-muted-foreground">· {pl.title}</li>)}</ul>}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-2 flex items-center gap-1"><Plane className="w-3.5 h-3.5" /> Travel / Per Diem</p>
                          {(p.travel || []).length === 0 ? <p className="text-muted-foreground italic">No travel logged</p> :
                            <ul className="space-y-1">{(p.travel || []).map((t, i) => (
                              <li key={i} className="text-muted-foreground">{t.who} → {t.destination} ({t.days}d, {fmtKES(Number(t.days) * Number(t.perDiem) + Number(t.transport))})</li>
                            ))}</ul>}
                          {(p.travel || []).length > 0 && (
                            <p className="mt-1 font-semibold text-foreground">Total: {fmtKES((p.travel || []).reduce((s, r) => s + Number(r.days) * Number(r.perDiem) + Number(r.transport), 0))}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-2">Budget Line: {p.budgetLine}</p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>Budget: <span className="font-medium text-foreground">{fmtKES(p.budgetKES)}</span></p>
                            <p>Spent: <span className="font-medium text-foreground">{fmtKES(p.spentKES)}</span></p>
                            <p>Remaining: <span className={`font-medium ${p.budgetKES - p.spentKES < 0 ? "text-destructive" : "text-chart-2"}`}>{fmtKES(p.budgetKES - p.spentKES)}</span></p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
          {items.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No projects match the selected filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ─── Gantt ────────────────────────────────────────────────────────────────────
const GANTT_START = new Date("2025-10-01");
const GANTT_END = new Date("2026-12-31");
const months = eachMonthOfInterval({ start: GANTT_START, end: GANTT_END });
const totalDays = differenceInDays(GANTT_END, GANTT_START) + 1;

function dayOffset(dateStr) { return Math.max(0, differenceInDays(parseISO(dateStr), GANTT_START)); }
function daySpan(s, e) { return Math.max(1, differenceInDays(parseISO(e), parseISO(s)) + 1); }

function GanttView({ items }) {
  const today = new Date();
  const todayOffset = differenceInDays(today, GANTT_START);
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <div style={{ minWidth: 900 }}>
        <div className="flex border-b">
          <div className="w-48 shrink-0 p-3 text-xs font-semibold text-muted-foreground border-r">Project</div>
          <div className="flex-1 relative flex">
            {months.map((m) => {
              const mDays = differenceInDays(endOfMonth(m), startOfMonth(m)) + 1;
              return (
                <div key={m.toISOString()} style={{ width: `${(mDays / totalDays) * 100}%` }}
                  className="text-xs text-center py-3 font-medium border-r last:border-r-0 text-muted-foreground">
                  {format(m, "MMM yy")}
                </div>
              );
            })}
          </div>
        </div>
        {items.map((p, pi) => {
          const off = dayOffset(p.start);
          const span = daySpan(p.start, p.end);
          const todayPct = (todayOffset / totalDays) * 100;
          const pct = Math.round((p.spentKES / p.budgetKES) * 100);
          return (
            <div key={p.id} className={`flex border-b last:border-b-0 ${pi % 2 === 0 ? "" : "bg-muted/20"}`}>
              <div className="w-48 shrink-0 p-3 border-r">
                <p className="text-xs font-semibold leading-snug line-clamp-2">{p.name}</p>
                <Badge className={`text-[10px] px-1.5 py-0 mt-1 ${statusColors[p.status]}`}>{p.status}</Badge>
              </div>
              <div className="flex-1 relative" style={{ height: 64 }}>
                {todayOffset >= 0 && todayOffset <= totalDays && (
                  <div className="absolute top-0 bottom-0 w-px bg-destructive/60 z-10" style={{ left: `${todayPct}%` }} />
                )}
                <div className="absolute top-3 h-7 rounded-md flex items-center px-2 overflow-hidden"
                  style={{
                    left: `${(off / totalDays) * 100}%`,
                    width: `${(span / totalDays) * 100}%`,
                    backgroundColor: p.status === "Completed" ? "hsl(var(--muted))" : p.status === "Planning" ? "hsl(var(--chart-3)/0.3)" : "hsl(var(--primary)/0.25)",
                    border: `1.5px solid ${p.status === "Completed" ? "hsl(var(--muted-foreground)/0.3)" : p.status === "Planning" ? "hsl(var(--chart-3)/0.6)" : "hsl(var(--primary)/0.6)"}`,
                  }}>
                  <span className="text-[10px] font-semibold truncate">{p.name}</span>
                </div>
                {(p.meetings || []).map((m, idx) => {
                  const mOff = dayOffset(m.date);
                  if (mOff < 0 || mOff > totalDays) return null;
                  return <div key={`${m.date}-${idx}`} title={`${m.title} — ${m.date}`} className="absolute top-1 w-2 h-2 rounded-full bg-accent border border-white z-20" style={{ left: `calc(${(mOff / totalDays) * 100}% - 4px)` }} />;
                })}
                {(p.followUps || []).map((f, idx) => {
                  const fOff = dayOffset(f.date);
                  if (fOff < 0 || fOff > totalDays) return null;
                  return <div key={`${f.date}-${idx}`} title={`Follow-up: ${f.label}`} className="absolute bottom-1 w-2 h-2 rounded-sm bg-chart-3 border border-white z-20" style={{ left: `calc(${(fOff / totalDays) * 100}% - 4px)` }} />;
                })}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b">
                  <div className="h-full rounded-b bg-chart-2/60" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex gap-4 px-4 py-2 border-t text-[11px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Meeting</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-chart-3 inline-block" /> Follow-up</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 bg-chart-2/60 inline-block rounded" /> Budget spent</span>
          <span className="flex items-center gap-1"><span className="w-px h-3 bg-destructive/60 inline-block" /> Today</span>
        </div>
      </div>
    </div>
  );
}

// ─── Project Modal ─────────────────────────────────────────────────────────────
function ProjectModal({ initial, policies, stakeholders, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function togglePolicy(pid) {
    const current = form.linkedPolicies || [];
    set("linkedPolicies", current.includes(pid) ? current.filter((x) => x !== pid) : [...current, pid]);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial.id ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div><Label className="text-xs mb-1 block">Project Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div>
            <Label className="text-xs mb-1 block">Description</Label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Category</Label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Policy","Engagement","Advocacy","Research","Operations"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Active","Planning","Completed","On Hold"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><Label className="text-xs mb-1 block">Owner</Label><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} /></div>
            <div>
              <Label className="text-xs mb-1 block">Budget Line</Label>
              <select value={form.budgetLine} onChange={(e) => set("budgetLine", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {budgetLines.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><Label className="text-xs mb-1 block">Start Date</Label><Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} /></div>
            <div><Label className="text-xs mb-1 block">End Date</Label><Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} /></div>
            <div><Label className="text-xs mb-1 block">Budget (KES)</Label><Input type="number" value={form.budgetKES} onChange={(e) => set("budgetKES", Number(e.target.value))} /></div>
            <div><Label className="text-xs mb-1 block">Spent (KES)</Label><Input type="number" value={form.spentKES} onChange={(e) => set("spentKES", Number(e.target.value))} /></div>
          </div>

          {/* Policy Links */}
          <div>
            <Label className="text-xs mb-2 block flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Link Policy Initiatives</Label>
            <div className="flex flex-wrap gap-2">
              {policies.map((pl) => {
                const checked = (form.linkedPolicies || []).includes(pl.id);
                return (
                  <button key={pl.id} onClick={() => togglePolicy(pl.id)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${checked ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary"}`}>
                    {pl.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel */}
          <TravelTable rows={form.travel || []} onChange={(v) => set("travel", v)} />

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => onSave(form)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const emptyProject = { name: "", category: "Policy", status: "Active", owner: "", description: "", start: "", end: "", budgetLine: budgetLines[0], budgetKES: 0, spentKES: 0, meetings: [], followUps: [], travel: [], linkedPolicies: [] };

export default function ActivityProjects() {
  const [projects, setProjects] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [cat, setCat] = useState("All");
  const [st, setSt] = useState("All");
  const [view, setView] = useState("table");
  const [modal, setModal] = useState(null);
  const [stakeholders, setStakeholders] = useState([]);

  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], [projects]);
  const statuses = useMemo(() => ["All", ...new Set(projects.map((p) => p.status))], [projects]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      crmClient.entities.Project.list(),
      crmClient.entities.Policy.list(),
      crmClient.entities.Stakeholder.list(),
    ])
      .then(([projs, pols, sh]) => {
        if (!cancelled) {
          setProjects(projs);
          setPolicies(pols);
          setStakeholders(sh);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = projects.filter(
    (p) => (cat === "All" || p.category === cat) && (st === "All" || p.status === st)
  );

  async function save(data) {
    try {
      if (data.id) {
        const updated = await crmClient.entities.Project.update(String(data.id), data);
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Project updated");
      } else {
        const created = await crmClient.entities.Project.create(data);
        setProjects((prev) => [...prev, created]);
        toast.success("Project created");
      }
    } catch {
      toast.error("Failed to save project");
    }
    setModal(null);
  }

  async function handleDeleteProject(id) {
    if (!confirm("Delete project?")) return;
    try {
      await crmClient.entities.Project.delete(String(id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  }

  const totalTravel = projects.reduce((s, p) => s + (p.travel || []).reduce((ts, r) => ts + Number(r.days) * Number(r.perDiem) + Number(r.transport), 0), 0);
  const totalBudget = projects.reduce((s, p) => s + p.budgetKES, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spentKES, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity &amp; Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">Initiatives, timelines, travel expenditure, and policy links</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ data: { ...emptyProject } })}>
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Projects", value: projects.length, color: "text-primary" },
          { label: "Total Budget", value: fmtKES(totalBudget), color: "text-foreground" },
          { label: "Total Spent", value: fmtKES(totalSpent), color: "text-chart-3" },
          { label: "Travel / Per Diem", value: fmtKES(totalTravel), color: "text-accent" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card shadow-sm p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-base font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => setSt(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${st === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <TableIcon className="w-3.5 h-3.5" /> Table
          </button>
          <button onClick={() => setView("gantt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "gantt" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <CalendarDays className="w-3.5 h-3.5" /> Gantt
          </button>
        </div>
      </div>

      {view === "table" && (
        <TableView items={filtered} stakeholders={stakeholders} policies={policies}
          onEdit={(p) => setModal({ data: { ...p } })}
          onDelete={handleDeleteProject} />
      )}
      {view === "gantt" && <GanttView items={filtered} />}

      {modal && (
        <ProjectModal
          initial={modal.data}
          policies={policies}
          stakeholders={stakeholders}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}