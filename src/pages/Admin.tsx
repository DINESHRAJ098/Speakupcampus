import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Settings, Users,
  Loader2, Search, Filter, ChevronRight, Megaphone, BookOpen, Building2, AlertTriangle,
  MessageSquare, Shield, Check, UserPlus, BarChart3, LayoutDashboard,
  CalendarDays, TrendingUp, Activity,
} from "lucide-react";

const CATEGORIES: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  academic: { label: "Academics", icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  hostel: { label: "Hostel", icon: Building2, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  mess: { label: "Mess", icon: AlertCircle, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  it: { label: "IT", icon: AlertCircle, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  infrastructure: { label: "Infrastructure", icon: Building2, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  library: { label: "Library", icon: BookOpen, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
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

type AdminTab = "overview" | "complaints" | "users" | "faculty" | "departments" | "announcements" | "reports";

const SIDEBAR_ITEMS: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "complaints", label: "Complaints", icon: FileText },
  { key: "users", label: "Users", icon: Users },
  { key: "faculty", label: "Faculty Access", icon: Shield },
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const overview = useQuery(api.admin.systemOverview);
  const complaints = useQuery(api.complaints.list);
  const allUsers = useQuery(api.admin.allUsers);
  const facultyList = useQuery(api.admin.getFacultyWithDepartments);
  const departments = useQuery(api.departments.list);
  const announcements = useQuery(api.announcements.list);
  const monthlyReport = useQuery(api.admin.monthlyReport);

  const updateStatus = useMutation(api.complaints.updateStatus);
  const assignComplaint = useMutation(api.complaints.assign);
  const resolveComplaint = useMutation(api.complaints.resolve);
  const createAnnouncement = useMutation(api.announcements.create);
  const deleteAnnouncement = useMutation(api.announcements.remove);
  const changeUserRole = useMutation(api.admin.changeUserRole);
  const grantFacultyAccess = useMutation(api.admin.grantFacultyAccess);
  const revokeFacultyAccess = useMutation(api.admin.revokeFacultyAccess);
  const autoEscalate = useMutation(api.complaints.autoEscalate);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [resolveText, setResolveText] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [grantDeptUser, setGrantDeptUser] = useState("");
  const [grantDeptName, setGrantDeptName] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("normal");

  const filteredComplaints = (complaints || []).filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedData = complaints?.find((c) => c._id === selectedComplaint);
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatMs = (ms: number) => { const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  const handleStatusUpdate = async (complaintId: string, status: string) => {
    setIsProcessing(true);
    try { await updateStatus({ complaintId: complaintId as any, status: status as any }); toast.success("Status updated"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolveText.trim()) return;
    setIsProcessing(true);
    try { await resolveComplaint({ complaintId: selectedComplaint as any, resolution: resolveText.trim() }); setResolveText(""); toast.success("Resolved"); setSelectedComplaint(null); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleAssign = async () => {
    if (!selectedComplaint || !assignTo) return;
    const member = (allUsers || []).find((u) => u._id === assignTo);
    if (!member) return;
    setIsProcessing(true);
    try { await assignComplaint({ complaintId: selectedComplaint as any, assignedTo: assignTo, assignedToName: member.name || member.email || "Staff" }); setAssignTo(""); toast.success("Assigned"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleGrantFaculty = async () => {
    if (!grantDeptUser || !grantDeptName) return;
    setIsProcessing(true);
    try {
      const dept = departments?.find((d) => d.name === grantDeptName);
      await grantFacultyAccess({ userId: grantDeptUser as any, department: dept?._id || grantDeptName });
      toast.success("Faculty access granted"); setGrantDeptUser(""); setGrantDeptName("");
    } catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleRevokeFaculty = async (userId: string) => {
    setIsProcessing(true);
    try { await revokeFacultyAccess({ userId: userId as any }); toast.success("Access revoked"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsProcessing(true);
    try { await changeUserRole({ userId: userId as any, newRole: newRole as any }); toast.success("Role updated"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    setIsProcessing(true);
    try { await createAnnouncement({ title: annTitle, content: annContent, authorId: user?._id ?? "", authorName: user?.name || "Admin", priority: annPriority as any }); setAnnTitle(""); setAnnContent(""); setAnnPriority("normal"); toast.success("Posted"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleAutoEscalate = async () => {
    setIsProcessing(true);
    try { const result = await autoEscalate(); toast.success(`Escalated ${result.escalatedCount} complaint(s)`); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  if (user?.role !== "admin") {
    return (<main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><Shield className="mx-auto size-12 text-muted-foreground/40 mb-4" /><h2 className="text-xl font-bold">Access Denied</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button></div></main>);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-card flex flex-col fixed h-full">
        <div className="p-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
            <div><p className="font-semibold text-sm">SpeakUp Campus</p><p className="text-[10px] text-muted-foreground">Admin Panel</p></div>
          </div>
        </div>
        <ScrollArea className="flex-1 py-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${activeTab === item.key ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className="size-4" />{item.label}
              {item.key === "complaints" && complaints && <Badge variant="secondary" className="ml-auto text-[10px]">{complaints.length}</Badge>}
              {item.key === "users" && allUsers && <Badge variant="secondary" className="ml-auto text-[10px]">{allUsers.length}</Badge>}
            </button>
          ))}
        </ScrollArea>
        <div className="p-4 border-t border-border/60">
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
          {/* OVERVIEW */}
          {activeTab === "overview" && overview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-primary" },
                  { label: "Complaints", value: overview.totalComplaints, icon: FileText, color: "text-blue-400" },
                  { label: "Pending", value: overview.pendingComplaints, icon: Clock, color: "text-amber-400" },
                  { label: "Resolved", value: overview.resolvedComplaints, icon: CheckCircle2, color: "text-emerald-400" },
                ].map((s) => (<Card key={s.label} className="border-border/60"><CardContent className="p-4">
                  <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                    <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${s.color}`}><s.icon className="size-5" /></div></div>
                </CardContent></Card>))}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "In Progress", value: overview.inProgressComplaints, icon: Activity, color: "text-blue-400" },
                  { label: "Escalated", value: overview.escalatedComplaints, icon: AlertTriangle, color: "text-red-400" },
                  { label: "Faculty", value: overview.faculty, icon: Shield, color: "text-amber-400" },
                  { label: "Departments", value: overview.totalDepartments, icon: Building2, color: "text-purple-400" },
                ].map((s) => (<Card key={s.label} className="border-border/60"><CardContent className="p-4">
                  <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                    <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${s.color}`}><s.icon className="size-5" /></div></div>
                </CardContent></Card>))}
              </div>

              {/* Department Breakdown */}
              {overview.departmentStats && overview.departmentStats.length > 0 && (
                <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold">Department Breakdown</CardTitle></CardHeader>
                  <CardContent><div className="space-y-3">{overview.departmentStats.map((d) => (
                    <div key={d.departmentId} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                      <div className="flex items-center gap-3"><Building2 className="size-4 text-muted-foreground" /><span className="text-sm font-medium">{d.departmentName}</span></div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">{d.total} total</span>
                        <span className="text-amber-400">{d.pending} open</span>
                        <span className="text-emerald-400">{d.resolved} resolved</span>
                      </div>
                    </div>))}</div></CardContent></Card>
              )}

              {overview.avgResolutionTimeMs > 0 && (
                <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-4">
                  <TrendingUp className="size-5 text-primary" /><div><p className="text-sm text-muted-foreground">Average Resolution Time</p><p className="text-xl font-bold">{formatMs(overview.avgResolutionTimeMs)}</p></div>
                </CardContent></Card>
              )}
            </div>
          )}

          {/* COMPLAINTS */}
          {activeTab === "complaints" && (
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
                {filteredComplaints.map((c) => {
                  const cat = CATEGORIES[c.category] || CATEGORIES.other;
                  const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                  return (
                    <Card key={c._id} className="border-border/60 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setSelectedComplaint(c._id)}>
                      <CardContent className="p-4"><div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="secondary" className={`${cat.color} border text-[10px]`}>{<cat.icon className="size-2.5 mr-1" />}{cat.label}</Badge>
                          <Badge variant="secondary" className={`${st.color} border text-[10px]`}>{<st.icon className="size-2.5 mr-1" />}{st.label}</Badge>
                          {c.assignedToName && <Badge variant="secondary" className="text-[10px]">→ {c.assignedToName}</Badge>}
                          {c.isAnonymous && <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 text-[10px]">Anon</Badge>}
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

          {/* USERS */}
          {activeTab === "users" && (
            <div className="space-y-3">
              {(allUsers || []).filter((u) => !u.isAnonymous).map((u) => (
                <div key={u._id} className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{(u.name || u.email || "?").charAt(0).toUpperCase()}</div>
                    <div><p className="text-sm font-medium">{u.name || "Unnamed"}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.department && <Badge variant="secondary" className="text-[10px]"><Building2 className="size-2.5 mr-1" />{u.department}</Badge>}
                    <Select value={u.role || "student"} onValueChange={(role) => handleRoleChange(u._id, role)} disabled={isProcessing}>
                      <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="staff">Staff</SelectItem><SelectItem value="faculty">Faculty</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FACULTY ACCESS */}
          {activeTab === "faculty" && (
            <div className="space-y-6">
              <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Check className="size-4 text-emerald-400" />Grant Faculty Access</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">Promote a user to Faculty and assign them to a department.</p>
                  <div className="flex gap-2">
                    <Select value={grantDeptUser} onValueChange={setGrantDeptUser}><SelectTrigger className="flex-1"><SelectValue placeholder="Select user" /></SelectTrigger>
                      <SelectContent>{(allUsers || []).filter((u) => u.role !== "faculty" && u.role !== "admin" && !u.isAnonymous).map((u) => (
                        <SelectItem key={u._id} value={u._id}>{u.name || u.email} ({u.role})</SelectItem>))}</SelectContent></Select>
                    <Select value={grantDeptName} onValueChange={setGrantDeptName}><SelectTrigger className="flex-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>{(departments || []).map((d) => (<SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>))}</SelectContent></Select>
                    <Button disabled={!grantDeptUser || !grantDeptName || isProcessing} onClick={handleGrantFaculty} className="gap-1.5"><Check className="size-3.5" />Grant</Button>
                  </div>
                </CardContent></Card>

              <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="size-4 text-primary" />Current Faculty ({facultyList?.length || 0})</CardTitle></CardHeader>
                <CardContent>{facultyList && facultyList.length > 0 ? <div className="space-y-2">{facultyList.map((f) => {
                  const dept = departments?.find((d) => d._id === f.department);
                  return (<div key={f._id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">{f.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.email}</p></div></div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-xs">{<Building2 className="size-3 mr-1" />}{dept?.name || "Unassigned"}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive text-xs" disabled={isProcessing} onClick={() => handleRevokeFaculty(f._id)}>Revoke</Button>
                    </div></div>);
                })}</div> : <p className="text-sm text-muted-foreground text-center py-4">No faculty members yet.</p>}</CardContent></Card>
            </div>
          )}

          {/* DEPARTMENTS */}
          {activeTab === "departments" && (
            <div className="space-y-4">
              {(departments || []).map((dept) => {
                const deptComplaints = (complaints || []).filter((c) => c.departmentId === dept._id);
                const open = deptComplaints.filter((c) => c.status !== "resolved" && c.status !== "rejected").length;
                const resolved = deptComplaints.filter((c) => c.status === "resolved").length;
                return (
                  <Card key={dept._id} className="border-border/60"><CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Building2 className="size-5 text-primary" /><div><p className="font-medium">{dept.name}</p><p className="text-xs text-muted-foreground">{dept.description}</p></div></div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">{deptComplaints.length} total</span>
                        <span className="text-amber-400">{open} open</span>
                        <span className="text-emerald-400">{resolved} resolved</span>
                      </div></div>
                  </CardContent></Card>);
              })}
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <form onSubmit={handleAnnouncement} className="rounded-lg border border-border/60 p-4 space-y-3">
                <h4 className="text-sm font-semibold">New Announcement</h4>
                <Input placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                <Textarea placeholder="Content..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} rows={3} required />
                <div className="flex items-center gap-3">
                  <Select value={annPriority} onValueChange={setAnnPriority}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="important">Important</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
                  <Button type="submit" size="sm" disabled={!annTitle || !annContent || isProcessing} className="gap-1.5"><Megaphone className="size-3.5" />Post</Button>
                </div>
              </form>
              <Separator />
              <div className="space-y-2">
                {(announcements || []).map((ann) => (
                  <div key={ann._id} className={`rounded-lg border p-4 ${ann.priority === "urgent" ? "border-red-500/30 bg-red-500/5" : ann.priority === "important" ? "border-amber-500/30 bg-amber-500/5" : "border-border/60"}`}>
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium">{ann.title}</p><p className="text-xs text-muted-foreground mt-1">{ann.content}</p></div>
                      <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={async () => { await deleteAnnouncement({ announcementId: ann._id }); toast.success("Deleted"); }}>Delete</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{formatDate(ann.createdAt)} · {ann.authorName} · {ann.priority}</p>
                  </div>))}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && monthlyReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Monthly Grievance Report</h3><p className="text-sm text-muted-foreground">{monthlyReport.period}</p></div>
                <Button size="sm" variant="outline" className="gap-1.5" disabled={isProcessing} onClick={handleAutoEscalate}><AlertTriangle className="size-3.5" />Run Auto-Escalation</Button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Filed", value: monthlyReport.totalFiled, color: "text-primary" },
                  { label: "Resolved", value: monthlyReport.totalResolved, color: "text-emerald-400" },
                  { label: "Escalated", value: monthlyReport.totalEscalated, color: "text-red-400" },
                  { label: "Resolution Rate", value: `${monthlyReport.resolutionRate}%`, color: "text-blue-400" },
                ].map((s) => (<Card key={s.label} className="border-border/60"><CardContent className="p-4"><p className="text-sm text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></CardContent></Card>))}
              </div>

              {monthlyReport.byDepartment.length > 0 && (
                <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold">By Department</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">{monthlyReport.byDepartment.map((d) => (
                    <div key={d.name} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                      <span className="text-sm font-medium">{d.name}</span>
                      <div className="flex items-center gap-3 text-xs"><span>{d.total} filed</span><span className="text-emerald-400">{d.resolved} resolved</span><span className="text-red-400">{d.escalated} escalated</span></div>
                    </div>))}</div></CardContent></Card>
              )}

              {Object.keys(monthlyReport.byCategory).length > 0 && (
                <Card className="border-border/60"><CardHeader><CardTitle className="text-sm font-semibold">By Category</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-3">{Object.entries(monthlyReport.byCategory).map(([cat, count]) => {
                    const info = CATEGORIES[cat] || CATEGORIES.other;
                    return (<Badge key={cat} variant="secondary" className={`${info.color} border text-xs`}>{<info.icon className="size-3 mr-1" />}{info.label}: {count}</Badge>);
                  })}</div></CardContent></Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Complaint Action Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) setSelectedComplaint(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedData ? (<>
            <DialogHeader><DialogTitle className="text-xl">{selectedData.title}</DialogTitle>
              <DialogDescription>By {selectedData.userName} · {formatDate(selectedData.createdAt)}</DialogDescription></DialogHeader>
            <div className="space-y-4 mt-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{selectedData.description}</p><Separator />
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Update Status</Label>
                <div className="flex flex-wrap gap-2">{Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <Button key={key} variant={selectedData.status === key ? "default" : "outline"} size="sm" className="gap-1.5" disabled={isProcessing || selectedData.status === key}
                    onClick={() => handleStatusUpdate(selectedData._id, key)}>{<val.icon className="size-3" />}{val.label}</Button>
                ))}</div></div><Separator />
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Assign To</Label>
                <div className="flex gap-2">
                  <Select value={assignTo} onValueChange={setAssignTo}><SelectTrigger className="flex-1"><SelectValue placeholder="Select faculty / staff" /></SelectTrigger>
                    <SelectContent>{(allUsers || []).filter((u) => (u.role === "faculty" || u.role === "admin") && !u.isAnonymous).map((u) => (
                      <SelectItem key={u._id} value={u._id}>{u.name || u.email} ({u.role})</SelectItem>))}</SelectContent></Select>
                  <Button size="sm" disabled={!assignTo || isProcessing} onClick={handleAssign} className="gap-1.5"><UserPlus className="size-3.5" />Assign</Button>
                </div></div><Separator />
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Resolution Notes</Label>
                <Textarea placeholder="How this grievance was resolved..." value={resolveText} onChange={(e) => setResolveText(e.target.value)} rows={3} />
                <Button className="mt-2 gap-1.5" disabled={!resolveText.trim() || isProcessing} onClick={handleResolve}>
                  {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}Mark as Resolved</Button></div>
            </div>
          </>) : <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin" /></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
