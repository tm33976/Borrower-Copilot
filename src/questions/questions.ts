import type { BorrowerAnswers } from "../engine/types";

// The brief's rule 1 is "adaptive a salaried IT employee and a kirana
// owner should not see the same 30 questions." Rather than writing three
// separate hardcoded forms (which is what plain HTML/JS would tempt you
// into under time pressure), each question here carries a `showIf`
// function. The UI just filters this list against the current answers on
// every render -- that's the entire adaptive mechanism, in one place,
// rather than scattered if/else branches across components.
//
// The brief's rule 2 is also encoded structurally here: every question in
// the ADDITIONAL list has a one-line comment saying which output it
// exists to tighten. If I can't write that comment honestly for a
// question, it doesn't belong in this file -- that's the actual
// discipline the brief is asking for, not just a nice idea.

export type QuestionType =
  | "text"
  | "number"
  | "single-select"
  | "boolean"
  | "currency";

export interface Question {
  id: keyof BorrowerAnswers;
  tier: "must" | "additional";
  /** Whether this question blocks moving past the must-tier stage if
   * left blank. Separate from `tier` on purpose: credit score is asked
   * in the must tier (it's a baseline question) but is NOT required --
   * "I don't know my score" has to be a completable, normal path through
   * the app, not something that silently blocks you from ever reaching
   * your results. Defaults to true for must-tier questions unless set
   * false explicitly below. */
  required?: boolean;
  label: string;
  helpText?: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  /** Only asked if this returns true given answers so far. Absent means
   * "always ask" (used by the must-tier baseline). */
  showIf?: (a: BorrowerAnswers) => boolean;
  /** Which output(s) this question exists to sharpen  documentation
   * for RULES.md and for me in the follow-up, not read by the app. */
  tightens: string;
}

export const QUESTIONS: Question[] = [
  // MUST: minimum to produce all four outputs
  {
    id: "purpose",
    tier: "must",
    label: "What's this loan for?",
    type: "text",
    tightens: "Context for the verdict and product routing.",
  },
  {
    id: "loanType",
    tier: "must",
    label: "What kind of loan are you thinking of?",
    type: "single-select",
    options: [
      { value: "personal", label: "Personal loan" },
      { value: "gold", label: "Gold loan" },
      { value: "loan-against-property", label: "Loan against property" },
      { value: "two-wheeler", label: "Two-wheeler loan" },
      { value: "business", label: "Business loan" },
    ],
    tightens: "Fair rate band, product routing.",
  },
  {
    id: "amountWanted",
    tier: "must",
    label: "How much do you want to borrow?",
    type: "currency",
    tightens: "All four outputs need this as a baseline.",
  },
  {
    id: "incomeType",
    tier: "must",
    label: "How do you earn?",
    type: "single-select",
    options: [
      { value: "salaried", label: "Salaried" },
      { value: "self-employed", label: "Self-employed / business owner" },
      { value: "informal", label: "Informal / gig / daily wage" },
    ],
    tightens: "Which FOIR cap and confidence-widening rules apply.",
  },
  {
    id: "netMonthlyIncome",
    tier: "must",
    label: "What's your net monthly income?",
    helpText: "Take-home, after tax. Your best estimate is fine.",
    type: "currency",
    tightens: "Affordability, EMI ceiling -- the core input for both.",
  },
  {
    id: "existingMonthlyEMIs",
    tier: "must",
    label: "Do you have any existing EMIs or loan payments?",
    helpText: "Enter 0 if none.",
    type: "currency",
    tightens: "How much headroom is left for a new EMI.",
  },
  {
    id: "monthlyHouseholdExpenses",
    tier: "must",
    label: "Roughly what do you spend monthly on rent, food, and bills?",
    type: "currency",
    tightens: "The borrower's safe-carry number, separate from the lender's FOIR view.",
  },
  {
    id: "age",
    tier: "must",
    label: "What's your age?",
    type: "number",
    tightens: "Sanity bound on tenure suggestions.",
  },
  {
    id: "creditScore",
    tier: "must",
    required: false,
    label: "Do you know your credit score?",
    helpText: "Skip this if you don't know it -- that's a normal answer, not a problem.",
    type: "number",
    tightens: "Position within the rate band. Skipped = neutral, not penalised.",
  },

  // ---------- ADDITIONAL: each one earns its place by tightening a number ----------
  {
    id: "incomeStabilityYears",
    tier: "additional",
    label: "How many years have you been at this job or running this business?",
    type: "number",
    showIf: () => true,
    tightens: "Confidence level -- longer stability narrows every range.",
  },
  {
    id: "variableIncomeShare",
    tier: "additional",
    label: "Roughly what share of your income varies month to month?",
    helpText: "0 if it's fully fixed, higher if it swings a lot.",
    type: "number",
    showIf: (a) => a.incomeType !== "salaried",
    tightens: "Verdict -- flags a 'borrow less' signal when paired with no savings.",
  },
  {
    id: "cardUtilisation",
    tier: "additional",
    label: "How much of your credit card limit do you typically use?",
    type: "number",
    showIf: (a) => a.incomeType === "salaried",
    tightens: "A secondary signal into confidence for salaried borrowers.",
  },
  {
    id: "pastBounces",
    tier: "additional",
    label: "Any missed or bounced EMI/bill payments in the last 6 months?",
    type: "number",
    showIf: () => true,
    tightens: "Verdict -- a strong, direct 'don't/less borrow' signal.",
  },
  {
    id: "emergencySavingsMonths",
    tier: "additional",
    label: "How many months of expenses do you have in savings?",
    type: "number",
    showIf: () => true,
    tightens: "Verdict and stress-case interpretation.",
  },
  {
    id: "collateralValue",
    tier: "additional",
    label: "Do you own any property or asset you could offer as security?",
    helpText: "Enter its rough market value, or skip if none.",
    type: "currency",
    showIf: () => true,
    tightens: "Product routing and the lender's sanction ceiling for secured products.",
  },
  {
    id: "upcomingLargeExpense",
    tier: "additional",
    label: "Any large expense coming up in the next year? (medical, education, etc.)",
    type: "currency",
    showIf: () => true,
    tightens: "Verdict -- stacks with a non-productive loan purpose.",
  },
  {
    id: "loanIsProductive",
    tier: "additional",
    label: "Will this loan directly help you earn more (stock, equipment, a vehicle for work)?",
    type: "boolean",
    showIf: (a) => a.incomeType !== "salaried",
    tightens: "Verdict -- a productive loan is judged differently than a discretionary one.",
  },
  {
    id: "expectedMonthlyReturnFromLoan",
    tier: "additional",
    label: "If yes, roughly how much extra could that bring in per month?",
    type: "currency",
    showIf: (a) => a.loanIsProductive === true,
    tightens: "Softens the verdict when the loan plausibly pays for itself.",
  },
  {
    id: "offerAlreadyReceivedRate",
    tier: "additional",
    label: "Has a lender already quoted you a rate?",
    helpText: "Enter the rate they quoted, as a percentage. Skip if not yet.",
    type: "number",
    showIf: () => true,
    tightens:
      "Compares directly against your fair rate band on the Negotiation Card -- this is the exact 'lender quotes 14%, fair is 11-12.5%' comparison.",
  },
];

export function getVisibleQuestions(
  answers: BorrowerAnswers,
  tier: "must" | "additional"
): Question[] {
  return QUESTIONS.filter(
    (q) => q.tier === tier && (q.showIf ? q.showIf(answers) : true)
  );
}