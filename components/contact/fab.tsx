"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface ContactLabels {
  fabLabel: string;
  openAriaLabel: string;
  closeAriaLabel: string;
  title: string;
  description: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
};

interface ContactFabProps {
  labels: ContactLabels;
};

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactFab({ labels }: ContactFabProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [floatingSuccess, setFloatingSuccess] = useState<string | null>(null);

  const closeTimerRef = useRef<number | null>(null);
  const floatingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeydown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeydown);
    };
  }, [open]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (floatingTimerRef.current !== null) {
      window.clearTimeout(floatingTimerRef.current);
      floatingTimerRef.current = null;
    }
    setIsPending(true);
    setNotice(null);
    setFloatingSuccess(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(labels.errorMessage);
      }

      setForm(EMPTY_FORM);
      setNotice({ kind: "success", text: labels.successMessage });
      closeTimerRef.current = window.setTimeout(() => {
        setOpen(false);
        setNotice(null);
        setFloatingSuccess(labels.successMessage);
        closeTimerRef.current = null;
        floatingTimerRef.current = window.setTimeout(() => {
          setFloatingSuccess(null);
          floatingTimerRef.current = null;
        }, 2200);
      }, 1200);
    } catch {
      setNotice({ kind: "error", text: labels.errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }

      if (floatingTimerRef.current !== null) {
        window.clearTimeout(floatingTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={labels.openAriaLabel}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-foreground text-background shadow-lg transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10h10M7 14h6" />
          <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
        <span className="sr-only">{labels.fabLabel}</span>
      </button>

      {floatingSuccess ? (
        <p className="fixed bottom-20 right-5 z-50 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600">
          {floatingSuccess}
        </p>
      ) : null}

      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/35 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className={cn(
          "fixed bottom-5 right-5 z-[60] w-[min(92vw,26rem)] rounded-2xl border border-border bg-surface p-4 shadow-2xl transition-all duration-300 sm:bottom-6 sm:right-6",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{labels.title}</h2>
            <p className="mt-1 text-sm text-muted">{labels.description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={labels.closeAriaLabel}
            onClick={() => setOpen(false)}
          >
            ×
          </Button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{labels.nameLabel}</span>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={labels.namePlaceholder}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{labels.emailLabel}</span>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder={labels.emailPlaceholder}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{labels.subjectLabel}</span>
            <Input
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder={labels.subjectPlaceholder}
              required
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{labels.messageLabel}</span>
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="min-h-[120px] w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
              placeholder={labels.messagePlaceholder}
              required
            />
          </label>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? labels.submittingLabel : labels.submitLabel}
          </Button>
        </form>

        {notice ? (
          <p className={cn("mt-3 text-sm", notice.kind === "success" ? "text-emerald-600" : "text-red-500")}>
            {notice.kind === "success" ? `✓ ${notice.text}` : notice.text}
          </p>
        ) : null}
      </aside>
    </>
  );
}
