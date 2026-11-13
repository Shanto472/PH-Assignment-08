import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
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

Input.displayName = "Input";
