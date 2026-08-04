import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* =========================================================================
   Card — Glassmorphism container with optional header, footer, and hover
   ========================================================================= */

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  className,
  hover = true,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        paddingStyles[padding],
        hover && "hover:border-border-active hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -- Card Header -- */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}

/* -- Card Title -- */
interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div>
      <h3 className={cn("text-base font-semibold text-text-primary", className)}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

/* -- Card Content -- */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn(className)}>{children}</div>;
}

/* -- Card Footer -- */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-4 pt-4 border-t border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}
