export const FOIR_CAP_BY_INCOME_TYPE = {
  salaried: 0.5,
  "self-employed": 0.45,
  informal: 0.35,
} as const;

export const SAFE_FOIR_BUFFER = 0.1;

export const UNKNOWN_CREDIT_SCORE_PENALTY_BAND_WIDENING = 1;

export const BASE_RATE_BAND_BY_PRODUCT: Record<string, { low: number; high: number }> = {
  personal: { low: 11, high: 22 },
  gold: { low: 9, high: 15 },
  "loan-against-property": { low: 9, high: 13 },
  "two-wheeler": { low: 10, high: 18 },
  business: { low: 12, high: 20 },
};

export const ASSUMED_PROCESSING_FEE_RANGE = { low: 0.01, high: 0.025 };

export const CREDIT_SCORE_TIERS = {
  excellent: 750,
  fair: 650,
} as const;

export const STRESS_TEST_INCOME_DROP_FRACTION = 0.25;

export const COLLATERAL_TO_LOAN_ROUTING_MULTIPLE = 2;

export const SECURED_PRODUCT_LTV: Partial<Record<string, number>> = {
  "loan-against-property": 0.6,
  gold: 0.75,
};

/**
 * A recent bounced payment is one of the strongest real-world signals
 * that a borrower is already overstretched. If pastBounces is at or
 * above this count, the engine leans hard toward "don't borrow" or
 * "borrow less" -- this is Anita's case, and getting this rule right is
 * most of what makes her "borrow less" verdict defensible rather than
 * arbitrary.
 */
export const BOUNCE_COUNT_FLAGGING_THRESHOLD = 1;

/**
 * If a loan is productive (expected to directly generate extra income --
 * Ravi's second stock line is the canonical case) and the borrower gives
 * an expected monthly return, we count only this fraction of it toward
 * their safe monthly headroom. This is deliberately conservative: it's
 * projected, unrealized income, not a payslip. Counting all of it would
 * treat a hopeful estimate the same as proven income; counting none of
 * it would ignore real information the borrower gave us on purpose,
 * which is exactly the kind of question the brief says should "earn its
 * place" by moving a number. 40% is a judgement call, not derived from
 * a published source -- stated plainly here and in RULES.md.
 */
export const PRODUCTIVE_LOAN_RETURN_DISCOUNT = 0.4;
