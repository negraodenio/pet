import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence handling.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a confidence score as a percentage string.
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Generate initials from a display name (max 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Map event severity to a color token.
 */
export function severityColor(severity: "info" | "warning" | "critical"): string {
  const colors = {
    info: "text-blue-400",
    warning: "text-amber-400",
    critical: "text-red-400",
  };
  return colors[severity];
}

/**
 * Map event severity to a background color token.
 */
export function severityBg(severity: "info" | "warning" | "critical"): string {
  const colors = {
    info: "bg-blue-400/10",
    warning: "bg-amber-400/10",
    critical: "bg-red-400/10",
  };
  return colors[severity];
}

/**
 * Format an event type enum to a human-readable label.
 */
export function formatEventType(eventType: string): string {
  return eventType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
