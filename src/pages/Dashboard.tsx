import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Send, LogOut, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Filter, Plus, BookOpen, Building2, Settings, AlertTriangle, MessageSquare,
  Loader2, Search, CalendarDays, MessageCircle, ChevronRight, Shield,
  Wifi, UtensilsCrossed, BedDouble, BookMarked, Upload, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  academic: { label: "Academics", icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  hostel: { label: "Hostel", icon: BedDouble, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  mess: { label: "Mess", icon: UtensilsCrossed, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  it: { label: "IT", icon: Wifi, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  infrastructure: { label: "Infrastructure", icon: Building2, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  library: { label: "Library", icon: BookMarked, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  anti_ragging: { label: "Anti-Ragging", icon: Shield, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  discipline: { label: "Discipline", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  safety: { label: "Safety", icon: AlertCircle, color: "bg-orange-600/10 text-orange-300 border-orange-500/20" },
  other: { label: "Other", icon: MessageSquare, color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-500/10 text-slate-400" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-400" },
  { value: "high", label: "High", color: "bg-orange-500/10 text-orange-400" },
  { value: "urgent", label: "Urgent", color: "bg-red-500/10 text-red-400" },
] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  assigned: { label: "Assigned", icon: AlertCircle, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  escalated: { label: "Escalated", icon: AlertTriangle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const URGENCY_KEYWORDS = [
  "electrical fault", "water leak", "fire hazard", "gas leak",
  "collapsed", "injury", "accident", "emergency", "flood",
  "short circuit", "exposed wire", "broken glass", "chemical",
  "harassment", "assault", "threat", "violence", "ragging",
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formDepartment, setFormDepartment] = useState("");
  const [formDepartmentName, setFormDepartmentName] = useState("");
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [formAttachmentUrl, setFormAttachmentUrl] = useState("");
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoDetectedPriority, setAutoDetectedPriority] = useState<string | null>(null);

  const submitComplaint = useMutation(api.complaints.submit);
  const complaints = useQuery(api.complaints.list);
  const stats = useQuery(api.complaints.stats);
  const announcements = useQuery(api.announcements.list);
  const upcomingAppointments = useQuery(api.appointments.upcoming);
  const departments = useQuery(api.departments.list);
  const seedDepartments = useMutation(api.departments.seed);

  useEffect(() => { seedDepartments(); }, [seedDepartments]);

  const userComplaints = useMemo(() => {
    if (!complaints || !user) return [];
    return complaints.filter((c) => c.userId === user._id);
  }, [complaints, user]);

  const filteredComplaints = useMemo(() => {
    if (!userComplaints) return [];
    return userComplaints.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [userComplaints, filterStatus, filterCategory, searchQuery]);

  useEffect(() => {
    const text = (formTitle + " " + formDescription).toLowerCase();
    const found = URGENCY_KEYWORDS.find((kw) => text.includes(kw));
    if (found) { setAutoDetectedPriority("urgent"); setFormPriority("urgent"); }
    else if (text.includes("important") || text.includes("serious") || text.includes("damage")) { setAutoDetectedPriority("high"); setFormPriority("high"); }
    else { setAutoDetectedPriority(null); }
  }, [formTitle, formDescription]);

  const resetForm = () => {
    setFormTitle(""); setFormDescription(""); setFormCategory(""); setFormPriority("medium");
    setFormDepartment(""); setFormDepartmentName(""); setFormIsAnonymous(false);
    setFormAttachments([]); setFormAttachmentUrl(""); setAutoDetectedPriority(null);
  };

  const addAttachment = () => {
    if (formAttachmentUrl.trim()) {
      setFormAttachments([...formAttachments, formAttachmentUrl.trim()]);
      setFormAttachmentUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formCategory) { toast.error("Please fill in all required fields"); return; }
    setIsSubmitting(true);
    try {
      await submitComplaint({
        title: formTitle, description: formDescription, category: formCategory as any,
        priority: formPriority as any, departmentId: formDepartment || undefined,
        departmentName: formDepartmentName || undefined, isAnonymous: formIsAnonymous,
        attachmentUrls: formAttachments.length > 0 ? formAttachments : undefined,
        userId: user?._id ?? "", userName: user?.name || user?.email || "Anonymous",
        userRole: (user?.role as any) || "student",
      });
      toast.success(formIsAnonymous ? "Anonymous complaint submitted!" : "Complaint submitted!", {
        description: formIsAnonymous ? "Your identity is hidden." : "Your grievance has been registered.",
      });
      resetForm(); setShowForm(false);
    } catch { toast.error("Failed to submit complaint."); } finally { setIsSubmitting(false); }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const getCategoryInfo = (cat: string) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
  const getPriorityInfo = (p: string) => PRIORITIES.find((pr) => pr.value === p) || PRIORITIES[0];
  const getStatusInfo = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
            <span className="font-semibold hidden sm:inline">SpeakUp Campus</span>
          </div>
          <div className="flex items-center gap-2">
            {(user?.role === "faculty" || user?.role === "admin") && (
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate("/faculty")}><FileText className="size-3.5" />Faculty</Button>
            )}
            {user?.role === "admin" && (
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate("/admin")}><Settings className="size-3.5" />Admin</Button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => signOut()}><LogOut className="size-3.5" /><span className="hidden sm:inline">Sign out</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            {[
              { label: "My Complaints", value: userComplaints.length, icon: FileText, color: "text-primary" },
              { label: "Pending", value: userComplaints.filter((c) => c.status === "pending").length, icon: Clock, color: "text-amber-400" },
              { label: "In Progress", value: userComplaints.filter((c) => c.status === "in_progress" || c.status === "assigned").length, icon: AlertCircle, color: "text-blue-400" },
              { label: "Resolved", value: userComplaints.filter((c) => c.status === "resolved").length, icon: CheckCircle2, color: "text-emerald-400" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/60"><CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold mt-1">{stat.value}</p></div>
                  <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${stat.color}`}><stat.icon className="size-5" /></div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div><h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
                <p className="text-sm text-muted-foreground mt-1">{userComplaints.length} complaint{userComplaints.length !== 1 ? "s" : ""} submitted</p></div>
              <Button onClick={() => setShowForm(true)} className="gap-2"><Plus className="size-4" />New Complaint</Button>
            </div>

            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search complaints..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
              <div className="flex items-center gap-2"><Filter className="size-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Categories</SelectItem>{Object.entries(CATEGORY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredComplaints.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center">
                    <FileText className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">{userComplaints.length === 0 ? "No complaints yet" : "No complaints match your filters"}</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">{userComplaints.length === 0 ? "Click \"New Complaint\" to submit your first grievance" : "Try adjusting your search or filters"}</p>
                    {userComplaints.length === 0 && <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4 gap-2"><Plus className="size-4" />Submit First Complaint</Button>}
                  </motion.div>
                ) : filteredComplaints.map((complaint, i) => {
                  const catInfo = getCategoryInfo(complaint.category); const priInfo = getPriorityInfo(complaint.priority);
                  const statusCfg = getStatusInfo(complaint.status); const StatusIcon = statusCfg.icon;
                  return (
                    <motion.div key={complaint._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.03 }}>
                      <Card className="border-border/60 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md group" onClick={() => navigate(`/complaint/${complaint._id}`)}>
                        <CardContent className="p-5"><div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant="secondary" className={`${catInfo.color} border text-xs font-medium`}><catInfo.icon className="size-3 mr-1" />{catInfo.label}</Badge>
                            <Badge variant="secondary" className={`${priInfo.color} text-xs font-medium`}>{priInfo.label}</Badge>
                            <Badge variant="secondary" className={`${statusCfg.color} border text-xs font-medium`}><StatusIcon className="size-3 mr-1" />{statusCfg.label}</Badge>
                            {complaint.isAnonymous && <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 text-xs">Anonymous</Badge>}
                          </div>
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{complaint.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-2">
                            <p className="text-xs text-muted-foreground">{formatDate(complaint.createdAt)}</p>
                            <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </div>
                        </div></CardContent>
                      </Card>
                    </motion.div>);
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60"><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="size-4 text-primary" />Upcoming Appointments</CardTitle></CardHeader>
              <CardContent>{upcomingAppointments && upcomingAppointments.length > 0 ? <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt) => (<div key={apt._id} className="rounded-lg border border-border/60 p-3 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/complaint/${apt.complaintId}`)}>
                  <p className="text-sm font-medium truncate">{apt.complaintTitle}</p><div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><CalendarDays className="size-3" />{apt.scheduledFor} at {apt.scheduledTime}</div>
                </div>))}</div> : <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>}</CardContent></Card>

            <Card className="border-border/60"><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><MessageCircle className="size-4 text-primary" />Announcements</CardTitle></CardHeader>
              <CardContent>{announcements && announcements.length > 0 ? <div className="space-y-3">
                {announcements.slice(0, 4).map((ann) => (<div key={ann._id} className={`rounded-lg border p-3 ${ann.priority === "urgent" ? "border-red-500/30 bg-red-500/5" : ann.priority === "important" ? "border-amber-500/30 bg-amber-500/5" : "border-border/60"}`}>
                  <p className="text-sm font-medium">{ann.title}</p><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                </div>))}</div> : <p className="text-sm text-muted-foreground text-center py-4">No announcements</p>}</CardContent></Card>
          </div>
        </div>
      </div>

      {/* Submit Complaint Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">Submit a Complaint</DialogTitle><DialogDescription>Fill in the details below. Fields marked with * are required.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-3"><Shield className="size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Submit Anonymously</p><p className="text-xs text-muted-foreground">Your identity will be hidden from administrators</p></div></div>
              <Switch checked={formIsAnonymous} onCheckedChange={setFormIsAnonymous} />
            </div>

            <div className="space-y-2"><Label htmlFor="title">Complaint Title <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="Brief title describing your grievance" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
              {autoDetectedPriority && <p className="text-xs text-amber-400 flex items-center gap-1 mt-1"><AlertTriangle className="size-3" />Priority auto-set to <span className="font-semibold capitalize">{autoDetectedPriority}</span> based on urgency keywords</p>}
            </div>

            <div className="space-y-2"><Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" placeholder="Provide a detailed description of your complaint..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={4} required /></div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category <span className="text-destructive">*</span></Label>
                <Select value={formCategory} onValueChange={setFormCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{Object.entries(CATEGORY_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Department (optional)</Label>
                <Select value={formDepartment} onValueChange={(val) => { setFormDepartment(val); const dept = departments?.find((d) => d._id === val); setFormDepartmentName(dept?.name || ""); }}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{(departments || []).map((dept) => (<SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>))}</SelectContent></Select></div>
            </div>

            <div className="space-y-2"><Label>Priority</Label>
              <Select value={formPriority} onValueChange={setFormPriority}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((pri) => (<SelectItem key={pri.value} value={pri.value}>{pri.label}</SelectItem>))}</SelectContent></Select></div>

            <div className="space-y-2"><Label>Attachments (optional)</Label>
              <div className="flex gap-2"><Input placeholder="Paste image/document URL" value={formAttachmentUrl} onChange={(e) => setFormAttachmentUrl(e.target.value)} className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={addAttachment}><Upload className="size-4" /></Button></div>
              {formAttachments.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{formAttachments.map((url, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate max-w-[150px]">Attachment {i + 1}</a>
                  <button type="button" onClick={() => setFormAttachments(formAttachments.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive"><X className="size-3" /></button>
                </div>))}</div>}
            </div>

            <Separator />
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Submit Complaint</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
