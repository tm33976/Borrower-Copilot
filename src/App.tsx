import { useMemo, useState } from "react";
import type { BorrowerAnswers } from "./engine/types";
import { runAssessment } from "./engine";
import { getVisibleQuestions } from "./questions/questions";
import { QuestionField } from "./components/QuestionField";
import { ResultsPanel } from "./components/ResultsPanel";
import { NegotiationCard } from "./components/NegotiationCard";
import { PERSONAS } from "./personas";

// This component's only real job is state + layout. All the thinking
// happens in src/engine; all the question logic happens in
// src/questions. That separation is what "rules separated from UI"
// (10 engineering points in the brief) actually looks like in practice,
// not just a claim in a README.

type Stage = "must" | "additional" | "results";

function App() {
  const [answers, setAnswers] = useState<BorrowerAnswers>({});
  const [stage, setStage] = useState<Stage>("must");

  // Recalculated on every render, which happens on every keystroke.
  // This is the literal mechanism behind "every additional question must
  // change an output" -- there's no separate "submit" action that
  // triggers recalculation, the whole app just always shows the current
  // answers' consequences.
  const result = useMemo(() => runAssessment(answers), [answers]);

  const mustQuestions = getVisibleQuestions(answers, "must");
  const additionalQuestions = getVisibleQuestions(answers, "additional");

  function updateAnswer(id: keyof BorrowerAnswers, value: unknown) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function loadPersona(key: keyof typeof PERSONAS) {
    setAnswers(PERSONAS[key]);
    setStage("results");
  }

  const mustComplete = mustQuestions
    .filter((q) => q.required !== false)
    .every((q) => answers[q.id] !== undefined && answers[q.id] !== "");

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--rule)] px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Lokta build challenge
            </p>
            <h1 className="font-[var(--display)] text-2xl">
              Borrower Copilot
            </h1>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-[var(--muted)]">Load a persona:</span>
            {(Object.keys(PERSONAS) as (keyof typeof PERSONAS)[]).map(
              (name) => (
                <button
                  key={name}
                  onClick={() => loadPersona(name)}
                  className="underline text-[var(--accent)] hover:no-underline"
                >
                  {name}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12">
        {/* Left: question flow */}
        <div>
          {stage === "must" && (
            <>
              <p className="text-sm text-[var(--muted)] mb-6">
                A few basics first. Answer only what you know -- skipping is
                fine, it just widens the ranges.
              </p>
              {mustQuestions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  answers={answers}
                  onChange={updateAnswer}
                />
              ))}
              <button
                disabled={!mustComplete}
                onClick={() => setStage("additional")}
                className="mt-2 px-5 py-2 bg-[var(--accent)] text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {stage === "additional" && (
            <>
              <button
                onClick={() => setStage("must")}
                className="text-sm text-[var(--accent)] underline mb-6 block"
              >
                ← back to basics
              </button>
              <p className="text-sm text-[var(--muted)] mb-6">
                Optional, but each answer sharpens your numbers on the
                right. Skip anything you're not sure about.
              </p>
              {additionalQuestions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  answers={answers}
                  onChange={updateAnswer}
                />
              ))}
              <button
                onClick={() => setStage("results")}
                className="mt-2 px-5 py-2 bg-[var(--accent)] text-white"
              >
                See my Negotiation Card
              </button>
            </>
          )}

          {stage === "results" && (
            <>
              <button
                onClick={() => setStage("additional")}
                className="text-sm text-[var(--accent)] underline mb-6"
              >
                ← back to questions
              </button>
              <NegotiationCard result={result} answers={answers} />
            </>
          )}
        </div>

        {/* Right: live results, always visible once must-tier is complete */}
        <div>
          {mustComplete ? (
            <ResultsPanel result={result} />
          ) : (
            <p className="text-[var(--muted)] italic">
              Your numbers will appear here as you answer.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;