import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Settings,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  CalendarDays,
  MessageCircle,
  User,
} from "lucide-react";

const CATEGORIES: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  academic: { label: "Academic", icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  facility: { label: "Facility", icon: Building2, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  administration: { label: "Administration", icon: Settings, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  discipline: { label: "Discipline", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  safety: { label: "Safety", icon: AlertCircle, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  other: { label: "Other", icon: MessageSquare, color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  in_review: { label: "In Review", icon: AlertCircle, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  assigned: { label: "Assigned", icon: AlertCircle, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const PRIORITIES: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-500/10 text-slate-400" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-400" },
  high: { label: "High", color: "bg-orange-500/10 text-orange-400" },
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-400" },
};

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const complaint = useQuery(
    api.complaints.get,
    id ? { complaintId: id as any } : "skip"
  );
  const comments = useQuery(
    api.comments.listByComplaint,
    id ? { complaintId: id } : "skip"
  );
  const appointments = useQuery(
    api.appointments.listByComplaint,
    id ? { complaintId: id } : "skip"
  );

  const addComment = useMutation(api.comments.add);
  const scheduleAppointment = useMutation(api.appointments.schedule);

  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    setIsCommenting(true);
    try {
      await addComment({
        complaintId: id,
        userId: user?._id ?? "",
        userName: user?.name || user?.email || "Anonymous",
        userRole: (user?.role as any) || "student",
        content: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleTime || !id || !complaint) return;
    setIsScheduling(true);
    try {
      await scheduleAppointment({
        complaintId: id,
        complaintTitle: complaint.title,
        scheduledBy: user?._id ?? "",
        scheduledByName: user?.name || user?.email || "Anonymous",
        scheduledFor: scheduleDate,
        scheduledTime: scheduleTime,
        notes: scheduleNotes || undefined,
      });
      setShowScheduleDialog(false);
      setScheduleDate("");
      setScheduleTime("");
      setScheduleNotes("");
      toast.success("Appointment scheduled");
    } catch {
      toast.error("Failed to schedule appointment");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!complaint) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const cat = CATEGORIES[complaint.category] || CATEGORIES.other;
  const status = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending;
  const priority = PRIORITIES[complaint.priority] || PRIORITIES.low;
  const StatusIcon = status.icon;
  const CatIcon = cat.icon;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
            <span className="font-semibold hidden sm:inline">SpeakUp Campus</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Complaint Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary" className={`${cat.color} border text-xs font-medium`}>
              <CatIcon className="size-3 mr-1" />{cat.label}
            </Badge>
            <Badge variant="secondary" className={`${priority.color} text-xs font-medium`}>{priority.label}</Badge>
            <Badge variant="secondary" className={`${status.color} border text-xs font-medium`}>
              <StatusIcon className="size-3 mr-1" />{status.label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{complaint.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="size-3.5" />{complaint.userName}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{formatDate(complaint.createdAt)}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {/* Description */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </CardContent>
            </Card>

            {/* Resolution Notes */}
            {complaint.resolution && (
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="size-4" />Resolution Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.resolution}</p>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="size-5 text-primary" />
                Discussion
                {comments && <span className="text-sm text-muted-foreground font-normal">({comments.length})</span>}
              </h3>

              <div className="space-y-3 mb-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="rounded-lg border border-border/60 bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{comment.userName}</span>
                          {comment.userRole === "admin" && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">Admin</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border/60 rounded-lg">
                    No comments yet. Start the conversation below.
                  </p>
                )}
              </div>

              <form onSubmit={handleComment} className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!commentText.trim() || isCommenting}>
                  {isCommenting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Status</Label>
                  <p className="mt-1 font-medium">{status.label}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</Label>
                  <p className="mt-1 font-medium capitalize">{complaint.priority}</p>
                </div>
                <Separator />
                {complaint.department && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Department</Label>
                      <p className="mt-1 font-medium">{complaint.department}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</Label>
                  <p className="mt-1 font-medium">{formatDate(complaint.updatedAt)}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Complaint ID</Label>
                  <p className="mt-1 font-mono text-xs text-muted-foreground break-all">{complaint._id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Appointment */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />Schedule a Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Book a time to discuss this grievance with an administrator.
                </p>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowScheduleDialog(true)}>
                  <CalendarDays className="size-3.5" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Existing Appointments */}
            {appointments && appointments.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Appointments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="rounded-lg border border-border/60 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="size-3.5 text-primary" />
                        <span className="font-medium">{apt.scheduledFor}</span>
                        <span className="text-muted-foreground">at</span>
                        <span className="font-medium">{apt.scheduledTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Scheduled by {apt.scheduledByName}</p>
                      {apt.notes && <p className="text-xs text-muted-foreground mt-1">{apt.notes}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule an Appointment</DialogTitle>
            <DialogDescription>Choose a date and time to meet about this grievance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSchedule} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Time <span className="text-destructive">*</span></Label>
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any additional notes for the meeting..." value={scheduleNotes} onChange={(e) => setScheduleNotes(e.target.value)} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={!scheduleDate || !scheduleTime || isScheduling} className="gap-2">
                {isScheduling ? <Loader2 className="size-4 animate-spin" /> : <CalendarDays className="size-4" />}
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
