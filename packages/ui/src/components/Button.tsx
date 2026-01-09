import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
        secondary:
          "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500",
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        ghost:
          "bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500",
        outline:
          "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "class",
    "variant",
    "size",
    "loading",
    "children",
  ]);

  return (
    <button
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      disabled={local.loading || props.disabled}
      {...others}
    >
      {local.loading ? (
        <svg
          class="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {local.children}
    </button>
  );
}
