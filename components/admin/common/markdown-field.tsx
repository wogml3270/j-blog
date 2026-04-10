"use client";

import { cn } from "@/lib/utils/cn";
import { ToastMarkdownEditor } from "@/components/admin/common/toast-markdown-editor";

type MarkdownFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  required?: boolean;
  className?: string;
};

export function MarkdownField({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 220,
  required = false,
  className,
}: MarkdownFieldProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <ToastMarkdownEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={`${minHeight}px`}
      />
      {required ? <input type="hidden" value={value.trim() ? "ok" : ""} required readOnly /> : null}
    </section>
  );
}
