import { cn } from "@/lib/utils";

/* =========================================================================
   Loading — Skeleton, spinner, and loading states
   ========================================================================= */

/** Full-page loading spinner */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-primary z-50">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-text-secondary">Loading Compawion...</p>
      </div>
    </div>
  );
}

/** Inline spinner */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin text-accent-primary", className)}
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
  );
}

/** Skeleton placeholder */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-lg", className)}
      {...props}
    />
  );
}

/** Card skeleton */
export function CardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
