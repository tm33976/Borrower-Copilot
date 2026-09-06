# RULES.md

Every number this app shows you comes from somewhere in here. If you're reading this because you want to push back on a figure the app gave you, this is the right place to look, not the code, though the code and this file say the same thing on purpose.

I've tried to be honest about which of these numbers come from something real (a published FOIR convention, a typical LAP loan-to-value range) and which ones are just my own call, made because a decision had to be made and no single source settles it. Where it's my own judgement, I say so plainly instead of dressing it up as more authoritative than it is.

## Affordability, how much you can actually borrow

| What | Value | Why | Source |
|---|---|---|---|
| FOIR cap, salaried | 50% | This is the standard ceiling Indian lenders lean on for provable, stable income. | Common industry range (40–50%), not one lender's exact policy, my judgement, sitting inside that range. |
| FOIR cap, self-employed | 45% | Tighter than salaried, because the income is real but harder to verify cleanly, Ravi's case is the obvious example, where his ITR and his actual cash income don't match. | My judgement. |
| FOIR cap, informal | 35% | The tightest of the three. No formal income proof at all, and usually the most volatile income too. | My judgement. |
| Safe-carry buffer | 10 points below the FOIR cap | The number a bank's formula allows and the number a household can actually live with are two different questions. This buffer is what keeps them separate. | My judgement. |
| Which constraint wins for the safe number | Whichever is stricter: FOIR-with-buffer, or income minus EMIs minus real expenses | A lender's formula has no idea what someone actually spends on rent and groceries. Taking the tighter of the two is what makes the borrower's own number meaningfully different from the bank's. | My judgement, this is the whole mechanism behind Output 2 having two genuinely different numbers. |
| Loan-to-value for a property-backed loan | 60% of the property's value | For a secured loan, a lender often cares more about what the collateral is worth than about pay stubs. This is what makes routing someone to a secured product actually mean something in rupees. | Typical LAP LTV sits somewhere around 40–70% depending on the lender; 60% is a reasonable middle point, not a specific bank's number. |
| Loan-to-value for gold | 75% of the gold's value | Gold loans are treated more generously because the collateral is liquid and easy to value. | Typical range, influenced by regulatory guidance, not a live figure. |
| When collateral is enough to change the recommended product | Collateral worth 2x or more of the amount asked for | Below this, I don't think it's fair to override what someone actually asked for. Above it, a secured product is clearly the better deal, so it's worth saying so. | My judgement, deliberately conservative, since no lender lends anywhere close to 100% of an asset's value. |
| Stress test | Model income dropping 25%, existing EMIs and expenses held steady | The brief only asks for one stress case, and income dropping is the more realistic shock for the kind of borrower this tool is built for, informal or variable income shows up in two of the three personas. | My judgement. |
| Tenure cap for a suggested EMI | 84 months | Past this point, the interest paid usually isn't worth what you save on the monthly number. | My judgement. |
| Tenure assumed when estimating a max loan amount | 60 months | You can't turn a monthly headroom figure into a loan amount without picking some tenure. Five years felt like the least arbitrary default across the products in scope. | My judgement, stated here rather than buried in the code. |
| How much of a projected loan return counts toward affordability | 40% of what the borrower says the loan will earn them | If someone tells us a loan is going to generate extra income, Ravi's second stock line is exactly this, that's real information. But it hasn't happened yet, so I only count a portion of it, and only toward the borrower's own safe number, never the lender's. A lender isn't going to sanction against income that doesn't exist yet either. | My judgement. |

## Fair rate, what a decent deal actually looks like

| What | Value | Why | Source |
|---|---|---|---|
| Personal loan | 11–22% | A realistic-for-India spread. | General market knowledge, not a live feed. |
| Gold loan | 9–15% | Lower, because the loan is secured. | General market knowledge. |
| Loan against property | 9–13% | The cheapest band here, reflecting strong collateral and usually longer tenures. | General market knowledge. |
| Two-wheeler loan | 10–18% | | General market knowledge. |
| Business loan | 12–20% | | General market knowledge. |
| Credit score's effect on rate | 750+ pulls toward the cheap end, 650–749 sits in the middle, below 650 pulls toward the expensive end, and **not knowing your score sits in the middle too, not at the expensive end** | A missing score has to be treated as neutral, not as if it were a bad score. That's a direct rule from the brief, and this is where it's actually enforced. | My judgement. |
| Processing fee assumption | 1–2.5% of the loan amount | Used to turn a headline rate into something closer to what you'd actually pay. | Assumption, stated as one, a real product would pull this from a live rate card. |

