import type { AssessmentResult, BorrowerAnswers } from "./types";
import { calculateFairRate } from "./rate";
import { calculateMaxAmount } from "./affordability";
import { calculateEmiCeiling } from "./emi";
import { calculateVerdict } from "./verdict";
import { listUnknowns } from "./confidence";
import { PRODUCTIVE_LOAN_RETURN_DISCOUNT } from "./rules";

export function runAssessment(answers: BorrowerAnswers): AssessmentResult {
  const rateResult = calculateFairRate(answers);
  const assumedRateForAffordability =
    (rateResult.band.low + rateResult.band.high) / 2;

  const maxAmountResult = calculateMaxAmount(
    answers,
    assumedRateForAffordability,
    rateResult.product
  );

  const income = answers.netMonthlyIncome ?? 0;
  const existingEMIs = answers.existingMonthlyEMIs ?? 0;
  const householdExpenses = answers.monthlyHouseholdExpenses ?? 0;
  const incomeType = answers.incomeType ?? "self-employed";
  const foirCapSafe =
    incomeType === "salaried" ? 0.4 : incomeType === "self-employed" ? 0.35 : 0.25;
  const productiveLoanBoost =
    answers.loanIsProductive && answers.expectedMonthlyReturnFromLoan
      ? answers.expectedMonthlyReturnFromLoan * PRODUCTIVE_LOAN_RETURN_DISCOUNT
      : 0;
  const safeMonthlyHeadroom = Math.max(
    0,
    Math.min(
      income * foirCapSafe - existingEMIs,
      income - existingEMIs - householdExpenses + productiveLoanBoost
    )
  );

  const emiResult = calculateEmiCeiling(answers, safeMonthlyHeadroom);
  const verdictResult = calculateVerdict(answers, safeMonthlyHeadroom);

  return {
    verdict: verdictResult,
    maxAmount: {
      lenderWouldSanction: maxAmountResult.lenderWouldSanction,
      borrowerCanSafelyCarry: maxAmountResult.borrowerCanSafelyCarry,
      useThisOne: maxAmountResult.useThisOne,
      reason: maxAmountResult.reason,
    },
    fairRate: {
      band: rateResult.band,
      allInApr: rateResult.allInApr,
      reason:
        rateResult.reason +
        (rateResult.productChangedReason
          ? ` ${rateResult.productChangedReason}`
          : ""),
      offerComparison: rateResult.offerComparison,
    },
    emiCeiling: {
      monthlyCeiling: emiResult.monthlyCeiling,
      suggestedTenureMonths: emiResult.suggestedTenureMonths,
      stressCase: emiResult.stressCase,
      reason: emiResult.reason,
    },
    recommendedProduct: rateResult.product,
    stillUnknown: listUnknowns(answers),
  };
}