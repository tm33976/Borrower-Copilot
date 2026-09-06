import type { BorrowerAnswers, Range } from "./types";
import {
  BASE_RATE_BAND_BY_PRODUCT,
  ASSUMED_PROCESSING_FEE_RANGE,
  CREDIT_SCORE_TIERS,
} from "./rules";
import { buildRange, needsExtraWidening } from "./confidence";
import { routeToProduct } from "./routing";

export interface FairRateResult {
  product: import("./types").LoanType;
  productChangedReason?: string;
  band: Range;
  allInApr: Range;
  reason: string;
  /** Set when the borrower told us a rate they were already quoted --
   * this is the exact scenario the brief's own example describes
   * ("lender quotes 14%, card says fair is 11-12.5%"). Surfaced
   * separately so the UI can show it prominently, not buried in prose. */
  offerComparison?: {
    quotedRate: number;
    verdict: "above-band" | "within-band" | "below-band";
    message: string;
  };
}

function creditScorePositionInBand(score: number | undefined): number {
  if (score === undefined) return 0.5;
  if (score >= CREDIT_SCORE_TIERS.excellent) return 0.1;
  if (score >= CREDIT_SCORE_TIERS.fair) return 0.5;
  return 0.85;
}

export function calculateFairRate(answers: BorrowerAnswers): FairRateResult {
  const { product, reasonIfChanged } = routeToProduct(answers);
  const base = BASE_RATE_BAND_BY_PRODUCT[product];

  const position = creditScorePositionInBand(answers.creditScore);
  const centerRate = base.low + (base.high - base.low) * position;

  const extraWidening = needsExtraWidening(answers);

  const band = buildRange(centerRate, (base.high - base.low) * 0.15, answers, {
    extraWidening,
  });
  band.low = Math.max(base.low - 1, band.low);
  band.high = Math.min(base.high + 2, band.high);

  const feeUpliftLow = ASSUMED_PROCESSING_FEE_RANGE.low * 100 * 0.6;
  const feeUpliftHigh = ASSUMED_PROCESSING_FEE_RANGE.high * 100 * 0.6;
  const allInApr: Range = {
    low: Math.round(band.low + feeUpliftLow),
    high: Math.round(band.high + feeUpliftHigh),
    confidence: band.confidence,
  };

  let reason = `${product.replace(
    /-/g,
    " "
  )} loans typically range ${base.low}-${base.high}%. `;
  if (answers.creditScore !== undefined) {
    reason += `Your credit score of ${answers.creditScore} pulls this toward the ${
      position < 0.4 ? "lower" : position > 0.6 ? "higher" : "middle"
    } end. `;
  } else {
    reason += `Credit score wasn't provided, so we've kept this centered rather than assuming the worst. `;
  }
  reason += `The all-in APR adds an assumed ${(
    ASSUMED_PROCESSING_FEE_RANGE.low * 100
  ).toFixed(1)}-${(ASSUMED_PROCESSING_FEE_RANGE.high * 100).toFixed(
    1
  )}% processing fee, amortised — always compare lenders on APR, not the headline rate alone.`;

  // The Negotiation Card's whole reason for existing, per the brief's
  // own example: a lender quotes X%, and the card should say plainly
  // whether that's fair, high, or actually a good deal against this
  // borrower's own band. This is the one place that comparison happens.
  let offerComparison: FairRateResult["offerComparison"];
  const quotedRate = answers.offerAlreadyReceivedRate;
  if (quotedRate !== undefined) {
    if (quotedRate > band.high) {
      offerComparison = {
        quotedRate,
        verdict: "above-band",
        message: `${quotedRate}% is above the fair range for your profile (${band.low}-${band.high}%) -- worth asking the lender what's driving the difference, or shopping the quote elsewhere.`,
      };
    } else if (quotedRate < band.low) {
      offerComparison = {
        quotedRate,
        verdict: "below-band",
        message: `${quotedRate}% is actually below our estimated fair range (${band.low}-${band.high}%) -- a genuinely good offer for your profile, worth taking seriously.`,
      };
    } else {
      offerComparison = {
        quotedRate,
        verdict: "within-band",
        message: `${quotedRate}% sits within the fair range for your profile (${band.low}-${band.high}%) -- reasonable, though you can still ask for the low end given your profile.`,
      };
    }
  }

  return {
    product,
    productChangedReason: reasonIfChanged,
    band,
    allInApr,
    reason,
    offerComparison,
  };
}