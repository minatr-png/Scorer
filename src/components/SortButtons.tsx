"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/components/Icons";
import { useSlidingPill } from "@/components/useSlidingPill";

interface SortButtonsProps<T extends string> {
  options: { value: T; label: string }[];
  current: T;
  onChange: (value: T) => void;
  ascending?: boolean;
  onToggleOrder?: () => void;
}

export default function SortButtons<T extends string>({
  options,
  current,
  onChange,
  ascending,
  onToggleOrder,
}: SortButtonsProps<T>) {
  const { containerRef, pillRef } = useSlidingPill(current);

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">Sort by</span>
      <div ref={containerRef} className="pill-track">
        <span ref={pillRef} className="pill-indicator" aria-hidden="true" />
        {options.map((opt) => (
          <button
            key={opt.value}
            data-pill-key={opt.value}
            aria-current={current === opt.value}
            onClick={() => onChange(opt.value)}
            className="pill-item px-3 sm:px-3.5 py-1.5 text-[13px] sm:text-sm"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {onToggleOrder && (
        <>
          <div className="flex-1" />
          <button
            onClick={onToggleOrder}
            className="btn btn-glass w-9 h-9"
            title={ascending ? "Ascending" : "Descending"}
            aria-label={ascending ? "Ascending" : "Descending"}
          >
            {ascending ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
          </button>
        </>
      )}
    </div>
  );
}
