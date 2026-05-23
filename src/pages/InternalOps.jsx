import { useState, useEffect } from "react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Ops &amp; Meetings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Team meetings, operational processes, and action items</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "add", type: tab, data: tab === "meetings" ? { ...emptyMeeting } : { ...emptyProcess } })}>
          <Plus className="w-4 h-4" /> Add {tab === "meetings" ? "Meeting" : "Process"}
        </Button>
      </div>

      <div className="flex gap-2 mb-5">
        {["meetings", "processes"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {t === "meetings" ? "Meetings" : "Processes"}
          </button>
        ))}
      </div>

      {tab === "meetings" ? (
        <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/60">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[200px]">Meeting</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-40">Date / Schedule</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-40">Attendees</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-28">Action Items</th>
                <th className="w-16 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meetings.map((m) => (
                <>
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleRow(m.id)}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        {expanded[m.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        {m.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[m.type] || "bg-muted text-muted-foreground"}`}>{m.type}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.attendees}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{(m.actions || []).length} item{(m.actions||[]).length !== 1 ? 's' : ''}</td>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ mode: "edit", type: "meetings", data: { ...m } })}
                          className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteMeeting(m.id)}
                          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded[m.id] && (
                    <tr key={m.id + "-exp"} className="bg-muted/30">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-foreground mb-1">Notes</p>
                            <p className="text-muted-foreground leading-relaxed">{m.notes}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-2">Action Items</p>
                            <div className="space-y-1.5">
                              {(m.actions || []).map((a, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  {a.startsWith("Completed:") ? <CheckCircle className="w-3 h-3 text-chart-2 shrink-0" /> : <Circle className="w-3 h-3 text-muted-foreground shrink-0" />}
                                  <span className={a.startsWith("Completed:") ? "line-through text-muted-foreground" : ""}>{a}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/60">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-56">Process Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description / Protocol</th>
                <th className="w-16 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processes.map((p) => (
                <>
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleRow("p" + p.id)}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        {expanded["p" + p.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        {p.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground line-clamp-1">{p.detail}</td>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ mode: "edit", type: "processes", data: { ...p } })}
                          className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteProcess(p.id)}
                          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded["p" + p.id] && (
                    <tr key={p.id + "-exp"} className="bg-muted/30">
                      <td colSpan={3} className="px-6 py-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                      </td>
                    </tr>
                  )}
                </>
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
      <DialogContent className="max-w-lg">
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
      <DialogContent className="max-w-lg">
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