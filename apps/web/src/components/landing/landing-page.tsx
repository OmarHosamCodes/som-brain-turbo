"use client";

import {
  ArrowRightIcon,
  BarChart3Icon,
  BrainIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FolderIcon,
  TargetIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarsBackground } from "@/components/backgrounds/stars-background";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ClockIcon,
    title: "Time Tracking",
    description:
      "Start, stop, and log time entries with a single click. Manual entries, billable hours, and reviewer assignments built in.",
  },
  {
    icon: FolderIcon,
    title: "Project Management",
    description:
      "Organize work across clients and projects. Track budgets, deadlines, and team allocation in one place.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Task Management",
    description:
      "Create, assign, and prioritize tasks. Filter by status, priority, or project to stay focused on what matters.",
  },
  {
    icon: TargetIcon,
    title: "Sprint Planning",
    description:
      "Plan sprints with templates, track progress through steps, and keep your team aligned on deliverables.",
  },
  {
    icon: BrainIcon,
    title: "Micro Brain",
    description:
      "A lightweight issue tracker for capturing bugs, requests, and ideas. Link tickets directly to time entries.",
  },
  {
    icon: BarChart3Icon,
    title: "Reports & Analytics",
    description:
      "Generate detailed reports on time, costs, and productivity. Export data and share insights with stakeholders.",
  },
];

const capabilities = [
  "Billable & non-billable tracking",
  "Client portal access",
  "Sprint templates",
  "Time entry reviews",
  "Expense management",
  "Salary tracking",
  "Department management",
  "Custom rate cards",
];

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border/50 bg-card/50 p-6 transition-colors duration-200 hover:border-border hover:bg-card">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function LandingPage() {
  return (
    <StarsBackground className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="relative z-10 border-border/50 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link className="flex items-center gap-2.5" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ClockIcon className="size-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">
              SomBrain
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              href="/auth"
            >
              Sign in
            </Link>
            <Link className={cn(buttonVariants({ size: "sm" }))} href="/auth">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-6" variant="secondary">
            <ZapIcon className="size-3" data-icon="inline-start" />
            Time Tracking + Project Management + Issue Tracking
          </Badge>
          <h1 className="font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Track time.</span>
            <br />
            <span className="text-foreground">Ship projects.</span>
            <br />
            <span className="text-primary">Stay in control.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            SomBrain brings time tracking, project management, and issue
            tracking into one platform. Manage clients, plan sprints, and
            generate reports -- all without switching tools.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link className={cn(buttonVariants({ size: "lg" }))} href="/auth">
              Start Tracking
              <ArrowRightIcon className="ml-1.5 size-4" />
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              href="/auth"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
              Everything your team needs
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              From tracking hours to planning sprints, SomBrain covers the full
              workflow for agencies, consultancies, and product teams.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />

      {/* Capabilities */}
      <section className="relative z-10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
              Built for real teams
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Not just another time tracker. SomBrain handles the details that
              matter to growing organizations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {capabilities.map((cap) => (
              <div className="flex items-start gap-2.5" key={cap}>
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-foreground text-sm">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />

      {/* Team / Social Proof */}
      <section className="relative z-10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Built for teams of all sizes
            </span>
          </div>
          <h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            From freelancers to agencies
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
            Whether you are a solo consultant tracking billable hours or a
            50-person agency managing multiple client projects, SomBrain scales
            with your workflow.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-8">
            {[
              { value: "6", label: "Core Modules" },
              { value: "24/7", label: "Time Tracking" },
              { value: "100%", label: "Data Ownership" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-bold text-3xl text-primary">
                  {stat.value}
                </div>
                <div className="mt-1 text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
            Ready to take control of your time?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Set up your organization in minutes. No credit card required.
          </p>
          <div className="mt-8">
            <Link className={cn(buttonVariants({ size: "lg" }))} href="/auth">
              Get Started Free
              <ArrowRightIcon className="ml-1.5 size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-border/50 border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <ClockIcon className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm tracking-tight">
              SomBrain
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} SomBrain. All rights reserved.
          </p>
        </div>
      </footer>
    </StarsBackground>
  );
}
