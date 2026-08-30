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
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Loader2,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Building2,
  AlertTriangle,
  MessageSquare,
  Shield,
  MessageCircle,
  CalendarDays,
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
  in_progress: { label: "In Review", icon: AlertCircle, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
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

export default function Faculty() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);


  const myComplaints = useQuery(
    api.complaints.listByAssigned,
    user?._id ? { userId: user._id } : "skip"
  );

  const allComplaints = useQuery(api.complaints.list);
  const allComments = useQuery(api.comments.listByComplaint, selectedComplaint ? { complaintId: selectedComplaint } : "skip");

  const resolveComplaint = useMutation(api.complaints.resolve);
  const updateStatus = useMutation(api.complaints.updateStatus);
  const addComment = useMutation(api.comments.add);
  const [resolveText, setResolveText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredComplaints = (myComplaints || []).filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selectedData = myComplaints?.find((c) => c._id === selectedComplaint);
  const complaintComments = allComments || [];

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleResolve = async () => {
    if (!selectedComplaint || !resolveText.trim()) return;
    setIsProcessing(true);
    try {
      await resolveComplaint({ complaintId: selectedComplaint as any, resolution: resolveText.trim() });
      setResolveText("");
      toast.success("Complaint resolved successfully");
      setSelectedComplaint(null);
    } catch {
      toast.error("Failed to resolve complaint");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedComplaint) return;
    setIsProcessing(true);
    try {
      await updateStatus({ complaintId: selectedComplaint as any, status: status as any });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedComplaint) return;
    setIsProcessing(true);
    try {
      await addComment({
        complaintId: selectedComplaint,
        userId: user?._id ?? "",
        userName: user?.name || user?.email || "Faculty",
        userRole: "faculty",
        content: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusInfo = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

  if (user?.role !== "faculty" && user?.role !== "admin") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto size-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold">Faculty Access Required</h2>
          <p className="text-muted-foreground mt-2">You need faculty privileges to access this page.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </main>
    );
  }

  const totalAssigned = myComplaints?.length || 0;
  const openCount = myComplaints?.filter((c) => c.status === "assigned" || c.status === "in_progress").length || 0;
  const resolvedCount = myComplaints?.filter((c) => c.status === "resolved").length || 0;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="size-4" />Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">S</div>
              <span className="font-semibold hidden sm:inline">SpeakUp Campus</span>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-xs">Faculty</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => signOut()}>
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Assigned to Me", value: totalAssigned, icon: FileText, color: "text-primary" },
            { label: "Open", value: openCount, icon: Clock, color: "text-amber-400" },
            { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Assigned Complaints</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and resolve grievances assigned to you
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search assigned complaints..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          {filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {(myComplaints || []).length === 0 ? "No complaints assigned to you" : "No complaints match your filters"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {(myComplaints || []).length === 0
                  ? "When an admin assigns a complaint to you, it will appear here"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => {
              const cat = CATEGORIES[complaint.category] || CATEGORIES.other;
              const statusCfg = getStatusInfo(complaint.status);
              const StatusIcon = statusCfg.icon;
              const CatIcon = cat.icon;
              const pri = PRIORITIES[complaint.priority] || PRIORITIES.low;
              return (
                <Card key={complaint._id} className="border-border/60 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md group" onClick={() => setSelectedComplaint(complaint._id)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="secondary" className={`${cat.color} border text-xs font-medium`}>
                            <CatIcon className="size-3 mr-1" />{cat.label}
                          </Badge>
                          <Badge variant="secondary" className={`${pri.color} text-xs font-medium`}>{pri.label}</Badge>
                          <Badge variant="secondary" className={`${statusCfg.color} border text-xs font-medium`}>
                            <StatusIcon className="size-3 mr-1" />{statusCfg.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">By {complaint.userName} · {formatDate(complaint.createdAt)}</p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Complaint Detail / Resolution Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) { setSelectedComplaint(null); setResolveText(""); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedData ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={`${(CATEGORIES[selectedData.category] || CATEGORIES.other).color} border text-xs font-medium`}>
                    {(CATEGORIES[selectedData.category] || CATEGORIES.other).label}
                  </Badge>
                  <Badge variant="secondary" className={`${(STATUS_CONFIG[selectedData.status] || STATUS_CONFIG.pending).color} border text-xs font-medium`}>
                    {(STATUS_CONFIG[selectedData.status] || STATUS_CONFIG.pending).label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedData.title}</DialogTitle>
                <DialogDescription>
                  By {selectedData.userName} · {formatDate(selectedData.createdAt)}
                  {selectedData.departmentName && <span> · {selectedData.departmentName}</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Description */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{selectedData.description}</p>
                </div>
                <Separator />

                {/* Resolution Actions */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Update Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <Button
                        key={key}
                        variant={selectedData.status === key ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5"
                        disabled={isProcessing || selectedData.status === key}
                        onClick={() => handleStatusUpdate(key)}
                      >
                        <val.icon className="size-3" />{val.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />

                {/* Resolve */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Resolution Notes</Label>
                  <Textarea
                    placeholder="Describe how this grievance was resolved..."
                    value={resolveText}
                    onChange={(e) => setResolveText(e.target.value)}
                    rows={3}
                  />
                  <Button className="mt-2 gap-1.5" disabled={!resolveText.trim() || isProcessing} onClick={handleResolve}>
                    {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    Mark as Resolved
                  </Button>
                </div>

                {selectedData.resolution && (
                  <>
                    <Separator />
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <Label className="text-xs text-emerald-400 uppercase tracking-wider">Resolution</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedData.resolution}</p>
                    </div>
                  </>
                )}

                {/* Discussion */}
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" />Discussion ({complaintComments.length})
                  </Label>

                  <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                    {complaintComments.length > 0 ? (
                      complaintComments.map((comment) => (
                        <div key={comment._id} className="rounded-lg border border-border/60 bg-card p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold">
                                {comment.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium">{comment.userName}</span>
                              {comment.userRole === "admin" && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px]">Admin</Badge>
                              )}
                              {comment.userRole === "faculty" && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 text-[9px]">Faculty</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border/60 rounded-lg">
                        No comments yet.
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
                    <Button type="submit" size="icon" disabled={!commentText.trim() || isProcessing}>
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
