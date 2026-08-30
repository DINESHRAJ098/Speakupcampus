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
  Megaphone,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: FileText,
    title: "Instant Submission",
    description:
      "File a grievance in seconds. Choose a category, set the priority, and your complaint enters the pipeline immediately.",
  },
  {
    icon: Clock,
    title: "Live Status Tracking",
    description:
      "Watch your complaint move from pending to resolved in real time. Every status change is reflected instantly.",
  },
  {
    icon: Shield,
    title: "Full Transparency",
    description:
      "No black boxes. See exactly where your complaint stands, who is handling it, and what happens next.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Leave comments, ask questions, and receive resolution notes — all attached to the complaint thread.",
  },
  {
    icon: Calendar,
    title: "Schedule Resolution Meetings",
    description:
      "Book a time slot with administrators to discuss your grievance in person. No more chasing offices.",
  },
  {
    icon: Megaphone,
    title: "Campus-Wide Announcements",
    description:
      "Administrators can broadcast updates and important notices so everyone stays informed.",
  },
];

function Calendar(props: any) {
  return <Clock {...props} />;
}

const categories = [
  { icon: BookOpen, label: "Academic", color: "text-blue-400" },
  { icon: Building2, label: "Facility", color: "text-amber-400" },
  { icon: Settings, label: "Administration", color: "text-purple-400" },
  { icon: AlertTriangle, label: "Discipline", color: "text-rose-400" },
  { icon: AlertCircle, label: "Safety", color: "text-orange-400" },
  { icon: MessageSquare, label: "Other", color: "text-teal-400" },
];

const statusFlow = [
  { icon: FileText, label: "Submitted" },
  { icon: Clock, label: "Pending" },
  { icon: AlertCircle, label: "In Review" },
  { icon: CheckCircle2, label: "Resolved" },
];

const stats = [
  { value: "500+", label: "Grievances Resolved", icon: CheckCircle2 },
  { value: "48h", label: "Avg. Response Time", icon: Clock },
  { value: "95%", label: "Resolution Rate", icon: Shield },
  { value: "24/7", label: "Always Available", icon: Building2 },
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
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="text-lg font-bold tracking-tight">
              SpeakUp Campus
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
              onClick={() => navigate("/register")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-primary/[0.03]" />
        <div className="mx-auto max-w-6xl px-6 py-24 text-center relative">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Campus Grievance Management Platform
            </motion.div>

            <motion.h1 variants={fadeInUp} className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Every voice deserves{" "}
              <span className="text-primary">to be heard.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A transparent, efficient platform for students and staff to lodge campus
              grievances and for administrators to track, route, and resolve them in
              real time.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="group flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90"
              >
                File a Grievance
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-7 py-3.5 text-base font-semibold transition-all hover:bg-muted/50"
              >
                See How It Works
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for real campus life</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to make the grievance process fair, transparent, and efficient for every member of the campus community.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group rounded-2xl border border-border/60 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.03]">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cover every concern</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Organized categories ensure your grievance reaches the right department immediately.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-6 py-4 transition-all hover:border-primary/30 hover:shadow-md">
                <cat.icon className={`size-5 ${cat.color}`} />
                <span className="font-medium">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Four simple steps from submission to resolution.</p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-4">
          {statusFlow.map((step, i) => (
            <motion.div key={step.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative text-center">
              <div className="relative mx-auto mb-5">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="size-7" />
                </div>
                {i < statusFlow.length - 1 && (
                  <div className="absolute left-[calc(50%+2rem)] top-1/2 hidden h-px w-[calc(100%-4rem)] bg-border md:block" />
                )}
              </div>
              <div className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground -translate-x-1 -translate-y-1">{i + 1}</div>
              <h3 className="font-semibold">{step.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {i === 0 && "Fill in the details of your grievance"}
                {i === 1 && "Your grievance awaits administrative review"}
                {i === 2 && "An administrator investigates and routes the issue"}
                {i === 3 && "The issue is addressed and closed"}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For Students & Staff */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border/60 bg-card p-10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <GraduationCap className="size-7" />
              </div>
              <h3 className="text-2xl font-bold">For Students & Staff</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Lodge grievances about academics, facilities, or administration",
                  "Track the status of every complaint in real time",
                  "Read resolution notes when your issue is addressed",
                  "Schedule meetings with administrators directly",
                  "Comment and communicate within each complaint thread",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-400" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border/60 bg-card p-10">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Settings className="size-7" />
              </div>
              <h3 className="text-2xl font-bold">For Administrators</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "View and manage every complaint from a unified admin panel",
                  "Filter by category, status, priority, or department",
                  "Assign complaints to team members and update their status",
                  "Post campus-wide announcements and updates",
                  "Gain insight into complaint trends and resolution performance",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to make your voice count?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Join the campus community already using SpeakUp Campus to improve life for everyone.
          </p>
          <button onClick={() => navigate("/register")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-all hover:shadow-xl hover:bg-background/90">
            Start Now <ChevronRight className="size-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground text-[10px] font-bold">S</div>
            SpeakUp Campus
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SpeakUp Campus. All rights reserved.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
