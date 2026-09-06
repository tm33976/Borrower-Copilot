# WALKTHROUGH.md

## What this is

A self-assessment tool for someone about to take out a loan in India. It asks a handful of questions, then gives back four things: whether they should borrow at all, how much, at what rate, and what EMI to actually agree to, plus a one-page card they could realistically hold up in a bank branch. No login, no backend, nothing saved anywhere. Everything happens in the browser from what someone types in.

## How it's put together

The logic and the interface don't touch each other. Everything that actually decides a number, the FOIR math, the rate bands, the verdict rules, lives in `src/engine/` as plain TypeScript with zero UI code in it. The question flow lives separately in `src/questions/` as data, not as three hardcoded forms. The components in `src/components/` only ever display what the engine already worked out; they don't calculate anything themselves. I did this on purpose, mostly so that if I'm asked to change a rule live in the follow-up, I know exactly which one file to open.

## What I'd build next if I had more time

**Real rate data instead of my own bands.** Right now the interest rate ranges in `rules.ts` are reasonable, general figures I put together myself. A real version of this would pull from an actual rate card or a partner feed, and the processing fee assumption would come from real fee schedules instead of a stated range.

**A better sense of confidence.** Right now confidence is just a count of how many optional questions someone answered. It works, and it's easy to explain, but it treats every optional answer as equally important, which isn't quite true, knowing someone's collateral value probably matters more to their outcome than knowing their card utilisation does. A better version would weight questions by how much they actually move the specific output being shown.

**A more realistic blend of collateral and income for secured loans.** Right now, for a secured product, I take whichever number is bigger, what income alone supports, or what the collateral supports at a set loan-to-value. Real lenders blend the two more gradually. That's a known simplification, and it's written down as one in RULES.md rather than hidden.

**Letting someone see why a number is what it is, right in the app.** Every figure already has a one-sentence reason attached to it, but you have to read RULES.md separately to see the actual threshold behind that reason. A small "why this number" link next to each output, pulling straight from the same file RULES.md is generated from, would make the app explain itself without needing a second document open.

## What I'd cut if I ran short on time, not extend

The part of the Negotiation Card that refuses to hand someone a rate table when the verdict is "don't borrow" was the very last thing I built, and it's the one piece I'd protect above almost everything else if I had to cut something. Shipping a card that hands someone negotiation numbers right underneath a verdict telling them not to borrow would be a real, visible contradiction, not a nice-to-have fix.

## Something worth being upfront about

While building this, I initially added two of the optional questions, asking what a loan might earn someone, and asking whether they'd already been quoted a rate, without actually giving them any real effect on an output. They were being collected and counted toward the confidence level, but neither one could move any of the four numbers the app actually gives you. The brief is explicit about this: if a question doesn't move a number, cut it. So I went back and either gave each one a genuine, testable effect, or removed it outright.

In the process I also found a smaller, more specific bug worth mentioning directly: the "expected extra income from this loan" question was supposed to raise someone's safe borrowing number, and for most inputs it does, but for Ravi's exact numbers, it silently did nothing, because his income-based limit was already tighter than the one this boost affects. The app was still writing a sentence claiming credit for a change that hadn't actually happened. I fixed it so the explanation only appears when the number genuinely moved. I'm flagging this here rather than leaving it out, because catching it meant actually running the numbers and checking the output critically, not just reading the code and assuming it was fine, which is the same habit I'd want to bring to changing a rule live in front of you.

## A separate, real bug I caught while testing against Ravi's own numbers

Early on, the app correctly recommended a loan against property for Ravi but still calculated his sanctioned amount purely from his income, meaning the recommendation was correct in name but didn't actually reflect the ₹45L property behind it. I fixed this by adding a loan-to-value ceiling that applies specifically to the lender's number, while keeping the borrower's own safe-carry number tied strictly to income, since collateral doesn't change what someone can actually pay every month. I mention it here because I think how a bug like this gets found and fixed matters as much as the final answer, it came from running the numbers end to end and noticing they didn't add up, not from reading the code and assuming it was right.

## What this doesn't try to do, on purpose

No real bureau pull, no machine learning, no attempt to cover every loan product that exists, the brief is explicit that none of that is being scored. Confidence is a blunt but explainable count of optional answers, not a weighted model. The stress test only covers an income drop, not a rate rise, since the brief allows either and a drop felt like the more realistic risk for these three profiles specifically.

This was built and tested in roughly the window the brief describes, in this order: get the underlying logic right first and check it against all three people before writing a single line of UI, then build the actual question flow, then the interface, then go back and fix the two real issues described above, then write these three documents last, once I actually knew what the app did rather than what I'd planned for it to do.