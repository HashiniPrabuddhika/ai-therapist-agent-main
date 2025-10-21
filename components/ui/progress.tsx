"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, style, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={className}
    style={{
      position: "relative",
      height: style?.height || "0.5rem",
      width: "100%",
      overflow: "hidden",
      borderRadius: "9999px",
      backgroundColor: "hsl(var(--primary) / 0.1)",
      ...style,
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      style={{
        height: "100%",
        width: "100%",
        flex: "1 1 0%",
        backgroundColor: "hsl(var(--primary))",
        transition: "all 0.2s",
        transform: `translateX(-${100 - (value || 0)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };