import type { BorrowerAnswers, LoanType } from "./types";
import { COLLATERAL_TO_LOAN_ROUTING_MULTIPLE } from "./rules";

// This file exists separately from rate.ts and affordability.ts because
// routing has to happen FIRST -- you can't pick a fair rate band or an
// affordability formula without knowing which product you're actually
// talking about. Ravi never explicitly says "give me a loan against
// property" -- he says he wants ₹15L and mentions, almost in passing,
// that he owns his shop outright. Catching that and routing him correctly
// is most of what "domain reasoning" is testing.

/**
 * Decides which product this borrower's answers actually point to. The
 * borrower's own stated loanType is a starting point, not the final
 * answer -- if their collateral tells a different, better story, we say
 * so and explain why, rather than silently overriding what they typed.
 */
export function routeToProduct(answers: BorrowerAnswers): {
  product: LoanType;
  reasonIfChanged?: string;
} {
  const stated = answers.loanType;
  const amount = answers.amountWanted ?? 0;
  const collateral = answers.collateralValue ?? 0;

  // If they've offered property collateral worth well more than what
  // they're asking for, and they haven't already told us they want a
  // specific unsecured product, a secured LAP product is both cheaper
  // and more achievable than what an unsecured FOIR cap alone would
  // support. This is the exact shape of Ravi's case.
  const collateralStronglyCoversRequest =
    collateral >= amount * COLLATERAL_TO_LOAN_ROUTING_MULTIPLE;

  if (
    collateralStronglyCoversRequest &&
    stated !== "loan-against-property"
  ) {
    return {
      product: "loan-against-property",
      reasonIfChanged: `You mentioned property worth more than ${COLLATERAL_TO_LOAN_ROUTING_MULTIPLE}x what you're asking for — a loan against that property will likely get you a lower rate and a higher sanctioned amount than an unsecured loan would.`,
    };
  }

  // Otherwise, trust what they told us, falling back to "personal" as
  // the most generic unsecured product if they haven't said.
  return { product: stated ?? "personal" };
}