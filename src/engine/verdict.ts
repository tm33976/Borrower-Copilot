import type { BorrowerAnswers, Verdict } from "./types";
import { BOUNCE_COUNT_FLAGGING_THRESHOLD } from "./rules";

// This is the highest-stakes output in the app, and the brief is explicit
// that "don't borrow" has to be a real, reachable answer -- not a value
// that exists in the type system but never actually fires. This file is
// where I make sure it can fire, and exactly when.

export interface VerdictResult {
  value: Verdict;
  reason: string;
}

/**
 * Decides the verdict using a small set of explicit, named red flags
 * rather than one opaque score. Each flag is independently checkable and
 * independently explainable -- if asked "why did Anita get 'borrow
 * less,'" the answer is a specific flag, not "the model said so."
 */
export function calculateVerdict(
  answers: BorrowerAnswers,
  borrowerSafeMonthlyHeadroom: number
): VerdictResult {
  const amountWanted = answers.amountWanted ?? 0;
  const pastBounces = answers.pastBounces ?? 0;
  const emergencySavings = answers.emergencySavingsMonths;
  const variableShare = answers.variableIncomeShare ?? 0;
  const upcomingExpense = answers.upcomingLargeExpense ?? 0;

  const flags: string[] = [];

  // Flag 1: a recent bounced payment is a strong live signal of being
  // already overstretched, not a hypothetical risk.
  const hasRecentBounce = pastBounces >= BOUNCE_COUNT_FLAGGING_THRESHOLD;
  if (hasRecentBounce) {
    flags.push("a recent missed or bounced payment");
  }

  // Flag 2: no safe monthly headroom at all means the FOIR math itself
  // says there's no room for a new EMI, full stop -- this is the
  // strongest possible "don't borrow" signal, independent of anything
  // else.
  const noHeadroom = borrowerSafeMonthlyHeadroom <= 0;
  if (noHeadroom) {
    flags.push("no safe monthly room left after existing obligations");
  }

  // Flag 3: heavily variable income (gig, seasonal) stacked with zero
  // emergency savings is a combination, not either condition alone --
  // Anita's case specifically: unstable income AND nothing in reserve.
  const noBufferAgainstVariableIncome =
    variableShare >= 0.5 && (emergencySavings ?? 0) < 1;
  if (noBufferAgainstVariableIncome) {
    flags.push(
      "highly variable income with no emergency savings to absorb a bad month"
    );
  }

  // Flag 4: the request itself may simply be for a discretionary,
  // non-productive purpose (a wedding, e.g. Priya) while an upcoming
  // large expense is ALSO already on the horizon -- this doesn't block
  // borrowing on its own, it's a softer signal that tightens the verdict
  // toward "borrow less" rather than a full "don't."
  const stackedDiscretionaryExpense =
    upcomingExpense > 0 && answers.loanIsProductive === false;

  let value: Verdict;
  let reason: string;

  if (hasRecentBounce || noHeadroom) {
    // Two-flag-or-more, or either of the two hardest signals alone, is
    // enough for a full "don't borrow" -- these are the flags that
    // indicate real, current distress, not just tight-but-manageable
    // finances.
    if (flags.length >= 2 || noHeadroom) {
      value = "dont-borrow";
      reason = `We're not comfortable recommending this loan right now: ${flags.join(
        ", and "
      )}. Adding a new EMI on top of that risks a debt spiral rather than solving the immediate need. Consider addressing ${
        hasRecentBounce
          ? "the existing missed payment"
          : "the underlying cash flow gap"
      } first, or asking for a smaller amount specifically sized to what's left after that.`;
    } else {
      value = "borrow-less";
      reason = `A loan may still make sense, but not for the full ₹${amountWanted.toLocaleString(
        "en-IN"
      )} requested: ${flags.join(
        ", and "
      )}. We'd suggest scaling the amount down to something your safe monthly room can comfortably absorb — see the maximum amount below.`;
    }
  } else if (noBufferAgainstVariableIncome || stackedDiscretionaryExpense) {
    value = "borrow-less";
    const softFlags = [
      ...(noBufferAgainstVariableIncome
        ? ["variable income with no cushion"]
        : []),
      ...(stackedDiscretionaryExpense
        ? ["an upcoming large expense on top of this request"]
        : []),
    ];
    reason = `Borrowing is workable here, but we'd suggest a smaller amount than requested given ${softFlags.join(
      " and "
    )}. This keeps room in the budget for the unexpected.`;
  } else {
    value = "borrow";
    reason = `Your income, existing obligations, and stated buffers support this request at a sustainable EMI. See the amount and rate guidance below for the specific numbers to negotiate on.`;
  }

  return { value, reason };
}