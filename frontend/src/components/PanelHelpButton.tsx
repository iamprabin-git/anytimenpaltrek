"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { PanelIcon } from "@/components/panel/icons";
import { getPanelHelp, type HelpTopic } from "@/lib/panel-help";
import type { UserRole } from "@/lib/auth";

type PanelHelpButtonProps = {
  role: UserRole;
  variant?: "default" | "admin";
};

type HelpTab = "setup" | "usage" | "page";

function TopicCard({ topic }: { topic: HelpTopic }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <h4 className="font-semibold text-foreground">{topic.title}</h4>
      {topic.summary ? <p className="mt-2 text-sm text-muted">{topic.summary}</p> : null}

      {topic.steps?.length ? (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-foreground/90">
          {topic.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}

      {topic.tips?.length ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/90">
          {topic.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      ) : null}

      {topic.links?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {topic.links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {link.label} ↗
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-primary hover:underline">
                {link.label}
              </Link>
            )
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function PanelHelpButton({ role, variant = "default" }: PanelHelpButtonProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<HelpTab>("usage");
  const titleId = useId();
  const guide = getPanelHelp(role, pathname);
  const hasPageHelp = guide.pageTopics.length > 0;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (hasPageHelp) {
      setTab("page");
    } else {
      setTab("usage");
    }
  }, [pathname, hasPageHelp]);

  const buttonClass =
    variant === "admin"
      ? "admin-topbar-action"
      : "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted";

  const activeSection =
    tab === "setup" ? guide.setup : tab === "page" ? { title: "This page", topics: guide.pageTopics } : guide.usage;

  return (
    <>
      <button type="button" className={buttonClass} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <PanelIcon name="help" className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Help</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close help"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 id={titleId} className="text-xl font-bold text-foreground">
                  {guide.portalTitle}
                </h2>
                <p className="mt-1 text-sm text-muted">{guide.portalIntro}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border p-2 text-muted hover:bg-surface-muted hover:text-foreground"
                aria-label="Close help panel"
              >
                <PanelIcon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 sm:px-6">
              {hasPageHelp ? (
                <button
                  type="button"
                  onClick={() => setTab("page")}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "page" ? "bg-primary text-white" : "bg-surface-muted text-foreground"}`}
                >
                  This page
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setTab("usage")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "usage" ? "bg-primary text-white" : "bg-surface-muted text-foreground"}`}
              >
                How to use
              </button>
              <button
                type="button"
                onClick={() => setTab("setup")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "setup" ? "bg-primary text-white" : "bg-surface-muted text-foreground"}`}
              >
                Setup
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{activeSection.title}</h3>
              <div className="space-y-4">
                {activeSection.topics.length > 0 ? (
                  activeSection.topics.map((topic) => <TopicCard key={topic.title} topic={topic} />)
                ) : (
                  <p className="text-sm text-muted">No specific help topics for this section yet.</p>
                )}
              </div>
            </div>

            <div className="border-t border-border bg-surface-muted/40 px-5 py-3 text-xs text-muted sm:px-6">
              Need more assistance? Update company contact details in Admin → Company Settings so customers and staff see the correct support email and phone.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
