import { cn } from "@/lib/utils";

/* =========================================================================
   Badge — Status indicator with variant support
   ========================================================================= */

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-text-secondary",
  primary: "bg-accent-primary/15 text-accent-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-blue-500/15 text-blue-400",
  outline: "bg-transparent border border-border text-text-secondary",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  primary: "bg-accent-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-blue-400",
  outline: "bg-text-muted",
};

export function Badge({
  children,
  variant = "default",
  className,
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-0.5 rounded-full",
        "text-xs font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                dotColors[variant],
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              dotColors[variant],
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
