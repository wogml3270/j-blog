"use client";

import { cn } from "@/lib/utils/cn";
import { ToastMarkdownEditor } from "@/components/admin/common/toast-markdown-editor";

type MarkdownFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  useEditor: boolean;
  onToggleEditor: (checked: boolean) => void;
  placeholder?: string;
  minHeight?: number;
  required?: boolean;
  className?: string;
};

export function MarkdownField({
  label,
  value,
  onChange,
  useEditor,
  onToggleEditor,
  placeholder,
  minHeight = 220,
  required = false,
  className,
}: MarkdownFieldProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <label className="inline-flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={useEditor}
            onChange={(event) => onToggleEditor(event.target.checked)}
          />
          에디터 사용
        </label>
      </div>

      {useEditor ? (
        <ToastMarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          height={`${minHeight}px`}
        />
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground"
          style={{ minHeight }}
          placeholder={placeholder}
          required={required}
        />
      )}
    </section>
  );
}
