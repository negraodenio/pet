import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* =========================================================================
   Button — Primary UI primitive
   Supports variants, sizes, loading state, and icon slots.
   ========================================================================= */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary hover:bg-accent-primary/90 text-white shadow-md hover:shadow-glow active:scale-[0.98]",
  secondary:
    "bg-bg-tertiary hover:bg-bg-elevated text-text-primary border border-border hover:border-border-active",
  ghost:
    "bg-transparent hover:bg-glass-hover text-text-secondary hover:text-text-primary",
  danger:
    "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40",
  outline:
    "bg-transparent border border-border hover:border-accent-primary/50 text-text-secondary hover:text-text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-lg justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]",
          "focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon
        )}
        {size !== "icon" && children}
        {iconRight}
      </button>
    );
  },
);

Button.displayName = "Button";
