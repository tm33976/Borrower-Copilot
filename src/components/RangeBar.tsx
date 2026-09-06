import type { Range } from "../engine/types";

/** A small horizontal bar showing low-to-high, with a confidence label.
 * Exists so "this is a range, not a point estimate" is visible at a
 * glance, not just implied by two numbers sitting next to each other --
 * the brief's rule 2 asks the app to actually show ranges as ranges. */
export function RangeBar({
  range,
  unit,
  format,
}: {
  range: Range;
  unit?: string;
  format?: (n: number) => string;
}) {
  const fmt = format ?? ((n: number) => n.toLocaleString("en-IN"));
  const confidenceColor =
    range.confidence === "high"
      ? "var(--accent)"
      : range.confidence === "medium"
      ? "var(--warn)"
      : "var(--danger)";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 font-[var(--mono)] text-sm">
        <span>
          {unit}
          {fmt(range.low)}
        </span>
        <span className="text-[var(--muted)] uppercase tracking-wide text-xs">
          {range.confidence} confidence
        </span>
        <span>
          {unit}
          {fmt(range.high)}
        </span>
      </div>
      <div className="h-1.5 mt-1.5 bg-[var(--rule)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ background: confidenceColor, width: "100%" }}
        />
      </div>
    </div>
  );
}
