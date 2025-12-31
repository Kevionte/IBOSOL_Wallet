import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        [
          // base
          "flex h-11 w-full rounded-xl px-4 text-sm",
          "bg-background text-foreground",
          "border border-input",
          "placeholder:text-muted-foreground",

          // smooth + modern focus
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
          "ring-offset-background",

          // file input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "file:text-foreground",

          // disabled
          "disabled:cursor-not-allowed disabled:opacity-50",

          // invalid states
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
        ].join(" "),
        className
      )}
      {...props}
    />
  );
}

export { Input };
