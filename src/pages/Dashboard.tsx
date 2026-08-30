import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Send,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Plus,
  ArrowLeft,
  BookOpen,
  Building2,
  Settings,
  AlertTriangle,
  MessageSquare,
  Loader2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "academic", label: "Academic", icon: BookOpen, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { value: "facility", label: "Facility", icon: Building2, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { value: "administration", label: "Administration", icon: Settings, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { value: "discipline", label: "Discipline", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-600 border-rose-200" },
  { value: "other", label: "Other", icon: MessageSquare, color: "bg-teal-500/10 text-teal-600 border-teal-200" },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-600" },
  { value: "high", label: "High", color: "bg-orange-50 text-orange-600" },
  { value: "urgent", label: "Urgent", color: "bg-red-50 text-red-600" },
] as const;

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-200" },
  in_review: { label: "In Review", icon: AlertCircle, color: "bg-blue-50 text-blue-600 border-blue-200" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-50 text-red-600 border-red-200" },
} as const;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPriority, setFormPriority] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitComplaint = useMutation(api.complaints.submit);
  const complaints = useQuery(api.complaints.list);
  const stats = useQuery(api.complaints.stats);
  const selectedComplaintData = useQuery(
    api.complaints.get,
    selectedComplaint ? { complaintId: selectedComplaint as any } : "skip"
  );

  const userComplaints = useMemo(() => {
    if (!complaints || !user) return [];
    return complaints.filter((c) => c.userId === user._id);
  }, [complaints, user]);

  const filteredComplaints = useMemo(() => {
    if (!userComplaints) return [];
    return userComplaints.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (
        searchQuery &&
        !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [userComplaints, filterStatus, filterCategory, searchQuery]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("");
    setFormPriority("");
    setFormDepartment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formCategory || !formPriority) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitComplaint({
        title: formTitle,
        description: formDescription,
        category: formCategory as any,
        priority: formPriority as any,
        department: formDepartment || undefined,
        userId: user?._id ?? "",
        userName: user?.name || user?.email || "Anonymous",
        userRole: (user?.role as any) || "student",
      });
      toast.success("Complaint submitted successfully!", {
        description: "Your complaint has been registered and is pending review.",
      });
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to submit complaint", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryInfo = (cat: string) => {
    return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
  };

  const getPriorityInfo = (p: string) => {
    return PRIORITIES.find((pr) => pr.value === p) || PRIORITIES[0];
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              CC
            </div>
            <span className="font-semibold hidden sm:inline">
              CollegeComplaints
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.name || user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => signOut()}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
            {[
              { label: "Total Complaints", value: stats.total, icon: FileText, color: "text-primary" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500" },
              { label: "In Review", value: stats.inReview, icon: AlertCircle, color: "text-blue-500" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-500" },
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
        )}

        {/* Action Bar */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {userComplaints.length} complaint{userComplaints.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="size-4" />
            New Complaint
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredComplaints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center"
              >
                <FileText className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {userComplaints.length === 0
                    ? "No complaints yet"
                    : "No complaints match your filters"}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {userComplaints.length === 0
                    ? "Click \"New Complaint\" to submit your first complaint"
                    : "Try adjusting your search or filters"}
                </p>
                {userComplaints.length === 0 && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="mt-4 gap-2"
                  >
                    <Plus className="size-4" />
                    Submit First Complaint
                  </Button>
                )}
              </motion.div>
            ) : (
              filteredComplaints.map((complaint, i) => {
                const catInfo = getCategoryInfo(complaint.category);
                const priInfo = getPriorityInfo(complaint.priority);
                const statusCfg = STATUS_CONFIG[complaint.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <motion.div
                    key={complaint._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className="border-border/60 cursor-pointer transition-all hover:border-border hover:shadow-md group"
                      onClick={() => setSelectedComplaint(complaint._id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge
                                variant="secondary"
                                className={`${catInfo.color} border text-xs font-medium`}
                              >
                                <catInfo.icon className="size-3 mr-1" />
                                {catInfo.label}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${priInfo.color} text-xs font-medium`}
                              >
                                {priInfo.label}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${statusCfg.color} border text-xs font-medium`}
                              >
                                <StatusIcon className="size-3 mr-1" />
                                {statusCfg.label}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                              {complaint.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {complaint.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(complaint.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit Complaint Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Submit a Complaint</DialogTitle>
            <DialogDescription>
              Fill in the details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Complaint Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief title for your complaint"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your complaint..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Select value={formPriority} onValueChange={setFormPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((pri) => (
                      <SelectItem key={pri.value} value={pri.value}>
                        {pri.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <Input
                placeholder="e.g., Computer Science, Electrical Engineering"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit Complaint
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complaint Detail Dialog */}
      <Dialog
        open={!!selectedComplaint}
        onOpenChange={(open) => {
          if (!open) setSelectedComplaint(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedComplaintData ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const catInfo = getCategoryInfo(selectedComplaintData.category);
                    const statusCfg = STATUS_CONFIG[selectedComplaintData.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <>
                        <Badge
                          variant="secondary"
                          className={`${catInfo.color} border text-xs font-medium`}
                        >
                          <catInfo.icon className="size-3 mr-1" />
                          {catInfo.label}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`${statusCfg.color} border text-xs font-medium`}
                        >
                          <StatusIcon className="size-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                      </>
                    );
                  })()}
                </div>
                <DialogTitle className="text-xl">
                  {selectedComplaintData.title}
                </DialogTitle>
                <DialogDescription>
                  Submitted by {selectedComplaintData.userName} on{" "}
                  {formatDate(selectedComplaintData.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Description
                  </Label>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedComplaintData.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Priority
                    </Label>
                    <p className="mt-1 font-medium capitalize">
                      {selectedComplaintData.priority}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Last Updated
                    </Label>
                    <p className="mt-1 font-medium">
                      {formatDate(selectedComplaintData.updatedAt)}
                    </p>
                  </div>
                  {selectedComplaintData.department && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Department
                      </Label>
                      <p className="mt-1 font-medium">
                        {selectedComplaintData.department}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Complaint ID
                    </Label>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedComplaintData._id}
                    </p>
                  </div>
                </div>

                {selectedComplaintData.resolution && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Resolution Notes
                      </Label>
                      <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedComplaintData.resolution}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
