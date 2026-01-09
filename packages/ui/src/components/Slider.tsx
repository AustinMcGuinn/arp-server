import { splitProps } from "solid-js";
import { cn } from "../utils/cn";

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  onChange: (value: number) => void;
  class?: string;
}

export function Slider(props: SliderProps) {
  const [local] = splitProps(props, [
    "value",
    "min",
    "max",
    "step",
    "label",
    "showValue",
    "onChange",
    "class",
  ]);

  const min = local.min ?? 0;
  const max = local.max ?? 100;
  const percentage = ((local.value - min) / (max - min)) * 100;

  return (
    <div class={cn("flex flex-col gap-2", local.class)}>
      {(local.label || local.showValue) && (
        <div class="flex justify-between items-center">
          {local.label && (
            <label class="text-sm font-medium text-slate-300">{local.label}</label>
          )}
          {local.showValue && (
            <span class="text-sm text-slate-400">{local.value}</span>
          )}
        </div>
      )}
      <div class="relative h-2 rounded-full bg-slate-700">
        <div
          class="absolute h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={local.step ?? 1}
          value={local.value}
          onInput={(e) => local.onChange(Number(e.currentTarget.value))}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-emerald-500 pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
