import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

/* =========================================================================
   Avatar — User or pet avatar with fallback initials
   ========================================================================= */

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
  status?: "online" | "offline" | null;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; image: number }> = {
  xs: { container: "h-6 w-6", text: "text-[10px]", image: 24 },
  sm: { container: "h-8 w-8", text: "text-xs", image: 32 },
  md: { container: "h-10 w-10", text: "text-sm", image: 40 },
  lg: { container: "h-14 w-14", text: "text-lg", image: 56 },
  xl: { container: "h-20 w-20", text: "text-xl", image: 80 },
};

export function Avatar({
  src,
  alt,
  size = "md",
  className,
  status,
}: AvatarProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden",
          "bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30",
          "flex items-center justify-center",
          "ring-2 ring-border",
          styles.container,
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={styles.image}
            height={styles.image}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "font-semibold text-text-primary select-none",
              styles.text,
            )}
          >
            {getInitials(alt)}
          </span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-bg-primary",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            status === "online" ? "bg-success" : "bg-text-muted",
          )}
        />
      )}
    </div>
  );
}
