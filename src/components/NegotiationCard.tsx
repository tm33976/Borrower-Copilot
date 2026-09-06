import type { AssessmentResult, BorrowerAnswers } from "../engine/types";

/**
 * The brief calls this out as a distinct deliverable, separate from the
 * four-output results panel: "one screen the borrower can hold up to a
 * lender." So it's deliberately terser and more scannable than
 * ResultsPanel -- a borrower isn't going to read paragraphs of reasoning
 * while sitting across from a loan officer, they need three or four
 * numbers they can say out loud.
 */
export function NegotiationCard({
  result,
  answers,
}: {
  result: AssessmentResult;
  answers: BorrowerAnswers;
}) {
  const rate = result.fairRate.band;
  const apr = result.fairRate.allInApr;

  // If the verdict is "don't borrow," handing over a rate/EMI table to
  // take into a branch would directly contradict the advice just given
  // above it -- a borrower shouldn't walk in ready to negotiate a loan
  // the app just told them not to take. This card has to agree with the
  // verdict, not just sit next to it.
  if (result.verdict.value === "dont-borrow") {
    return (
      <div className="bg-[var(--danger-soft)] border-2 border-[var(--danger)] p-6 max-w-md">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">
          Negotiation card
        </p>
        <p className="font-[var(--display)] text-lg mb-3">
          Not recommended right now
        </p>
        <p className="text-sm leading-relaxed text-[var(--ink)]">
          {result.verdict.reason}
        </p>
        <p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
          Once the flagged issues are addressed, come back through the
          questions again — the numbers here will update.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-raised)] border-2 border-[var(--ink)] p-6 max-w-md">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">
        Negotiation card
      </p>
      <p className="font-[var(--display)] text-lg mb-4">
        For a {answers.purpose || "loan"} of ₹
        {(answers.amountWanted ?? 0).toLocaleString("en-IN")}
      </p>

      {result.verdict.value === "borrow-less" && (
        <div className="bg-[var(--warn-soft)] px-3 py-2 mb-4 text-xs leading-relaxed">
          We suggested borrowing less than your original ask — see the
          safe-carry amount, not the full ₹
          {(answers.amountWanted ?? 0).toLocaleString("en-IN")}.
        </div>
      )}

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-[var(--rule)] pb-2">
          <dt className="text-[var(--muted)]">Fair rate for my profile</dt>
          <dd className="font-[var(--mono)] font-semibold">
            {rate.low}–{rate.high}%
          </dd>
        </div>
        <div className="flex justify-between border-b border-[var(--rule)] pb-2">
          <dt className="text-[var(--muted)]">All-in APR I'll accept</dt>
          <dd className="font-[var(--mono)] font-semibold">
            {apr.low}–{apr.high}%
          </dd>
        </div>
        <div className="flex justify-between border-b border-[var(--rule)] pb-2">
          <dt className="text-[var(--muted)]">Max EMI I'll agree to</dt>
          <dd className="font-[var(--mono)] font-semibold">
            ₹{result.emiCeiling.monthlyCeiling.high.toLocaleString("en-IN")}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--muted)]">Product I'm asking about</dt>
          <dd className="font-[var(--mono)] font-semibold capitalize">
            {result.recommendedProduct.replace(/-/g, " ")}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
        If quoted higher than {rate.high}%, ask what's driving the
        difference from this range before agreeing.
      </p>
    </div>
  );
}