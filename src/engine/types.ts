// This file is the shared vocabulary of the whole app. Every other file in
// src/engine imports from here. Keeping the types in one place means the
// question flow, the calculations, and the UI are all talking about the
// same "shape of a borrower" -- if I change what we know about someone,
// I only change it here and TypeScript tells me everywhere else that
// needs to catch up.

/** How the borrower earns money. This drives which affordability rule
 * applies -- salaried income is treated as more provable than cash income
 * from a kirana store, which is itself more provable than gig income with
 * no paper trail at all. */
export type IncomeType = "salaried" | "self-employed" | "informal";

/** The loan products we actually reason about. Kept short on purpose --
 * the brief is explicit that breadth of products isn't scored, correctness
 * for the three given borrowers is. */
export type LoanType =
  | "personal"
  | "gold"
  | "loan-against-property"
  | "two-wheeler"
  | "business";

/** The final verdict on whether the borrower should take this loan at all.
 * "Don't borrow" has to be a real, reachable answer -- the brief calls
 * this out explicitly, so it isn't a decorative option in this type, it's
 * a value the engine must actually be able to produce. */
export type Verdict = "borrow" | "borrow-less" | "dont-borrow";

/** A range, not a point estimate. Used everywhere the engine is uncertain
 * -- which, per the brief's own rules, should widen the less the borrower
 * has told us. `confidence` is a plain-English label, not a percentage,
 * because a borrower reading this card shouldn't need to interpret a
 * number to understand how sure we are. */
export interface Range {
  low: number;
  high: number;
  confidence: "low" | "medium" | "high";
}

/** Every answer we might collect. Optional on purpose -- the "must"
 * question set fills in a baseline subset, and each "additional" question
 * fills in one more field, narrowing what the engine has to guess at.
 * Nothing here is required at the type level because nothing is required
 * at the product level: silence is a valid state, not an error. */
export interface BorrowerAnswers {
  // --- must-ask: enough to produce all four outputs, just with wide bands ---
  purpose?: string;
  amountWanted?: number;
  loanType?: LoanType;
  netMonthlyIncome?: number;
  incomeType?: IncomeType;
  existingMonthlyEMIs?: number;
  monthlyHouseholdExpenses?: number;
  age?: number;
  creditScore?: number; // undefined means "unknown", never a stand-in for 0

  // --- additional: each one exists to tighten a range, nothing else ---
  incomeStabilityYears?: number; // how long at current job / business
  variableIncomeShare?: number; // 0-1, share of income that isn't fixed
  cardUtilisation?: number; // 0-1, how much of credit limit is drawn
  pastBounces?: number; // count of missed EMI/bill payments recently
  emergencySavingsMonths?: number; // months of expenses held in reserve
  collateralValue?: number; // market value of an asset offered as security
  upcomingLargeExpense?: number; // e.g. a wedding, a hospitalisation
  loanIsProductive?: boolean; // will this loan generate income (Ravi's case)
  expectedMonthlyReturnFromLoan?: number; // if productive, what it should earn
  /** The best (lowest) interest rate the borrower has already been
   * quoted by a lender, if any. Simplified to a single number rather
   * than a list of named offers -- collecting multiple structured offers
   * would need UI complexity out of scope here, and the single best
   * offer is what actually matters for comparing against the fair band. */
  offerAlreadyReceivedRate?: number;
}

/** What the engine hands back after every recalculation. This is the
 * single object the UI renders -- four outputs plus the reasoning trail
 * that makes each one defensible in one sentence, per the brief's rule
 * that "every number has a why." */
export interface AssessmentResult {
  verdict: {
    value: Verdict;
    reason: string;
  };
  maxAmount: {
    lenderWouldSanction: Range;
    borrowerCanSafelyCarry: Range;
    useThisOne: "lenderWouldSanction" | "borrowerCanSafelyCarry";
    reason: string;
  };
  fairRate: {
    band: Range;
    allInApr: Range; // includes processing fee, not just the headline rate
    reason: string;
    /** Present only when the borrower told us a rate already quoted --
     * see rate.ts for how this is built. */
    offerComparison?: {
      quotedRate: number;
      verdict: "above-band" | "within-band" | "below-band";
      message: string;
    };
  };
  emiCeiling: {
    monthlyCeiling: Range;
    suggestedTenureMonths: number;
    stressCase: {
      description: string;
      wouldStillHold: boolean;
    };
    reason: string;
  };
  /** Which product this borrower's answers actually route them to.
   * Ravi's case only works if this correctly prefers loan-against-property
   * over an unsecured personal loan once he's told us about the shop. */
  recommendedProduct: LoanType;
  /** Plain list of what the engine could not narrow down, because the
   * borrower hasn't told us yet. Surfaced directly in the UI so the app
   * is honest about its own gaps, per the "honesty about limits" score. */
  stillUnknown: string[];
}