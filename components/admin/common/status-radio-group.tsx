import { cn } from "@/lib/utils/cn";
import type { StatusRadioGroupProps } from "@/types/ui";

export function StatusRadioGroup({
  name,
  value,
  options,
  onChange,
  className,
}: StatusRadioGroupProps) {
  // 상태값 입력은 라디오 그룹으로 통일해 관리자 탭 간 UX 일관성을 유지한다.
  return (
    <fieldset className={cn("rounded-xl border border-border bg-background p-3.5", className)}>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {options.map((item) => {
          const isChecked = value === item.value;

          return (
            <label
              key={item.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                isChecked
                  ? "border-foreground/20 bg-foreground/10 text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name={name}
                checked={isChecked}
                onChange={() => onChange(item.value)}
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
