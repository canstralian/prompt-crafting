import { cn } from "@/lib/utils";

interface NetworkPatternProps {
  /** Pattern ID for unique SVG references */
  id?: string;
  /** Grid cell size in pixels */
  size?: number;
  /** Opacity of the pattern (0-1) */
  opacity?: number;
  /** Color class for the pattern elements */
  colorClass?: string;
  /** Additional className for the container */
  className?: string;
  /** Variant style */
  variant?: "default" | "dense" | "sparse";
}

export function NetworkPattern({
  id = "network-pattern",
  size = 60,
  opacity = 0.06,
  colorClass = "text-foreground",
  className,
  variant = "default",
}: NetworkPatternProps) {
  const halfSize = size / 2;
  const nodeRadius = variant === "dense" ? 2 : variant === "sparse" ? 1 : 1.5;
  const cornerRadius = variant === "dense" ? 1.5 : 1;
  const lineWidth = variant === "dense" ? 0.6 : 0.5;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      style={{ opacity }}
    >
      <svg
        className={cn("w-full h-full", colorClass)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={id}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {/* Center node */}
            <circle
              cx={halfSize}
              cy={halfSize}
              r={nodeRadius}
              fill="currentColor"
            />
            {/* Corner nodes */}
            <circle cx="0" cy="0" r={cornerRadius} fill="currentColor" />
            <circle cx={size} cy="0" r={cornerRadius} fill="currentColor" />
            <circle cx="0" cy={size} r={cornerRadius} fill="currentColor" />
            <circle cx={size} cy={size} r={cornerRadius} fill="currentColor" />
            {/* Connection lines */}
            <line
              x1="0"
              y1="0"
              x2={halfSize}
              y2={halfSize}
              stroke="currentColor"
              strokeWidth={lineWidth}
              opacity="0.5"
            />
            <line
              x1={size}
              y1="0"
              x2={halfSize}
              y2={halfSize}
              stroke="currentColor"
              strokeWidth={lineWidth}
              opacity="0.5"
            />
            <line
              x1="0"
              y1={size}
              x2={halfSize}
              y2={halfSize}
              stroke="currentColor"
              strokeWidth={lineWidth}
              opacity="0.5"
            />
            <line
              x1={size}
              y1={size}
              x2={halfSize}
              y2={halfSize}
              stroke="currentColor"
              strokeWidth={lineWidth}
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
