import { Trash2, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import moment from "moment";

const outcomeStyle = {
  "Positive": "bg-chart-2/10 text-chart-2",
  "Neutral": "bg-muted text-muted-foreground",
  "Negative": "bg-destructive/10 text-destructive",
  "Needs Follow-up": "bg-chart-3/10 text-chart-3",
};

const typeIcon = {
  "Meeting": "🤝",
  "In Person": "👤",
  "Phone Call": "📞",
  "Email": "📧",
  "Event": "🎪",
  "Testimony": "🏛️",
  "Site Visit": "📍",
  "Letter": "✉️",
  "Other": "📋",
};

export default function EngagementList({ engagements, onDelete }) {
  if (engagements.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No engagements recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {engagements.map((e) => (
        <Card key={e.id} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-lg mt-0.5">{typeIcon[e.type] || "📋"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{e.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{e.type}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {moment(e.date).format("MMM D, YYYY")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {e.outcome && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeStyle[e.outcome] || ""}`}>
                        {e.outcome}
                      </span>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {e.summary && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{e.summary}</p>}
                {e.attendees && <p className="text-xs text-muted-foreground mt-1">Attendees: {e.attendees}</p>}
                {e.follow_up_date && (
                  <p className="text-xs text-chart-3 mt-1">Follow-up: {moment(e.follow_up_date).format("MMM D, YYYY")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}