## When someone already has a quote in hand

If a borrower tells us a rate they've already been quoted, the app compares it straight against the fair band it just calculated and tells them plainly whether it's high, fair, or genuinely good. This is the exact scenario the brief describes, a lender quotes 14%, and the card should be able to say whether that's actually fair for this person. I simplified this to one number (the best rate already offered) rather than a list of several named lenders, since collecting a structured list of offers felt like more UI than the four-day scope called for.

## The verdict, should you even borrow

| What | Value | Why | Source |
|---|---|---|---|
| Zero room left, full stop | If FOIR math leaves no safe monthly room at all | This is the clearest, least arguable "don't borrow" signal there is. No interpretation needed. | My judgement. |
| A recent bounced payment | One or more missed payments in the last six months | A recent bounce is something that already happened, not a hypothetical risk, which makes it a stronger signal than most of the others. | My judgement. |
| When "don't borrow" fires outright | Zero room, or two-or-more flags stacking together | I wanted the full stop reserved for genuine, current distress, not just "this is a bit tight." | My judgement. |
| When it softens to "borrow less" instead | Exactly one flag on its own | A single concern is worth flagging, but not necessarily worth blocking someone over. | My judgement. |
| Variable income with nothing in reserve | Income that swings a lot (50%+ variable) combined with under a month of savings | Either one alone is manageable. Together, a single bad month can genuinely break things. | My judgement, this is what actually produces Anita's outcome, and I tested it as its own case, separate from the bounce, to make sure it wasn't riding on the bounce alone. |

## Routing, which product actually fits

If someone's offered collateral worth at least twice what they're asking for, and they haven't already picked a secured product themselves, the app suggests loan against property instead and explains why. Otherwise it trusts whatever the person picked, defaulting to personal if nothing was chosen. This is the rule that gets Ravi routed correctly even though he asked for a "business loan," his shop, once mentioned, tells a better story than his declared income does.

## Assumptions I made filling in the three given profiles

The brief gives real numbers for Priya, Ravi, and Anita, but not every field the app asks for. Here's what I filled in myself, and why, rather than leaving it silent:

- **Priya**, I assumed 3 months of emergency savings. Nothing in the brief says this, but it felt like a reasonable guess for someone five years into a stable MNC job.
- **Ravi**, I used his ITR-declared income (~₹35,000/month) for the core math rather than his stated cash income range (₹40,000–80,000/month), because ITR is what a lender can actually verify. The app says this out loud in its own reasoning, and also notes that bank statements showing real cash flow could raise his numbers. I assumed ₹20,000/month household expenses and a ₹15,000/month return from the new stock line, neither of which the brief states directly.
- **Anita**, I assumed ₹20,000/month household expenses, again not stated. Her existing EMI of ₹3,500/month is a rough estimate against the ₹35,000 she's carrying across three app loans at 30%+ interest, since the brief doesn't give an exact repayment schedule.

## A question I cut

The brief is direct about this: if an additional question doesn't move a number, cut it. An earlier version of this app asked whether anyone would co-apply on the loan. Without also asking for that person's income, which felt like scope creep for a four-day build, a plain yes/no couldn't honestly change any of the four outputs. Rather than inventing a vague effect just to justify keeping the question, I removed it.

## What I know this doesn't cover

- The rate bands and the processing fee range are reasonable, general figures, not a live rate feed from any actual lender.
- Confidence is based on how many of the optional questions someone answered, not on how complete their mandatory answers are. Someone who fills in every required field but skips all the optional ones will still show "low confidence," which is a defensible rule, but one that can look a little odd if you're not expecting it.
- The stress test only models an income drop, not a rate rise, since the brief only asks for one and a drop felt like the more realistic shock for these three profiles.