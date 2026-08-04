import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";

/* =========================================================================
   EmptyState — Beautiful empty state for lists and pages
   ========================================================================= */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        "text-center animate-fade-in-up",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-tertiary text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        ) : action.onClick ? (
          <Button onClick={action.onClick}>{action.label}</Button>
        ) : (
          <Button>{action.label}</Button>
        )
      )}
    </div>
  );
}
