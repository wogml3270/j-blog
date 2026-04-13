import { cn } from "@/lib/utils/cn";
import type { ToolbarSelectOption } from "@/types/ui";

export function AdminToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // 관리자 리스트 상단 조작 영역(필터/표시개수/버튼)을 공통 레이아웃으로 고정한다.
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

export function AdminToolbarSelect({
  icon,
  label,
  value,
  options,
  onChange,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  options: ToolbarSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  // select UI를 아이콘/접근성 라벨 포함 형태로 공통화한다.
  return (
    <label
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm",
        className,
      )}
    >
      {icon ?? null}
      <span className="sr-only">{label}</span>
      <select
        className="bg-transparent text-sm outline-none"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminToolbarAction({ children }: { children: React.ReactNode }) {
  // 버튼 슬롯을 분리해 탭별 액션 버튼 교체를 단순화한다.
  return <div className="inline-flex items-center">{children}</div>;
}
