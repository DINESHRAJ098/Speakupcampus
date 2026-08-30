import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Settings, Loader2,
  Search, Filter, ChevronRight, BookOpen, Building2, AlertTriangle, MessageSquare,
  Shield, MessageCircle, Check, Users, LayoutDashboard, BarChart3, Activity, BedDouble,
  UtensilsCrossed, Wifi, BookMarked,
} from "lucide-react";

const CATEGORIES: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  academic: { label: "Academics", icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  hostel: { label: "Hostel", icon: BedDouble, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  mess: { label: "Mess", icon: UtensilsCrossed, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  it: { label: "IT", icon: Wifi, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  infrastructure: { label: "Infrastructure", icon: Building2, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  library: { label: "Library", icon: BookMarked, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  anti_ragging: { label: "Anti-Ragging", icon: Shield, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  discipline: { label: "Discipline", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  safety: { label: "Safety", icon: AlertCircle, color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  other: { label: "Other", icon: MessageSquare, color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  in_progress: { label: "In Progress", icon: AlertCircle, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  assigned: { label: "Assigned", icon: AlertCircle, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  escalated: { label: "Escalated", icon: AlertTriangle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const PRIORITIES: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-500/10 text-slate-400" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-400" },
  high: { label: "High", color: "bg-orange-500/10 text-orange-400" },
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-400" },
};

type FacultyTab = "dashboard" | "department" | "assigned" | "resolved";

const SIDEBAR_ITEMS: { key: FacultyTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "department", label: "Department Complaints", icon: Building2 },
  { key: "assigned", label: "My Assignments", icon: FileText },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
];

export default function Faculty() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FacultyTab>("dashboard");

  const userDepartment = user?.department;
  const departments = useQuery(api.departments.list);
  const deptName = departments?.find((d) => d._id === userDepartment)?.name || userDepartment;

  // All complaints in department
  const departmentComplaints = useQuery(api.complaints.listAllByDepartment, userDepartment ? { departmentId: userDepartment } : "skip");
  // Complaints assigned to this faculty
  const myAssigned = useQuery(api.complaints.listByAssigned, user?._id ? { userId: user._id } : "skip");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [resolveText, setResolveText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const resolveComplaint = useMutation(api.complaints.resolve);
  const updateStatus = useMutation(api.complaints.updateStatus);
  const assignComplaint = useMutation(api.complaints.assign);
  const addComment = useMutation(api.comments.add);
  const allComments = useQuery(api.comments.listByComplaint, selectedComplaint ? { complaintId: selectedComplaint } : "skip");
  const resolutionLogs = useQuery(api.resolutionLogs.listByComplaint, selectedComplaint ? { complaintId: selectedComplaint } : "skip");

  // Get the right list based on active tab
  const getSourceList = () => {
    if (activeTab === "assigned") return myAssigned || [];
    if (activeTab === "resolved") return (departmentComplaints || []).filter((c) => c.status === "resolved" || c.status === "rejected");
    return departmentComplaints || [];
  };

  const sourceList = getSourceList();
  const filtered = sourceList.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedData = sourceList.find((c) => c._id === selectedComplaint);
  const complaintComments = allComments || [];
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleResolve = async () => {
    if (!selectedComplaint || !resolveText.trim()) return;
    setIsProcessing(true);
    try { await resolveComplaint({ complaintId: selectedComplaint as any, resolution: resolveText.trim() }); setResolveText(""); toast.success("Resolved"); setSelectedComplaint(null); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedComplaint) return;
    setIsProcessing(true);
    try { await updateStatus({ complaintId: selectedComplaint as any, status: status as any }); toast.success("Updated"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleAssignToMe = async () => {
    if (!selectedComplaint || !user?._id) return;
    setIsProcessing(true);
    try { await assignComplaint({ complaintId: selectedComplaint as any, assignedTo: user._id, assignedToName: user.name || user.email || "Faculty" }); toast.success("Assigned to you"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedComplaint) return;
    setIsProcessing(true);
    try { await addComment({ complaintId: selectedComplaint, userId: user?._id ?? "", userName: user?.name || "Faculty", userRole: "faculty", content: commentText.trim() }); setCommentText(""); toast.success("Posted"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  // No department assigned
  if (!userDepartment) {
    return (<main className="min-h-screen bg-background flex items-center justify-center"><div className="text-center max-w-md mx-auto px-6">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6"><Building2 className="size-8" /></div>
      <h2 className="text-2xl font-bold">Department Not Assigned</h2>
      <p className="text-muted-foreground mt-3">An administrator needs to assign you to a department.</p>
      <Button variant="outline" className="mt-6" onClick={() => navigate("/dashboard")}><ArrowLeft className="size-4 mr-2" />Back to Dashboard</Button></div></main>);
  }

  // Stats
  const total = departmentComplaints?.length || 0;
  const open = departmentComplaints?.filter((c) => c.status !== "resolved" && c.status !== "rejected").length || 0;
  const resolved = departmentComplaints?.filter((c) => c.status === "resolved").length || 0;
  const escalated = departmentComplaints?.filter((c) => c.status === "escalated").length || 0;
  const myCount = myAssigned?.length || 0;
  const myOpen = myAssigned?.filter((c) => c.status !== "resolved" && c.status !== "rejected").length || 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-card flex flex-col fixed h-full">
        <div className="p-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
            <div><p className="font-semibold text-sm">SpeakUp Campus</p><p className="text-[10px] text-muted-foreground">Faculty Panel</p></div>
          </div>
        </div>
        <ScrollArea className="flex-1 py-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === item.key ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className="size-4" />{item.label}
              {item.key === "assigned" && myCount > 0 && <Badge variant="secondary" className="ml-auto text-[10px]">{myCount}</Badge>}
              {item.key === "department" && total > 0 && <Badge variant="secondary" className="ml-auto text-[10px]">{total}</Badge>}
            </button>
          ))}
        </ScrollArea>
        <div className="p-4 border-t border-border/60">
          <div className="flex items-center gap-2 mb-2"><Building2 className="size-3.5 text-primary" /><span className="text-xs font-medium">{deptName}</span></div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{user?.name || user?.email}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => signOut()}>Sign out</Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl px-6 py-3">
          <h1 className="text-lg font-semibold">{SIDEBAR_ITEMS.find((i) => i.key === activeTab)?.label}</h1>
        </header>

        <div className="p-6">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Department Total", value: total, icon: FileText, color: "text-primary" },
                  { label: "Open", value: open, icon: Clock, color: "text-amber-400" },
                  { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "Escalated", value: escalated, icon: AlertTriangle, color: "text-red-400" },
                ].map((s) => (<Card key={s.label} className="border-border/60"><CardContent className="p-4">
                  <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                    <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${s.color}`}><s.icon className="size-5" /></div></div>
                </CardContent></Card>))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border/60"><CardContent className="p-4">
                  <div className="flex items-center gap-3"><Users className="size-5 text-primary" /><div><p className="text-sm text-muted-foreground">My Assignments</p><p className="text-xl font-bold">{myCount} <span className="text-sm font-normal text-muted-foreground">({myOpen} open)</span></p></div></div>
                </CardContent></Card>
                <Card className="border-border/60"><CardContent className="p-4">
                  <div className="flex items-center gap-3"><Activity className="size-5 text-emerald-400" /><div><p className="text-sm text-muted-foreground">Resolution Rate</p><p className="text-xl font-bold">{total > 0 ? Math.round((resolved / total) * 100) : 0}%</p></div></div>
                </CardContent></Card>
              </div>

              {/* Category breakdown */}
              {departmentComplaints && departmentComplaints.length > 0 && (
                <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold">By Category</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{Object.entries(CATEGORIES).map(([key, info]) => {
                    const count = departmentComplaints.filter((c) => c.category === key).length;
                    if (count === 0) return null;
                    return <Badge key={key} variant="secondary" className={`${info.color} border text-xs`}>{<info.icon className="size-3 mr-1" />}{info.label}: {count}</Badge>;
                  })}</div></CardContent></Card>
              )}
            </div>
          )}

          {/* DEPARTMENT / ASSIGNED / RESOLVED */}
          {(activeTab === "department" || activeTab === "assigned" || activeTab === "resolved") && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Categories</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
                </div>
              </div>

              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-12 text-center">
                    <FileText className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No complaints found</p></div>
                ) : filtered.map((c) => {
                  const cat = CATEGORIES[c.category] || CATEGORIES.other;
                  const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                  const pri = PRIORITIES[c.priority] || PRIORITIES.low;
                  return (
                    <Card key={c._id} className="border-border/60 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setSelectedComplaint(c._id)}>
                      <CardContent className="p-4"><div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="secondary" className={`${cat.color} border text-[10px]`}>{<cat.icon className="size-2.5 mr-1" />}{cat.label}</Badge>
                          <Badge variant="secondary" className={`${pri.color} text-[10px]`}>{pri.label}</Badge>
                          <Badge variant="secondary" className={`${st.color} border text-[10px]`}>{<st.icon className="size-2.5 mr-1" />}{st.label}</Badge>
                          {c.assignedToName && <Badge variant="secondary" className="text-[10px]">→ {c.assignedToName}</Badge>}
                        </div>
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.userName} · {formatDate(c.createdAt)}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
                      </div></CardContent>
                    </Card>);
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) { setSelectedComplaint(null); setResolveText(""); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedData ? (<>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={`${(CATEGORIES[selectedData.category] || CATEGORIES.other).color} border text-xs font-medium`}>{(CATEGORIES[selectedData.category] || CATEGORIES.other).label}</Badge>
                <Badge variant="secondary" className={`${(STATUS_CONFIG[selectedData.status] || STATUS_CONFIG.pending).color} border text-xs font-medium`}>{(STATUS_CONFIG[selectedData.status] || STATUS_CONFIG.pending).label}</Badge>
              </div>
              <DialogTitle className="text-xl">{selectedData.title}</DialogTitle>
              <DialogDescription>By {selectedData.userName} · {formatDate(selectedData.createdAt)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{selectedData.description}</p>
              <Separator />

              <div className="flex flex-wrap gap-2">
                {!selectedData.assignedTo && selectedData.status !== "resolved" && (
                  <Button size="sm" variant="outline" className="gap-1.5" disabled={isProcessing} onClick={handleAssignToMe}><Check className="size-3.5" />Assign to Me</Button>
                )}
              </div>

              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Update Status</Label>
                <div className="flex flex-wrap gap-2">{Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <Button key={key} variant={selectedData.status === key ? "default" : "outline"} size="sm" className="gap-1.5" disabled={isProcessing || selectedData.status === key}
                    onClick={() => handleStatusUpdate(key)}>{<val.icon className="size-3" />}{val.label}</Button>
                ))}</div></div><Separator />

              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Resolution Notes</Label>
                <Textarea placeholder="Describe how this grievance was resolved..." value={resolveText} onChange={(e) => setResolveText(e.target.value)} rows={3} />
                <Button className="mt-2 gap-1.5" disabled={!resolveText.trim() || isProcessing} onClick={handleResolve}>
                  {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}Mark as Resolved</Button></div>

              {selectedData.resolution && (<><Separator />
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <Label className="text-xs text-emerald-400 uppercase tracking-wider">Resolution</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedData.resolution}</p></div></>)}

              {resolutionLogs && resolutionLogs.length > 0 && (<><Separator />
                <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Timeline</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">{resolutionLogs.map((log) => (
                    <div key={log._id} className="text-xs flex items-center justify-between border border-border/60 rounded-lg p-2">
                      <span className="font-medium">{log.updatedByName}</span>
                      <span className="text-muted-foreground">{log.previousStatus || "—"} → {log.newStatus}</span>
                      <span className="text-muted-foreground">{formatDate(log.createdAt)}</span>
                    </div>))}</div></div></>)}

              <Separator />
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5"><MessageCircle className="size-3" />Discussion ({complaintComments.length})</Label>
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {complaintComments.length > 0 ? complaintComments.map((comment) => (
                    <div key={comment._id} className="rounded-lg border border-border/60 bg-card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2"><span className="text-xs font-medium">{comment.userName}</span>
                          {comment.userRole === "faculty" && <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-[9px]">Faculty</Badge>}</div>
                        <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span></div>
                      <p className="text-xs text-muted-foreground">{comment.content}</p></div>
                  )) : <p className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border/60 rounded-lg">No comments yet.</p>}
                </div>
                <form onSubmit={handleComment} className="flex gap-2">
                  <Input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1" />
                  <Button type="submit" size="icon" disabled={!commentText.trim() || isProcessing}>{isProcessing ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}</Button>
                </form></div>
            </div>
          </>) : <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin" /></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
