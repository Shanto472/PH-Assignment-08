import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[110px] w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-danger focus-visible:ring-danger/40"
            : "border-border hover:border-muted/60",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
