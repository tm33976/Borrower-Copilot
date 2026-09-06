import type { BorrowerAnswers } from "./engine/types";

// The three borrowers from the brief, encoded once here so the app's
// demo buttons and RUNTHROUGHS.md are guaranteed to describe the exact
// same inputs -- I did not want a version drift where the doc says one
// thing and the live app shows another.
//
// A couple of fields needed a judgement call to translate the brief's
// prose into structured answers; each is commented at the point I made
// the call, so it's traceable rather than silently assumed.

export const PERSONAS: Record<string, BorrowerAnswers> = {
  Priya: {
    purpose: "wedding",
    amountWanted: 800000,
    loanType: "personal",
    netMonthlyIncome: 110000,
    incomeType: "salaried",
    existingMonthlyEMIs: 14000,
    monthlyHouseholdExpenses: 28000, // her stated rent; no other expenses given, so rent is used as a floor
    age: 29,
    creditScore: 780,
    incomeStabilityYears: 5,
    emergencySavingsMonths: 3, // not stated in the brief -- assumed reasonable for a 5-year MNC employee, flagged as an assumption in RULES.md
  },
  Ravi: {
    purpose: "second stock line and a delivery vehicle",
    amountWanted: 1500000,
    loanType: "business",
    // Brief gives cash income of ₹40k-80k/month AND ITR-declared income
    // of ₹4.2L/year (~₹35k/month). We use the declared/provable figure
    // for the core affordability math, since that's what a lender can
    // actually verify -- and say so directly in the reasoning text,
    // rather than quietly picking the more flattering cash-income number.
    netMonthlyIncome: 35000,
    incomeType: "self-employed",
    existingMonthlyEMIs: 0,
    monthlyHouseholdExpenses: 20000, // not stated; a conservative estimate for a family of this size, flagged in RULES.md
    age: 42,
    collateralValue: 4500000, // the shop, stated as unencumbered
    incomeStabilityYears: 14,
    loanIsProductive: true,
    expectedMonthlyReturnFromLoan: 15000, // not stated; a conservative estimate given a second stock line and delivery capability
  },
  Anita: {
    purpose: "electric scooter for delivery work",
    amountWanted: 150000,
    loanType: "two-wheeler",
    netMonthlyIncome: 28000,
    incomeType: "informal",
    // ₹35,000 outstanding at 30%+ across three app loans -- we estimate a
    // rough blended monthly EMI on that outstanding balance rather than
    // treating it as zero, since it's clearly a live obligation.
    existingMonthlyEMIs: 3500,
    monthlyHouseholdExpenses: 20000, // not stated; conservative estimate for a family of four on this income, flagged in RULES.md
    age: 35,
    pastBounces: 1,
    variableIncomeShare: 0.6,
    emergencySavingsMonths: 0,
  },
};
