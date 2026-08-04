import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* =========================================================================
   Input — Form input with label, error, and icon support
   ========================================================================= */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg",
              "bg-bg-secondary border border-border",
              "text-sm text-text-primary placeholder:text-text-muted",
              "transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]",
              "hover:border-border-active",
              "focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-10 pr-3" : "px-3",
              error && "border-danger focus:border-danger focus:ring-danger/30",
              className,
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
