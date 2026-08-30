import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  MessageSquare,
  Shield,
  Users,
  ChevronRight,
  AlertTriangle,
  Settings,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const features = [
  {
    icon: FileText,
    title: "Easy Submission",
    description:
      "Submit complaints in seconds with our streamlined form. Choose categories, set priority, and track everything.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description:
      "Watch your complaint move from pending to resolved. Every update is reflected instantly across the system.",
  },
  {
    icon: Shield,
    title: "Transparent Process",
    description:
      "No black boxes. See exactly where your complaint stands, who is reviewing it, and when to expect resolution.",
  },
  {
    icon: MessageSquare,
    title: "Clear Communication",
    description:
      "Resolution notes and status updates keep everyone informed. Students and staff stay on the same page.",
  },
];

const categories = [
  { icon: BookOpen, label: "Academic", color: "bg-blue-500/10 text-blue-600" },
  {
    icon: Building2,
    label: "Facility",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Settings,
    label: "Administration",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: AlertTriangle,
    label: "Discipline",
    color: "bg-rose-500/10 text-rose-600",
  },
  { icon: MessageSquare, label: "Other", color: "bg-teal-500/10 text-teal-600" },
];

const statusFlow = [
  { icon: FileText, label: "Submitted", color: "bg-slate-100 text-slate-600" },
  {
    icon: Clock,
    label: "Pending",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: AlertCircle,
    label: "In Review",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: CheckCircle2,
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const stats = [
  { value: "500+", label: "Complaints Resolved", icon: CheckCircle2 },
  { value: "48h", label: "Avg. Response Time", icon: Clock },
  { value: "95%", label: "Resolution Rate", icon: Shield },
  { value: "24/7", label: "System Available", icon: Building2 },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              CollegeComplaints
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.05]" />
        <div className="mx-auto max-w-6xl px-6 py-24 text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              College Complaint Management System
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Your voice matters.{" "}
              <span className="text-primary">Make it heard.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              A transparent, efficient platform for students and staff to submit,
              track, and resolve complaints. From academic issues to facility
              concerns — every complaint gets the attention it deserves.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <button
                onClick={() => navigate("/auth")}
                className="group flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90"
              >
                Submit a Complaint
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-7 py-3.5 text-base font-semibold transition-all hover:bg-muted/50"
              >
                See How It Works
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for real college life
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make the complaint process fair,
            transparent, and efficient for everyone on campus.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/[0.03]"
            >
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cover every concern
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Organized categories ensure your complaint reaches the right department immediately.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-3 rounded-xl border border-border/60 bg-card px-6 py-4 transition-all hover:shadow-md`}
              >
                <div className={`flex size-10 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="size-5" />
                </div>
                <span className="font-medium">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Four simple steps from submission to resolution.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-4">
          {statusFlow.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative mx-auto mb-5">
                <div
                  className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${step.color}`}
                >
                  <step.icon className="size-7" />
                </div>
                {i < statusFlow.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-1/2 hidden h-px w-[calc(100%-4rem)] bg-border md:block" />
                )}
              </div>
              <div className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground -translate-x-1 -translate-y-1">
                {i + 1}
              </div>
              <h3 className="font-semibold">{step.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {i === 0 && "Fill in the details of your complaint"}
                {i === 1 && "Your complaint awaits review"}
                {i === 2 && "An admin reviews and investigates"}
                {i === 3 && "Complaint is addressed and closed"}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For Students & Staff */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/60 bg-card p-10"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <GraduationCap className="size-7" />
              </div>
              <h3 className="text-2xl font-bold">For Students</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Submit complaints about academics, facilities, or administration",
                  "Track your complaint status in real time",
                  "See resolution notes when your issue is addressed",
                  "Anonymous submission option available",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-500" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/60 bg-card p-10"
            >
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Users className="size-7" />
              </div>
              <h3 className="text-2xl font-bold">For Staff</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "View and manage all complaints in one place",
                  "Filter by category, status, or priority",
                  "Update complaint status and add resolution notes",
                  "Gain insights into campus-wide complaint trends",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-500" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to make your voice count?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Join hundreds of students and staff already using the system to
            improve campus life.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-all hover:shadow-xl hover:bg-background/90"
          >
            Start Now
            <ChevronRight className="size-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="size-4" />
            CollegeComplaints
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} College Complaint Management System. All
            rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
