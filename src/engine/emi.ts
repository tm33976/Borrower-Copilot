import type { BorrowerAnswers, Range } from "./types";
import { STRESS_TEST_INCOME_DROP_FRACTION, SAFE_FOIR_BUFFER, FOIR_CAP_BY_INCOME_TYPE } from "./rules";
import { buildRange, needsExtraWidening } from "./confidence";

// Output 4 is the number a borrower actually agrees to every month, plus
// one honest check: does this EMI still work if things go wrong. The
// brief specifically asks for a stress case (income drop or rate rise) --
// I picked income drop, since the personas here (especially Anita) are
// exactly the profile where variable income is the realistic risk, more
// so than a rate change on what's likely a fixed-rate personal loan.

export interface EmiCeilingResult {
  monthlyCeiling: Range;
  suggestedTenureMonths: number;
  stressCase: {
    description: string;
    wouldStillHold: boolean;
  };
  reason: string;
}

export function calculateEmiCeiling(
  answers: BorrowerAnswers,
  safeMonthlyHeadroomCenter: number
): EmiCeilingResult {
  const extraWidening = needsExtraWidening(answers);

  // The EMI ceiling IS the safe monthly headroom we already calculated
  // for affordability -- reusing that number rather than recomputing it
  // from scratch keeps Output 2 and Output 4 consistent with each other,
  // which matters because a borrower will notice if the app tells them
  // two different "safe" numbers that don't agree.
  const monthlyCeiling = buildRange(
    safeMonthlyHeadroomCenter,
    safeMonthlyHeadroomCenter * 0.1,
    answers,
    { extraWidening }
  );

  // Tenure suggestion: longer tenure lowers the EMI but raises total
  // interest paid. We suggest the shortest tenure that keeps the EMI at
  // or under the ceiling, using a flat approximation good enough for a
  // "suggestion," not a binding number -- exact tenure is a lender
  // negotiation, which the Negotiation Card exists to support.
  const amountWanted = answers.amountWanted ?? 0;
  const roughMonthlyAtCeiling = monthlyCeiling.high || 1;
  const suggestedTenureMonths = Math.min(
    84, // cap at 7 years; beyond this, total interest usually makes the loan a bad idea regardless of EMI comfort
    Math.max(12, Math.ceil(amountWanted / roughMonthlyAtCeiling))
  );

  // Stress test: model the ceiling if income dropped by the assumed
  // fraction, holding existing EMIs and expenses fixed (those don't
  // shrink just because income does -- if anything they're stickier).
  const income = answers.netMonthlyIncome ?? 0;
  const existingEMIs = answers.existingMonthlyEMIs ?? 0;
  const householdExpenses = answers.monthlyHouseholdExpenses ?? 0;
  const incomeType = answers.incomeType ?? "self-employed";
  const foirCap = FOIR_CAP_BY_INCOME_TYPE[incomeType] - SAFE_FOIR_BUFFER;

  const stressedIncome = income * (1 - STRESS_TEST_INCOME_DROP_FRACTION);
  const stressedAllowedObligations = stressedIncome * foirCap;
  const stressedHeadroom = Math.max(
    0,
    Math.min(
      stressedAllowedObligations - existingEMIs,
      stressedIncome - existingEMIs - householdExpenses
    )
  );
  const proposedEmi = monthlyCeiling.high;
  const wouldStillHold = stressedHeadroom >= proposedEmi;

  const description = `If your income dropped ${(
    STRESS_TEST_INCOME_DROP_FRACTION * 100
  ).toFixed(
    0
  )}% (e.g. reduced hours, a slow season, or a client lost), your safe monthly room would be about ₹${Math.round(
    stressedHeadroom
  ).toLocaleString("en-IN")} — ${
    wouldStillHold
      ? "the suggested EMI would still fit."
      : "the suggested EMI would no longer comfortably fit, so treat this ceiling as tight, not comfortable."
  }`;

  const reason = `This ceiling is the same safe monthly headroom used in your maximum-amount estimate, so the two numbers stay consistent. Suggested tenure is the shortest that keeps the EMI at or under this ceiling, up to a 7-year cap.`;

  return {
    monthlyCeiling,
    suggestedTenureMonths,
    stressCase: { description, wouldStillHold },
    reason,
  };
}