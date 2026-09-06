# Borrower Copilot

A self-assessment tool for Indian borrowers, built for Lokta's Borrower Copilot build challenge. Answers four questions before you walk into a lender: should you borrow, how much, at what rate, and what EMI to agree to then hands you a one-page Negotiation Card.

No backend, no login, nothing stored. Everything runs in the browser from what you type in.

## Run it

```
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). That's it no environment variables, no backend to start, no database to seed.

Three "Load a persona" links in the header (Priya, Ravi, Anita) instantly fill in one of the three borrowers from the brief and jump straight to results, if you want to skip the question flow.

## The four required deliverables

1. **This app** - `npm run dev`, described above.
2. **[RULES.md](./RULES.md)** - every threshold, band, and assumption in a table: what, value, why, source.
3. **[RUNTHROUGHS.md](./RUNTHROUGHS.md)** - Priya, Ravi, and Anita: the exact questions each was asked, their answers, and the exact output the app produced. Generated directly from the live engine, not hand-typed.
4. **[WALKTHROUGH.md](./WALKTHROUGH.md)** - what I'd build next, what I'd cut, and a real bug I caught and fixed while testing.

## How it's structured

```
src/
  engine/        pure TypeScript, zero UI imports -- every rule and calculation
    types.ts       shared vocabulary: BorrowerAnswers, AssessmentResult, Range
    rules.ts        every tunable constant, each with a comment explaining why
    confidence.ts    the mechanism that widens ranges when the borrower tells us less
    routing.ts       decides which loan product actually fits (this is what gets Ravi's case right)
    affordability.ts the lender-vs-borrower number split (Output 2)
    rate.ts          fair rate band + all-in APR (Output 3)
    emi.ts           EMI ceiling + stress test (Output 4)
    verdict.ts       borrow / borrow-less / don't-borrow (Output 1)
    index.ts         orchestrates all of the above into one AssessmentResult
  questions/
    questions.ts    the adaptive must/additional question list, as data
  components/       presentation only -- reads an AssessmentResult, computes nothing
  personas.ts       the three brief personas, shared by the app's demo buttons and RUNTHROUGHS.md
```

`engine/index.ts` is the one function the UI ever calls (`runAssessment(answers)`). Everything else is composed from there.

## Stack

React + TypeScript + Vite + Tailwind. No Next.js there's no backend requirement per the brief, so SSR and routing conventions would add complexity without buying anything here.

 Tushar Mishra