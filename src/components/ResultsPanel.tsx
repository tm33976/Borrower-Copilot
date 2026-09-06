import type { AssessmentResult } from "../engine/types";
import { RangeBar } from "./RangeBar";

const VERDICT_LABEL: Record<string, { text: string; tone: string }> = {
  borrow: { text: "Borrow", tone: "var(--accent)" },
  "borrow-less": { text: "Borrow less than requested", tone: "var(--warn)" },
  "dont-borrow": { text: "Don't borrow, not yet", tone: "var(--danger)" },
};

export function ResultsPanel({ result }: { result: AssessmentResult }) {
  const verdictStyle = VERDICT_LABEL[result.verdict.value];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">
          Should you borrow
        </p>
        <h2
          className="font-[var(--display)] text-3xl mb-2"
          style={{ color: verdictStyle.tone }}
        >
          {verdictStyle.text}
        </h2>
        <p className="text-[var(--ink)] leading-relaxed">
          {result.verdict.reason}
        </p>
      </section>

      <hr className="border-[var(--rule)]" />

      <section>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">
          Maximum amount
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-1">
              A lender would likely sanction
            </p>
            <RangeBar
              range={result.maxAmount.lenderWouldSanction}
              unit="₹"
            />
          </div>
          <div className="bg-[var(--accent-soft)] p-3 -mx-3">
            <p className="text-sm font-semibold mb-1">
              You can safely carry{" "}
              <span className="text-xs font-normal text-[var(--muted)]">
                (use this one)
              </span>
            </p>
            <RangeBar
              range={result.maxAmount.borrowerCanSafelyCarry}
              unit="₹"
            />
          </div>
        </div>
        <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
          {result.maxAmount.reason}
        </p>
      </section>

      <hr className="border-[var(--rule)]" />

      <section>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">
          Fair interest rate
        </p>
        <p className="text-sm text-[var(--muted)] mb-2 capitalize">
          Recommended product: {result.recommendedProduct.replace(/-/g, " ")}
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-1">Headline rate</p>
            <RangeBar range={result.fairRate.band} unit="" format={(n) => `${n}%`} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">
              All-in APR (with fees)
            </p>
            <RangeBar
              range={result.fairRate.allInApr}
              unit=""
              format={(n) => `${n}%`}
            />
          </div>
        </div>
        <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
          {result.fairRate.reason}
        </p>
        {result.fairRate.offerComparison && (
          <div
            className="mt-3 p-3 text-sm leading-relaxed font-medium"
            style={{
              background:
                result.fairRate.offerComparison.verdict === "above-band"
                  ? "var(--danger-soft)"
                  : result.fairRate.offerComparison.verdict === "below-band"
                  ? "var(--accent-soft)"
                  : "var(--warn-soft)",
            }}
          >
            {result.fairRate.offerComparison.message}
          </div>
        )}
      </section>

      <hr className="border-[var(--rule)]" />

      <section>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">
          EMI to agree to
        </p>
        <RangeBar
          range={result.emiCeiling.monthlyCeiling}
          unit="₹"
        />
        {result.emiCeiling.suggestedTenureMonths > 0 && (
          <p className="text-sm mt-2">
            Suggested tenure:{" "}
            <span className="font-[var(--mono)]">
              {result.emiCeiling.suggestedTenureMonths} months
            </span>
          </p>
        )}
        <div
          className="mt-3 p-3 text-sm leading-relaxed"
          style={{
            background: result.emiCeiling.stressCase.wouldStillHold
              ? "var(--accent-soft)"
              : "var(--warn-soft)",
          }}
        >
          {result.emiCeiling.stressCase.description}
        </div>
        <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
          {result.emiCeiling.reason}
        </p>
      </section>

      {result.stillUnknown.length > 0 && (
        <>
          <hr className="border-[var(--rule)]" />
          <section>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">
              What we're still guessing at
            </p>
            <ul className="space-y-1.5">
              {result.stillUnknown.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[var(--muted)] flex gap-2"
                >
                  <span style={{ color: "var(--warn)" }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}