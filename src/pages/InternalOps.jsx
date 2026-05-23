import { useState, useEffect, Fragment } from "react";
import { Plus, Pencil, Trash2, CheckCircle, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { crmClient } from "@/api/crmClient";
import { toast } from "sonner";

const typeColors = {
  Recurring: "bg-chart-2/10 text-chart-2",
  Upcoming: "bg-chart-3/10 text-chart-3",
  Completed: "bg-muted text-muted-foreground",
};

const emptyMeeting = { title: "", date: "", type: "Upcoming", attendees: "", notes: "", actions: [] };
const emptyProcess = { title: "", detail: "" };

export default function InternalOps() {
  const [tab, setTab] = useState("meetings");
  const [meetings, setMeetings] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        crmClient.entities.Meeting.list(),
        crmClient.entities.Process.list(),
      ]);
      setMeetings(m);
      setProcesses(p);
    } catch (err) {
      console.error("Failed to fetch internal ops data:", err);
      toast.error("Could not load internal ops data");
    } finally {
      setLoading(false);
    }
  }

  async function saveMeeting(data) {
    try {
      if (modal.mode === "add") {
        const created = await crmClient.entities.Meeting.create(data);
        setMeetings((prev) => [...prev, created]);
        toast.success("Meeting added");
      } else {
        const updated = await crmClient.entities.Meeting.update(data.id, data);
        setMeetings((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        toast.success("Meeting updated");
      }
      setModal(null);
    } catch (err) {
      console.error("Failed to save meeting:", err);
      toast.error("Failed to save meeting");
    }
  }

  async function saveProcess(data) {
    try {
      if (modal.mode === "add") {
        const created = await crmClient.entities.Process.create(data);
        setProcesses((prev) => [...prev, created]);
        toast.success("Process added");
      } else {
        const updated = await crmClient.entities.Process.update(data.id, data);
        setProcesses((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        toast.success("Process updated");
      }
      setModal(null);
    } catch (err) {
      console.error("Failed to save process:", err);
      toast.error("Failed to save process");
    }
  }

  async function deleteMeeting(id) {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await crmClient.entities.Meeting.delete(id);
      setMeetings((prev) => prev.filter((x) => x.id !== id));
      toast.success("Meeting deleted");
    } catch (err) {
      console.error("Failed to delete meeting:", err);
      toast.error("Failed to delete meeting");
    }
  }

  async function deleteProcess(id) {
    if (!confirm("Are you sure you want to delete this process?")) return;
    try {
      await crmClient.entities.Process.delete(id);
      setProcesses((prev) => prev.filter((x) => x.id !== id));
      toast.success("Process deleted");
    } catch (err) {
      console.error("Failed to delete process:", err);
      toast.error("Failed to delete process");
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
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Internal Ops &amp; Meetings</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Operational Management</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ mode: "add", type: tab, data: tab === "meetings" ? { ...emptyMeeting } : { ...emptyProcess } })}>
          <Plus className="w-4 h-4" /> Add {tab === "meetings" ? "Meeting" : "Process"}
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        {["meetings", "processes"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {t === "meetings" ? "Meetings" : "Processes"}
          </button>
        ))}
      </div>

      {tab === "meetings" ? (
        <div className="futuristic-table-container overflow-x-auto">
          <table className="futuristic-table min-w-[900px]">
            <thead>
              <tr>
                <th>Meeting</th>
                <th className="w-28">Type</th>
                <th className="w-48">Date / Schedule</th>
                <th className="w-48">Attendees</th>
                <th className="w-32 text-center">Action Items</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meetings.map((m) => (
                <Fragment key={m.id}>
                  <tr className="cursor-pointer group" onClick={() => toggleRow(m.id)}>
                    <td>
                      <div className="glow-accent" />
                      <div className="flex items-center gap-2">
                        {expanded[m.id] ? <ChevronDown className="w-4 h-4 text-sanku-orange" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="font-bold text-slate-900">{m.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColors[m.type] || "bg-slate-100 text-slate-500"}`}>{m.type}</span>
                    </td>
                    <td className="text-slate-600 font-medium">{m.date}</td>
                    <td className="text-slate-500 text-xs">{m.attendees}</td>
                    <td className="text-center">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {(m.actions || []).length}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal({ mode: "edit", type: "meetings", data: { ...m } })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteMeeting(m.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded[m.id] && (
                    <tr className="bg-slate-50/80 backdrop-blur-sm">
                      <td colSpan={6} className="p-0">
                        <div className="px-12 py-6 border-l-2 border-sanku-orange/30 animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Meeting Notes</p>
                              <p className="text-slate-600 leading-relaxed bg-white/60 p-4 rounded-xl border border-slate-200/50">{m.notes}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Action Registry</p>
                              <div className="space-y-2">
                                {(m.actions || []).map((a, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 bg-white/40 rounded-lg border border-slate-100/50">
                                    {a.startsWith("Completed:") ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                                    <span className={`text-[11px] ${a.startsWith("Completed:") ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>{a}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="futuristic-table-container overflow-x-auto">
          <table className="futuristic-table min-w-[800px]">
            <thead>
              <tr>
                <th className="w-64">Process Name</th>
                <th>Description / Protocol</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processes.map((p) => (
                <Fragment key={p.id}>
                  <tr className="cursor-pointer group" onClick={() => toggleRow("p" + p.id)}>
                    <td>
                      <div className="glow-accent" />
                      <div className="flex items-center gap-2">
                        {expanded["p" + p.id] ? <ChevronDown className="w-4 h-4 text-sanku-orange" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="font-bold text-slate-900">{p.title}</span>
                      </div>
                    </td>
                    <td className="text-slate-600 text-xs line-clamp-1">{p.detail}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal({ mode: "edit", type: "processes", data: { ...p } })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-sanku-orange transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteProcess(p.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-slate-400 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded["p" + p.id] && (
                    <tr className="bg-slate-50/80 backdrop-blur-sm">
                      <td colSpan={3} className="p-0">
                        <div className="px-12 py-4 border-l-2 border-sanku-orange/30 animate-in fade-in slide-in-from-left-2 duration-300">
                          <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-4 rounded-xl border border-slate-200/50">{p.detail}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && modal.type === "meetings" && (
        <MeetingModal title={modal.mode === "add" ? "Add Meeting" : "Edit Meeting"} initial={modal.data} onSave={saveMeeting} onClose={() => setModal(null)} />
      )}
      {modal && modal.type === "processes" && (
        <ProcessModal title={modal.mode === "add" ? "Add Process" : "Edit Process"} initial={modal.data} onSave={saveProcess} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function MeetingModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial, actionsText: (initial.actions || []).join("\n") });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    const actions = form.actionsText.split("\n").map((s) => s.trim()).filter(Boolean);
    onSave({ ...form, actions });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div><Label className="text-xs mb-1 block">Meeting Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Type</Label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Upcoming","Recurring","Completed"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><Label className="text-xs mb-1 block">Date / Schedule</Label><Input value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          </div>
          <div><Label className="text-xs mb-1 block">Attendees</Label><Input value={form.attendees} onChange={(e) => set("attendees", e.target.value)} /></div>
          <div>
            <Label className="text-xs mb-1 block">Notes</Label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Action Items (one per line)</Label>
            <textarea value={form.actionsText} onChange={(e) => set("actionsText", e.target.value)} rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Draft report&#10;Completed: Send briefing" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProcessModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div><Label className="text-xs mb-1 block">Process Name</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div>
            <Label className="text-xs mb-1 block">Description / Protocol</Label>
            <textarea value={form.detail} onChange={(e) => set("detail", e.target.value)} rows={4} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
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