# RUNTHROUGHS.md

What each of the three borrowers was actually asked, what they answered, and exactly what the app told them. Every number below came straight out of a real run of the app against the data in `src/personas.ts`, nothing here is typed in by hand or estimated after the fact.

---

## Priya, 29, Bengaluru, salaried

She wants ₹8,00,000 for a wedding.

**What she was asked and answered:**
Loan purpose, wedding. Loan type, personal. Amount, ₹8,00,000. Income type, salaried. Net monthly income, ₹1,10,000. Existing EMIs, ₹14,000 (her car loan). Household expenses, ₹28,000 (rent). Age, 29. Credit score, 780.

On the optional screen she answered two things: five years at her current job, and three months of savings held in reserve. Because she's salaried, the app never even asked her about variable income, collateral, or whether the loan would earn her anything, those questions only show up for self-employed or informal borrowers.

**What the app told her:**

| | |
|---|---|
| Should she borrow | **Borrow.** Her income and existing obligations comfortably support this at a sustainable EMI. |
| A lender would likely sanction | ₹13,85,016 – ₹22,59,763 |
| She can safely carry (the one to use) | ₹10,13,426 – ₹16,53,485 |
| Recommended product | Personal |
| Headline rate | 10–15% |
| All-in APR | 11–17% |
| EMI to agree to | ₹25,200 – ₹34,800 |
| Suggested tenure | 23 months |
| Still unknown | Payment history |

**The stress test caught something real:** if her income dropped 25%, her safe room falls to about ₹19,000 a month, below the EMI the app just suggested. So the app flags this ceiling as tight, not comfortable, rather than pretending everything's fine.

**Negotiation card:** wedding, ₹8,00,000, fair rate 10–15%, all-in APR 11–17%, max EMI ₹34,800, personal loan.

**Why this holds up:** both her requested amount and a comfortable EMI sit well inside what her income supports, even on the more conservative of the two numbers. Her 780 score pulls the rate toward the cheap end of the band. The one honest caveat is the stress test, she's borrowing close enough to her ceiling that a real income shock would make this uncomfortable, and the app says so instead of glossing over it.

---

## Ravi, 42, Mysuru, self-employed

He wants ₹15,00,000 for a second stock line and a delivery vehicle. This is the persona that actually tests whether the app understands what it's doing.

**What he was asked and answered:**
Purpose, second stock line and delivery vehicle. Loan type, business. Amount, ₹15,00,000. Income type, self-employed. Net monthly income, ₹35,000, his ITR figure, not his cash income (more on this below). Existing EMIs, ₹0. Household expenses, ₹20,000 (assumed, not in the brief). Age, 42. Credit score, skipped.

On the optional screen: 14 years running the business, ₹45,00,000 in unencumbered property offered as security, yes the loan will help him earn more, and ₹15,000/month expected from it.

**What the app told him:**

| | |
|---|---|
| Should he borrow | **Borrow.** |
| A lender would likely sanction | ₹20,68,200 – ₹33,31,800 |
| He can safely carry (the one to use) | ₹4,31,576 – ₹6,95,254 |
| Recommended product | **Loan against property**, the app overrode "business loan," which is what he actually picked |
| Headline rate | 10–12% |
| All-in APR | 11–14% |
| EMI to agree to | ₹10,339 – ₹14,161 |
| Suggested tenure | 84 months (the cap) |
| Still unknown | Credit score, payment history, emergency savings |

**Two things had to go right here, and both did.**

First, routing. He said "business loan," but with a ₹45L shop backing a ₹15L request, the app recognises that a secured product would serve him far better and switches the recommendation, explaining exactly why.

Second, and this is the part that actually matters: the two amount numbers are genuinely far apart, and the app tells you why instead of leaving you to guess. His lender-sanction figure (₹20.7L–₹33.3L) comfortably covers what he's asking for, because it's driven by his property at a 60% loan-to-value, not by his declared income. But his safe-carry number (₹4.3L–₹6.9L) stays strictly tied to what his actual income can service, because a bigger number on paper doesn't change what he can pay every month. The app says this directly: *"the amount you can SAFELY carry is still based on what your income can service every month, which is why these two numbers are further apart than usual."* It also points out that his real cash income (₹40–80K per the brief) is higher than what's on his ITR, and that documenting it with bank statements could genuinely raise his safe number.

**Worth noting:** he also told us the loan would earn him roughly ₹15,000 extra a month, which the app does account for, but in his specific numbers, it doesn't end up changing anything, because his income-based limit is already tighter than his expense-based one. The app knows this and doesn't claim credit for a change that didn't happen. If his expected return were larger, or his expenses lower, it would show up.

**Negotiation card:** second stock line and delivery vehicle, ₹15,00,000, fair rate 10–12%, all-in APR 11–14%, max EMI ₹14,161, loan against property.

---

## Anita, 35, Hubballi, informal

She wants ₹1,50,000 for an electric scooter to double her delivery runs.

**What she was asked and answered:**
Purpose, electric scooter for delivery. Loan type, two-wheeler. Amount, ₹1,50,000. Income type, informal. Net monthly income, ₹28,000. Existing EMIs, ₹3,500 (a rough estimate against the ₹35,000 she's carrying across three app loans, the brief doesn't give an exact schedule). Household expenses, ₹20,000 (assumed). Age, 35. Credit score, skipped.

On the optional screen: 60% of her income varies month to month, one missed payment in the last six months, and zero months of savings in reserve.

**What the app told her:**

| | |
|---|---|
| Should she borrow | **Don't borrow, not yet.** |
| A lender would likely sanction | ₹2,07,398 – ₹3,34,112 |
| She can safely carry (the one to use) | ₹1,15,221 – ₹1,85,618 |
| Recommended product | Two-wheeler |
| Headline rate | 12–16% |
| All-in APR | 13–18% |
| EMI to agree to | ₹2,954 – ₹4,046 |
| Stress test | If her income dropped 25%, her safe room falls to **₹0** |
| Still unknown | Credit score, how long her income has been stable |

**Because the verdict is "don't borrow," she doesn't get a rate/EMI table to walk into a lender with**, handing her one would directly contradict the advice the app just gave. Instead the card repeats the reasoning in a shorter form and tells her to come back once things change.

**Why the verdict lands here:** on the numbers alone, there's technically still some room, the ranges above aren't zero. But the app looks past the raw affordability math and picks up on two real behavioural signals: a payment that's already bounced, and income that swings heavily with nothing in reserve to absorb a bad month. Either one on its own might only soften the recommendation. Together, the app treats them as a genuine, current warning sign rather than something a bigger loan would fix, and says so plainly instead of hiding behind a number that technically still allows it.

This is also the case that proves "don't borrow" is a real, reachable outcome in this app, not just a label that exists in the code but never actually fires.