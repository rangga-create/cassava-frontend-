"use client";

import { forwardRef, HTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

const ScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };