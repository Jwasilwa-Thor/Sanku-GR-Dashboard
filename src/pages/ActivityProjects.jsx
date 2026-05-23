import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseISO, differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { CalendarDays, DollarSign, Table2, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Plane, FileText, Users, Handshake, Target, Clock, AlertCircle, Search, MapPin, UserCircle } from "lucide-react";
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
    <div className="futuristic-table-container overflow-x-auto">
      <table className="futuristic-table min-w-[1000px]">
        <thead>
          <tr>
            <th>Project</th>
            <th className="w-28">Category</th>
            <th className="w-24">Status</th>
            <th className="w-28">Owner</th>
            <th className="w-28">Timeline</th>
            <th className="w-32 text-right">Budget (KES)</th>
            <th className="w-28 text-right">Spent</th>
            <th className="w-20 text-center">Used</th>
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const pct = p.budgetKES > 0 ? Math.round((p.spentKES / p.budgetKES) * 100) : 0;
            const linkedPols = (p.linkedPolicies || []).map((pid) => policies.find((pl) => pl.id === pid)).filter(Boolean);
            return (
              <Fragment key={p.id}>
                <tr className="cursor-pointer group" onClick={() => toggle(p.id)}>
                  <td>
                    <div className="glow-accent" />
                    <div className="flex items-center gap-2">
                      {expanded[p.id] ? <ChevronDown className="w-4 h-4 text-sanku-orange" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-600 font-medium">{p.category}</td>
                  <td>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[p.status] || "bg-slate-100 text-slate-500"}`}>{p.status}</span>
                  </td>
                  <td className="text-slate-600">{p.owner}</td>
                  <td className="text-slate-500 text-[11px] font-medium leading-tight">
                    {format(parseISO(p.start), "MMM d")} -<br />
                    {format(parseISO(p.end), "MMM d, yy")}
                  </td>
                  <td className="text-right font-mono text-slate-700 font-bold tabular-nums">{p.budgetKES.toLocaleString()}</td>
                  <td className="text-right font-mono text-slate-600 tabular-nums">{p.spentKES.toLocaleString()}</td>
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[11px] font-black ${pct > 85 ? "text-destructive" : pct > 65 ? "text-sanku-orange" : "text-emerald-600"}`}>{pct}%</span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${pct > 85 ? "bg-destructive" : pct > 65 ? "bg-sanku-orange" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                {expanded[p.id] && (
                  <tr className="bg-slate-50/80 backdrop-blur-sm">
                    <td colSpan={9} className="p-0">
                      <div className="px-12 py-6 border-l-2 border-sanku-orange/30 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Linked Policies</p>
                            {linkedPols.length === 0 ? <p className="text-slate-400 italic">No associated policy initiatives</p> :
                              <div className="flex flex-wrap gap-2">{linkedPols.map((pl) => <Badge key={pl.id} variant="outline" className="bg-white/80 border-slate-200 text-slate-600">{pl.title}</Badge>)}</div>}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> Logistics & Travel</p>
                            {(p.travel || []).length === 0 ? <p className="text-slate-400 italic">No travel records logged</p> :
                              <ul className="space-y-2">{(p.travel || []).map((t, i) => (
                                <li key={i} className="text-slate-600 flex items-center justify-between border-b border-slate-200/50 pb-1 last:border-0">
                                  <span>{t.who} → {t.destination}</span>
                                  <span className="font-mono font-bold text-[10px]">{fmtKES(Number(t.days) * Number(t.perDiem) + Number(t.transport))}</span>
                                </li>
                              ))}</ul>}
                          </div>
                          <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Financial Overview</p>
                            <div className="space-y-2">
                              <div className="flex justify-between"><span className="text-slate-500">Allocation</span><span className="font-mono font-bold text-slate-900">{fmtKES(p.budgetKES)}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Utilization</span><span className="font-mono font-bold text-slate-900">{fmtKES(p.spentKES)}</span></div>
                              <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                                <span className="font-bold text-slate-900">Remaining</span>
                                <span className={`font-mono font-black ${p.budgetKES - p.spentKES < 0 ? "text-destructive" : "text-emerald-600"}`}>{fmtKES(p.budgetKES - p.spentKES)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {items.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-medium">No projects matching your current filters were found.</td></tr>}
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
  const [budgets, setBudgets] = useState([]);
  const [links, setLinks] = useState([]);
  
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    crmClient.entities.Budget.list().then(setBudgets);
  }, []);

  useEffect(() => {
    if (initial.id) {
      // Find all budget links for this project
      const allLinks = budgets.flatMap(b => (b.links || []).filter(l => l.projectId === initial.id));
      setLinks(allLinks);
    }
  }, [budgets, initial.id]);

  function togglePolicy(pid) {
    const current = form.linkedPolicies || [];
    set("linkedPolicies", current.includes(pid) ? current.filter((x) => x !== pid) : [...current, pid]);
  }

  const totalAllocated = links.reduce((s, l) => s + l.allocatedAmount, 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{initial.id ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div><Label className="text-xs mb-1 block">Project Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div>
                <Label className="text-xs mb-1 block">Description</Label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">Owner</Label><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} /></div>
                <div><Label className="text-xs mb-1 block">Budget (Total KES)</Label><Input type="number" value={form.budgetKES} onChange={(e) => set("budgetKES", Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">Start Date</Label><Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} /></div>
                <div><Label className="text-xs mb-1 block">End Date</Label><Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Budget Integration</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Allocated via System</span>
                    <span className="text-xs font-bold text-slate-900">{totalAllocated.toLocaleString()} KES</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (totalAllocated / form.budgetKES) * 100)}%` }} />
                  </div>
                  <p className="text-[9px] text-slate-400 italic mt-1">* Budget linkages are managed in the Budget Oversight module.</p>
                </div>

                {links.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {links.map(l => {
                      const b = budgets.find(x => x.id === l.budgetId);
                      return (
                        <div key={l.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border text-[10px]">
                          <span className="font-bold text-slate-700">{b?.lineItem}</span>
                          <span className="font-mono">{l.allocatedAmount.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs mb-2 block flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Link Policy Initiatives</Label>
                <div className="flex flex-wrap gap-2">
                  {policies.map((pl) => {
                    const checked = (form.linkedPolicies || []).includes(pl.id);
                    return (
                      <button key={pl.id} onClick={() => togglePolicy(pl.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] border transition-colors ${checked ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-900"}`}>
                        {pl.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <TravelTable rows={form.travel || []} onChange={(v) => set("travel", v)} />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button size="sm" onClick={() => onSave(form)} className="bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold rounded-xl px-6">Save Project</Button>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Activity &amp; Projects</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Portfolio Management</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ data: { ...emptyProject } })}>
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
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
      </div>

      <TableView items={filtered} stakeholders={stakeholders} policies={policies}
        onEdit={(p) => setModal({ data: { ...p } })}
        onDelete={handleDeleteProject} />

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