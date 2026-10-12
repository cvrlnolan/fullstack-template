import type * as React from "react";
import { cn } from "../lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-xl border bg-card p-6 text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 data-slot="card-title" className={cn("font-semibold leading-none", className)} {...props} />
  );
}

export { Card, CardTitle };
