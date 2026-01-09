import { type JSX, splitProps } from "solid-js";
import { cn } from "../utils/cn";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input(props: InputProps) {
  const [local, others] = splitProps(props, ["class", "label", "error", "id"]);

  const inputId = local.id ?? `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div class="flex flex-col gap-1.5">
      {local.label && (
        <label
          for={inputId}
          class="text-sm font-medium text-slate-300"
        >
          {local.label}
        </label>
      )}
      <input
        id={inputId}
        class={cn(
          "h-10 w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200",
          local.error && "border-red-500 focus:ring-red-500",
          local.class
        )}
        {...others}
      />
      {local.error && (
        <span class="text-xs text-red-400">{local.error}</span>
      )}
    </div>
  );
}
