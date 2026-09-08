# WALKTHROUGH.md

## What this is

A self assessment tool for someone about to take out a loan in India. It asks a handful of questions, then gives back four things. Whether they should borrow at all, how much, at what rate, and what EMI to actually agree to, plus a one page card they could realistically hold up in a bank branch. No login, no backend, nothing saved anywhere. Everything happens in the browser from what someone types in.

## How it is put together

The logic and the interface do not touch each other. Everything that actually decides a number, the FOIR math, the rate bands, the verdict rules, lives in src/engine as plain TypeScript with zero UI code in it. The question flow lives separately in src/questions as data, not as three hardcoded forms. The components in src/components only ever display what the engine already worked out, they do not calculate anything themselves. I did this on purpose, mostly so that if I am asked to change a rule live, I know exactly which one file to open.

## What I would build next if I had more time

Real rate data instead of my own bands. Right now the interest rate ranges in rules.ts are reasonable, general figures I put together myself. A real version of this would pull from an actual rate card or a partner feed, and the processing fee assumption would come from real fee schedules instead of a stated range.

A better sense of confidence. Right now confidence is just a count of how many optional questions someone answered. It works, and it is easy to explain, but it treats every optional answer as equally important, which is not quite true. Knowing someone's collateral value probably matters more to their outcome than knowing their card utilisation does. A better version would weight questions by how much they actually move the specific output being shown.

A more realistic blend of collateral and income for secured loans. Right now, for a secured product, I take whichever number is bigger, what income alone supports, or what the collateral supports at a set loan to value. Real lenders blend the two more gradually. That is a known simplification, and it is written down as one in RULES.md rather than hidden.

Letting someone see why a number is what it is, right in the app. Every figure already has a one sentence reason attached to it, but you have to read RULES.md separately to see the actual threshold behind that reason. A small why this number link next to each output, pulling straight from the same file RULES.md is generated from, would make the app explain itself without needing a second document open.

## What I would cut if I ran short on time, not extend

The part of the Negotiation Card that refuses to hand someone a rate table when the verdict is don't borrow was one of the last things I built, and it is the one piece I would protect above almost everything else if I had to cut something. Shipping a card that hands someone negotiation numbers right underneath a verdict telling them not to borrow would be a real, visible contradiction, not a nice to have fix.

## Bugs I actually found while testing, not while writing

I want to be direct about this section, because I think how a bug gets found matters as much as the fix itself. Every one of these came from running real numbers through the app and checking the output critically, not from reading the code and assuming it was fine.

The collateral question was only shown to self employed and informal borrowers. It started out gated on income type, on the assumption that only a business owner would realistically have property to offer as security. That assumption does not hold up. A salaried person can own a flat or land just as easily, and the actual routing and affordability logic never cared about income type in the first place, only whether the question got asked. I caught this while checking my own question design against the brief's own rule that the app should be adaptive, not that it should silently skip things that do apply. Fixed by removing the income type condition entirely, so the question now shows for everyone.

The placeholder text was lying on required fields. Every number and currency input said skip if unsure, regardless of whether that field was actually optional. So someone filling in monthly household expenses, a required field, would see a placeholder telling them it was fine to leave blank, while the continue button stayed correctly disabled the whole time. Only credit score is genuinely optional. Fixed so the placeholder now reflects whether a field can actually be skipped, additional tier questions and credit score say skip if unsure, everything else says enter a number or enter an amount.

Ravi's collateral was not actually changing his sanctioned amount. Early on, the app correctly recommended a loan against property for him but still calculated his sanctioned amount purely from his income. The recommendation was correct in name but did not reflect the 45 lakh property behind it. Fixed by adding a loan to value ceiling that applies specifically to the lender's number, while keeping the borrower's own safe carry number tied strictly to income, since collateral does not change what someone can actually pay every month.

The projected loan return was claiming credit it had not earned. A question asks what extra income a loan might generate, meant to raise someone's safe borrowing number a little. It does, for most inputs. But for Ravi's specific numbers, his income based limit was already tighter than the one this feature affects, so the boost changed nothing in his case, yet the app was still writing a sentence claiming it had helped. Fixed so that explanation only appears when the number genuinely moved.

## A question I cut instead of fixing

An earlier version asked whether anyone would co apply on the loan. Without also collecting that person's income, which felt out of scope for a four day build, a plain yes or no could not honestly move any of the four outputs. The brief is explicit that a question with no effect should be cut rather than kept for the sake of it, so I removed it.

## What this does not try to do, on purpose

No real bureau pull, no machine learning, no attempt to cover every loan product that exists. The brief is explicit that none of that is being scored. Confidence is a blunt but explainable count of optional answers, not a weighted model. The stress test only covers an income drop, not a rate rise, since the brief allows either and a drop felt like the more realistic risk for these three profiles specifically.

This was built and tested in roughly the window the brief describes, in this order. Get the underlying logic right first and check it against all three people before writing a single line of UI, then build the actual question flow, then the interface, then go back and test it critically enough to find the four issues described above, then write these documents last, once I actually knew what the app did rather than what I had planned for it to do.