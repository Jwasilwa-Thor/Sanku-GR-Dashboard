import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Plus, Mail, Phone, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import StakeholderForm from "../components/StakeholderForm";
import EngagementForm from "../components/EngagementForm";
import EngagementList from "../components/EngagementList";
import { Stakeholder } from "../types";

import { useStakeholders } from "../hooks/useStakeholders";
import { useEngagements } from "../hooks/useEngagements";

export default function StakeholderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stakeholders, loading: sLoading, updateStakeholder, deleteStakeholder } = useStakeholders();
  const { engagements, loading: eLoading, addEngagement, deleteEngagement } = useEngagements(id);
  
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showEngagement, setShowEngagement] = useState(false);

  const stakeholder = stakeholders.find(s => s.id === id) || null;
  const loading = sLoading || eLoading;

  async function handleUpdate(form: Partial<Stakeholder>) {
    if (!id) return;
    setSaving(true);
    try {
      await updateStakeholder(id, form);
      setShowEdit(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteStakeholder(id);
      navigate("/stakeholders");
    } catch {
      // Handled by toast
    }
  }

  async function handleAddEngagement(form) {
    setSaving(true);
    try {
      await addEngagement({ ...form, stakeholderId: id });
      setShowEngagement(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEngagement(engId: string) {
    await deleteEngagement(engId);
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Stakeholder not found.</p>
        <Button variant="link" onClick={() => navigate("/stakeholders")}>Back to list</Button>
      </div>
    );
  }

  const s = stakeholder;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Button variant="ghost" onClick={() => navigate("/stakeholders")} className="h-9 px-3 gap-2 text-slate-500 hover:text-sanku-orange transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> 
          <span className="whitespace-nowrap">Back to Stakeholders</span>
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-0 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider whitespace-nowrap">
            Profile View
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {s.full_name?.charAt(0)}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setShowEdit(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Stakeholder?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove {s.full_name} and cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight">{s.full_name}</h2>
            {s.title && <p className="text-sm text-muted-foreground mt-0.5">{s.title}</p>}

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">{s.category || "Other"}</Badge>
              <Badge variant={s.priority === "Critical" ? "destructive" : "secondary"}>{s.priority || "Medium"}</Badge>
              <Badge variant="outline">{s.status || "Active"}</Badge>
            </div>

            <div className="mt-6 space-y-3">
              {s.organization && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{s.organization}</span>
                </div>
              )}
              {s.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${s.email}`} className="text-accent hover:underline">{s.email}</a>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{s.phone}</span>
                </div>
              )}
              {s.district && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{s.district}</span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Influence</p>
                <p className="text-sm font-semibold mt-0.5">{s.influence_level}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Support</p>
                <p className="text-sm font-semibold mt-0.5">{s.support_level}</p>
              </div>
            </div>

            {s.party_affiliation && (
              <p className="text-xs text-muted-foreground mt-4">Party: {s.party_affiliation}</p>
            )}

            {s.notes && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{s.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagements */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Engagement History</h3>
            <Button onClick={() => setShowEngagement(true)} size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Log Engagement
            </Button>
          </div>
          <EngagementList engagements={engagements} onDelete={handleDeleteEngagement} />
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Edit Stakeholder</DialogTitle></DialogHeader>
          <StakeholderForm initial={s} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEngagement} onOpenChange={setShowEngagement}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Log Engagement</DialogTitle></DialogHeader>
          <EngagementForm stakeholderId={id} onSubmit={handleAddEngagement} onCancel={() => setShowEngagement(false)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}