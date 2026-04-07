import { cn } from "@/lib/utils/cn";

type StatusOption = {
  value: string;
  label: string;
};

export type StatusRadioGroupProps = {
  legend: string;
  name: string;
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function StatusRadioGroup({
  legend,
  name,
  value,
  options,
  onChange,
  className,
}: StatusRadioGroupProps) {
  return (
    <fieldset className={cn("rounded-xl border border-border bg-background p-3.5", className)}>
      <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted">{legend}</legend>
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
