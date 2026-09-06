import type { BorrowerAnswers, Range } from "./types";

// The brief's rule 2 is "confidence widens with silence, and the app says
// so." That means every single output has to know, separately, how much
// it's allowed to trust its own number. This file is the one place that
// decides that -- everything else (rate.ts, affordability.ts, emi.ts)
// asks this function "how wide should my range be" instead of each
// re-inventing its own guess at uncertainty.

function countAdditionalAnswersGiven(a: BorrowerAnswers): number {
  const additionalFields: (keyof BorrowerAnswers)[] = [
    "incomeStabilityYears",
    "variableIncomeShare",
    "cardUtilisation",
    "pastBounces",
    "emergencySavingsMonths",
    "collateralValue",
    "upcomingLargeExpense",
    "loanIsProductive",
    "expectedMonthlyReturnFromLoan",
    "offerAlreadyReceivedRate",
  ];
  return additionalFields.filter((field) => a[field] !== undefined).length;
}

export function getConfidenceLevel(
  answers: BorrowerAnswers
): "low" | "medium" | "high" {
  const given = countAdditionalAnswersGiven(answers);
  if (given >= 6) return "high";
  if (given >= 3) return "medium";
  return "low";
}

const WIDTH_MULTIPLIER: Record<"low" | "medium" | "high", number> = {
  low: 1.6,
  medium: 1.2,
  high: 1.0,
};

export function buildRange(
  center: number,
  baseHalfWidth: number,
  answers: BorrowerAnswers,
  options?: { floor?: number; extraWidening?: boolean }
): Range {
  const confidence = getConfidenceLevel(answers);
  let multiplier = WIDTH_MULTIPLIER[confidence];

  if (options?.extraWidening) {
    multiplier *= 1.3;
  }

  const halfWidth = baseHalfWidth * multiplier;
  const low = Math.max(options?.floor ?? 0, center - halfWidth);
  const high = center + halfWidth;

  return { low: Math.round(low), high: Math.round(high), confidence };
}

export function needsExtraWidening(answers: BorrowerAnswers): boolean {
  return (
    answers.creditScore === undefined &&
    (answers.incomeType === "informal" ||
      answers.incomeType === "self-employed")
  );
}

export function listUnknowns(answers: BorrowerAnswers): string[] {
  const unknowns: string[] = [];
  if (answers.creditScore === undefined) {
    unknowns.push("Credit score — treated as unknown, not as a low score.");
  }
  if (answers.pastBounces === undefined) {
    unknowns.push(
      "Payment history — we don't know about any missed payments."
    );
  }
  if (answers.emergencySavingsMonths === undefined) {
    unknowns.push(
      "Emergency savings — we don't know your safety buffer if income drops."
    );
  }
  if (
    answers.incomeType !== "salaried" &&
    answers.incomeStabilityYears === undefined
  ) {
    unknowns.push(
      "How long your income has been stable — widens every range until we know."
    );
  }
  return unknowns;
}