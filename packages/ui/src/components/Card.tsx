import { type JSX, splitProps } from "solid-js";
import { cn } from "../utils/cn";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "solid";
}

export function Card(props: CardProps) {
  const [local, others] = splitProps(props, ["class", "variant", "children"]);

  const variantStyles = {
    default: "bg-slate-900/80 border border-slate-700/50",
    glass: "bg-slate-900/40 backdrop-blur-md border border-slate-700/30",
    solid: "bg-slate-800 border border-slate-700",
  };

  return (
    <div
      class={cn(
        "rounded-xl p-4 shadow-lg",
        variantStyles[local.variant ?? "default"],
        local.class
      )}
      {...others}
    >
      {local.children}
    </div>
  );
}
