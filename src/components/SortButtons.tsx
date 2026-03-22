"use client";

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
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="text-sm text-gray-400">Sort by:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            current === opt.value
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
      {onToggleOrder && (
        <>
          <div className="flex-1" />
          <button
            onClick={onToggleOrder}
            className="px-3 py-1.5 text-sm rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            title={ascending ? "Ascending" : "Descending"}
          >
            {ascending ? "↑" : "↓"}
          </button>
        </>
      )}
    </div>
  );
}
