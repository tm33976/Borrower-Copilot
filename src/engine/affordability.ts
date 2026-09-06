import type { BorrowerAnswers, Range, LoanType } from "./types";
import {
  FOIR_CAP_BY_INCOME_TYPE,
  SAFE_FOIR_BUFFER,
  COLLATERAL_TO_LOAN_ROUTING_MULTIPLE,
  SECURED_PRODUCT_LTV,
  PRODUCTIVE_LOAN_RETURN_DISCOUNT,
} from "./rules";
import { buildRange, needsExtraWidening } from "./confidence";

export interface MaxAmountResult {
  lenderWouldSanction: Range;
  borrowerCanSafelyCarry: Range;
  useThisOne: "lenderWouldSanction" | "borrowerCanSafelyCarry";
  reason: string;
  assumedTenureMonths: number;
}

function maxLoanFromMonthlyHeadroom(
  monthlyHeadroom: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (monthlyHeadroom <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  if (r === 0) return monthlyHeadroom * tenureMonths;
  const factor = Math.pow(1 + r, tenureMonths);
  return monthlyHeadroom * ((factor - 1) / (r * factor));
}

export function calculateMaxAmount(
  answers: BorrowerAnswers,
  assumedRatePercent: number,
  routedProduct: LoanType
): MaxAmountResult {
  const income = answers.netMonthlyIncome ?? 0;
  const existingEMIs = answers.existingMonthlyEMIs ?? 0;
  const incomeType = answers.incomeType ?? "self-employed";
  const householdExpenses = answers.monthlyHouseholdExpenses ?? 0;

  const foirCap = FOIR_CAP_BY_INCOME_TYPE[incomeType];
  const totalAllowedObligations = income * foirCap;
  const lenderMonthlyHeadroom = Math.max(
    0,
    totalAllowedObligations - existingEMIs
  );

  const safeCap = Math.max(0, foirCap - SAFE_FOIR_BUFFER);
  const safeAllowedObligations = income * safeCap;
  const safeHeadroomFromFoir = Math.max(
    0,
    safeAllowedObligations - existingEMIs
  );
  const actualDisposableIncome = Math.max(
    0,
    income - existingEMIs - householdExpenses
  );

  // If this loan is expected to directly generate income (Ravi's second
  // stock line is the canonical case), count a conservative fraction of
  // that projected return toward the borrower's own safe headroom. We
  // deliberately do NOT add this to the lender's number -- a lender
  // isn't going to sanction based on income the loan hasn't generated
  // yet, but the borrower themselves has real information here that
  // should move their own honest self-assessment.
  const productiveLoanBoost =
    answers.loanIsProductive && answers.expectedMonthlyReturnFromLoan
      ? answers.expectedMonthlyReturnFromLoan * PRODUCTIVE_LOAN_RETURN_DISCOUNT
      : 0;

  // The borrower's real ceiling is the STRICTER of the two views --
  // FOIR-with-buffer, or what's actually left after real expenses --
  // with the productive-loan boost added to the expense-based view only,
  // since that's the view it's actually relevant to.
  const borrowerMonthlyHeadroom = Math.min(
    safeHeadroomFromFoir,
    actualDisposableIncome + productiveLoanBoost
  );

  // Only true if the boost actually changed the binding constraint. If
  // FOIR was already tighter than the expense-based view, adding
  // projected income here makes no real difference -- the reasoning
  // text needs to stay silent rather than falsely claim credit for a
  // number that didn't actually move.
  const productiveLoanBoostActuallyMattered =
    productiveLoanBoost > 0 &&
    borrowerMonthlyHeadroom >
      Math.min(safeHeadroomFromFoir, actualDisposableIncome);

  const tenureMonths = 60; // 5-year assumption for a "max amount" estimate; stated in RULES.md

  const lenderCenterFromIncome = maxLoanFromMonthlyHeadroom(
    lenderMonthlyHeadroom,
    assumedRatePercent,
    tenureMonths
  );
  const borrowerCenter = maxLoanFromMonthlyHeadroom(
    borrowerMonthlyHeadroom,
    assumedRatePercent,
    tenureMonths
  );

  const ltvRate = SECURED_PRODUCT_LTV[routedProduct];
  const ltvCeiling =
    ltvRate !== undefined ? (answers.collateralValue ?? 0) * ltvRate : 0;
  const lenderCenter = Math.max(lenderCenterFromIncome, ltvCeiling);
  const lenderNumberDrivenByCollateral = ltvCeiling > lenderCenterFromIncome;

  const lenderWouldSanction = buildRange(
    lenderCenter,
    lenderCenter * 0.15,
    answers,
    { extraWidening: needsExtraWidening(answers) }
  );
  const borrowerCanSafelyCarry = buildRange(
    borrowerCenter,
    borrowerCenter * 0.15,
    answers,
    { extraWidening: needsExtraWidening(answers) }
  );

  const collateralCoversRequest =
    (answers.collateralValue ?? 0) >=
    (answers.amountWanted ?? 0) * COLLATERAL_TO_LOAN_ROUTING_MULTIPLE;

  const useThisOne: "lenderWouldSanction" | "borrowerCanSafelyCarry" =
    "borrowerCanSafelyCarry";

  let reason = `Based on ₹${income.toLocaleString(
    "en-IN"
  )}/month income, ${(foirCap * 100).toFixed(
    0
  )}% FOIR cap for ${incomeType} income, minus existing EMIs of ₹${existingEMIs.toLocaleString(
    "en-IN"
  )}.`;
  if (lenderNumberDrivenByCollateral) {
    reason += ` Because this is a secured loan, the lender-sanction figure is driven mainly by your collateral value (at a typical ${(
      (ltvRate ?? 0) * 100
    ).toFixed(
      0
    )}% loan-to-value), not by your declared income alone — that's the real advantage of using the property. But the amount you can SAFELY carry is still based on what your income can service every month, which is why these two numbers are further apart than usual. If your actual cash income exceeds what's on your ITR, providing bank statements showing consistent cash flow could raise the safe-carry number too.`;
  } else if (collateralCoversRequest) {
    reason +=
      " Your property collateral significantly exceeds what's needed to secure this amount, which is why a secured product (loan against property) is worth considering over an unsecured personal loan.";
  }
  if (householdExpenses > 0) {
    reason += ` The safer figure also accounts for your stated household expenses of ₹${householdExpenses.toLocaleString(
      "en-IN"
    )}/month, not just the bank's formula.`;
  }
  if (productiveLoanBoostActuallyMattered) {
    reason += ` Since you expect this loan to generate roughly ₹${(
      answers.expectedMonthlyReturnFromLoan ?? 0
    ).toLocaleString(
      "en-IN"
    )}/month in extra income, we've counted ${(
      PRODUCTIVE_LOAN_RETURN_DISCOUNT * 100
    ).toFixed(
      0
    )}% of that toward what you can safely carry, conservative because it's projected, not yet proven.`;
  }

  return {
    lenderWouldSanction,
    borrowerCanSafelyCarry,
    useThisOne,
    reason,
    assumedTenureMonths: tenureMonths,
  };
}