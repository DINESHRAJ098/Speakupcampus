import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  ArrowLeft, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Settings, Users,
  Loader2, Search, Filter, ChevronRight, Megaphone, BookOpen, Building2, AlertTriangle,
  MessageSquare, Shield, Check, UserPlus, Plus,
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

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const overview = useQuery(api.admin.systemOverview);
  const complaints = useQuery(api.complaints.list);
  const allUsers = useQuery(api.admin.allUsers);
  const facultyList = useQuery(api.admin.getFacultyWithDepartments);
  const departments = useQuery(api.departments.list);
  const announcements = useQuery(api.announcements.list);

  const updateStatus = useMutation(api.complaints.updateStatus);
  const assignComplaint = useMutation(api.complaints.assign);
  const resolveComplaint = useMutation(api.complaints.resolve);
  const createAnnouncement = useMutation(api.announcements.create);
  const changeUserRole = useMutation(api.admin.changeUserRole);
  const grantFacultyAccess = useMutation(api.admin.grantFacultyAccess);
  const revokeFacultyAccess = useMutation(api.admin.revokeFacultyAccess);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [resolveText, setResolveText] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("normal");

  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showFacultyManagement, setShowFacultyManagement] = useState(false);
  const [grantDeptUser, setGrantDeptUser] = useState("");
  const [grantDeptName, setGrantDeptName] = useState("");

  const filteredComplaints = (complaints || []).filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedData = complaints?.find((c) => c._id === selectedComplaint);
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
    const member = (facultyList || allUsers || []).find((u: any) => u._id === assignTo);
    if (!member) return;
    setIsProcessing(true);
    try { await assignComplaint({ complaintId: selectedComplaint as any, assignedTo: assignTo, assignedToName: member.name || member.email || "Staff" }); setAssignTo(""); toast.success("Assigned"); }
    catch { toast.error("Failed"); } finally { setIsProcessing(false); }
  };

  const handleAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    setIsProcessing(true);
    try { await createAnnouncement({ title: annTitle, content: annContent, authorId: user?._id ?? "", authorName: user?.name || user?.email || "Admin", priority: annPriority as any }); setAnnTitle(""); setAnnContent(""); setAnnPriority("normal"); setShowAnnouncementDialog(false); toast.success("Posted"); }
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

  if (user?.role !== "admin") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><Shield className="mx-auto size-12 text-muted-foreground/40 mb-4" /><h2 className="text-xl font-bold">Access Denied</h2><p className="text-muted-foreground mt-2">Admin privileges required.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}><ArrowLeft className="size-4" />Dashboard</Button>
            <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div><span className="font-semibold hidden sm:inline">SpeakUp Campus</span></div>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">Admin</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut()}>Sign out</Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {overview && (
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            {[
              { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-primary" },
              { label: "Complaints", value: overview.totalComplaints, icon: FileText, color: "text-blue-400" },
              { label: "Pending", value: overview.pendingComplaints, icon: Clock, color: "text-amber-400" },
              { label: "Resolved", value: overview.resolvedComplaints, icon: CheckCircle2, color: "text-emerald-400" },
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

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowFacultyManagement(true)} variant="outline" className="gap-2"><Building2 className="size-4" />Faculty Access</Button>
            <Button onClick={() => setShowUserManagement(true)} variant="outline" className="gap-2"><Users className="size-4" />Manage Users</Button>
            <Button onClick={() => setShowAnnouncementDialog(true)} variant="outline" className="gap-2"><Megaphone className="size-4" />Announcement</Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search all complaints..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <div className="flex items-center gap-2"><Filter className="size-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.entries(STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Categories</SelectItem>{Object.entries(CATEGORIES).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}</SelectContent></Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/40 mb-4" /><p className="text-lg font-medium text-muted-foreground">No complaints found</p></div>
          ) : filteredComplaints.map((complaint) => {
            const cat = CATEGORIES[complaint.category] || CATEGORIES.other;
            const statusCfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending;
            return (
              <Card key={complaint._id} className="border-border/60 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md group" onClick={() => setSelectedComplaint(complaint._id)}>
                <CardContent className="p-5"><div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="secondary" className={`${cat.color} border text-xs font-medium`}>{<cat.icon className="size-3 mr-1" />}{cat.label}</Badge>
                    <Badge variant="secondary" className={`${statusCfg.color} border text-xs font-medium`}>{<statusCfg.icon className="size-3 mr-1" />}{statusCfg.label}</Badge>
                    {complaint.assignedToName && <Badge variant="secondary" className="text-xs">→ {complaint.assignedToName}</Badge>}
                    {complaint.isAnonymous && <Badge variant="secondary" className="bg-slate-500/10 text-slate-400 text-xs">Anonymous</Badge>}
                  </div>
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{complaint.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">By {complaint.userName} · {formatDate(complaint.createdAt)}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-2" />
                </div></CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Complaint Action Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) setSelectedComplaint(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedData ? (
            <>
              <DialogHeader><DialogTitle className="text-xl">{selectedData.title}</DialogTitle>
                <DialogDescription>By {selectedData.userName} · {formatDate(selectedData.createdAt)}</DialogDescription></DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{selectedData.description}</p>
                <Separator />
                <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Update Status</Label>
                  <div className="flex flex-wrap gap-2">{Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <Button key={key} variant={selectedData.status === key ? "default" : "outline"} size="sm" className="gap-1.5" disabled={isProcessing || selectedData.status === key}
                      onClick={() => handleStatusUpdate(selectedData._id, key)}>{<val.icon className="size-3" />}{val.label}</Button>
                  ))}</div></div>
                <Separator />
                <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Assign To</Label>
                  <div className="flex gap-2">
                    <Select value={assignTo} onValueChange={setAssignTo}><SelectTrigger className="flex-1"><SelectValue placeholder="Select faculty / staff" /></SelectTrigger>
                      <SelectContent>{(allUsers || []).filter((u) => (u.role === "faculty" || u.role === "admin") && !u.isAnonymous).map((u) => (
                        <SelectItem key={u._id} value={u._id}>{u.name || u.email || "Unknown"} ({u.role})</SelectItem>
                      ))}</SelectContent></Select>
                    <Button size="sm" disabled={!assignTo || isProcessing} onClick={handleAssign} className="gap-1.5"><UserPlus className="size-3.5" />Assign</Button>
                  </div></div>
                <Separator />
                <div><Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Resolution Notes</Label>
                  <Textarea placeholder="How this grievance was resolved..." value={resolveText} onChange={(e) => setResolveText(e.target.value)} rows={3} />
                  <Button className="mt-2 gap-1.5" disabled={!resolveText.trim() || isProcessing} onClick={handleResolve}>
                    {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}Mark as Resolved</Button></div>
                {selectedData.resolution && (<><Separator />
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><Label className="text-xs text-emerald-400 uppercase tracking-wider">Resolution</Label><p className="text-sm mt-1 whitespace-pre-wrap">{selectedData.resolution}</p></div></>)}
              </div>
            </>
          ) : <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}
        </DialogContent>
      </Dialog>

      {/* Faculty Management Dialog */}
      <Dialog open={showFacultyManagement} onOpenChange={setShowFacultyManagement}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">Faculty Access Management</DialogTitle>
            <DialogDescription>Grant, revoke, or manage faculty department assignments.</DialogDescription></DialogHeader>

          <div className="rounded-lg border border-border/60 p-4 mt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Check className="size-4 text-emerald-400" />Grant Faculty Access</h4>
            <p className="text-xs text-muted-foreground mb-3">Promote a user to Faculty and assign them to a department. They will view and resolve all complaints in that department.</p>
            <div className="flex gap-2">
              <Select value={grantDeptUser} onValueChange={setGrantDeptUser}><SelectTrigger className="flex-1"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>{(allUsers || []).filter((u) => u.role !== "faculty" && u.role !== "admin" && !u.isAnonymous).map((u) => (
                  <SelectItem key={u._id} value={u._id}>{u.name || u.email || "Unknown"} ({u.role})</SelectItem>
                ))}</SelectContent></Select>
              <Select value={grantDeptName} onValueChange={setGrantDeptName}><SelectTrigger className="flex-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{(departments || []).map((d) => (<SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>))}</SelectContent></Select>
              <Button disabled={!grantDeptUser || !grantDeptName || isProcessing} onClick={handleGrantFaculty} className="gap-1.5"><Check className="size-3.5" />Grant</Button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Building2 className="size-4 text-primary" />Current Faculty</h4>
            {facultyList && facultyList.length > 0 ? (
              <div className="space-y-2">{facultyList.map((f) => {
                const dept = departments?.find((d) => d._id === f.department);
                return (
                  <div key={f._id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">{f.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.email}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-xs"><Building2 className="size-3 mr-1" />{dept?.name || f.department || "Unassigned"}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive text-xs" disabled={isProcessing} onClick={() => handleRevokeFaculty(f._id)}>Revoke</Button>
                    </div>
                  </div>);
              })}</div>
            ) : <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border/60 rounded-lg">No faculty members yet.</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl">Manage Users</DialogTitle><DialogDescription>Change user roles.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-4">
            {(allUsers || []).filter((u) => !u.isAnonymous).map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{(u.name || u.email || "?").charAt(0).toUpperCase()}</div>
                  <div><p className="text-sm font-medium">{u.name || "Unnamed"}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={u.role || "student"} onValueChange={(role) => handleRoleChange(u._id, role)} disabled={isProcessing}>
                    <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Post an Announcement</DialogTitle><DialogDescription>Visible to all users.</DialogDescription></DialogHeader>
          <form onSubmit={handleAnnouncement} className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Title <span className="text-destructive">*</span></Label><Input placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Content <span className="text-destructive">*</span></Label><Textarea placeholder="Content..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} rows={4} required /></div>
            <div className="space-y-2"><Label>Priority</Label><Select value={annPriority} onValueChange={setAnnPriority}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="important">Important</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowAnnouncementDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={!annTitle || !annContent || isProcessing} className="gap-2">{isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Megaphone className="size-4" />}Post</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
