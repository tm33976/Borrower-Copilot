import type { Question } from "../questions/questions";
import type { BorrowerAnswers } from "../engine/types";

interface Props {
  question: Question;
  answers: BorrowerAnswers;
  onChange: (id: keyof BorrowerAnswers, value: unknown) => void;
}

/**
 * Renders one question and reports every change straight up to the
 * parent's answers object. There's no local component state and no
 * "submit" step per question every keystroke updates the shared
 * answers object, which is what makes outputs recalculate live as the
 * brief's question-design rules require ("every additional question must
 * change an output"). If a question's answer never moves a number, that
 * would be visible immediately during testing, not hidden behind a
 * submit button.
 */
export function QuestionField({ question, answers, onChange }: Props) {
  const value = answers[question.id];

  // Every additional-tier question is skippable by design -- that's the
  // whole point of the tier. Within the must tier, only a question
  // explicitly marked required:false (currently just credit score) is
  // skippable. Getting this right matters: an earlier version of this
  // placeholder logic said "Skip if unsure" on every field regardless of
  // whether that was true, which was actively misleading on required
  // fields like household expenses the Continue button stayed
  // disabled while the placeholder told you skipping was fine.
  const isSkippable = question.tier === "additional" || question.required === false;

  const baseInputClasses =
    "w-full border-b-2 border-[var(--rule)] bg-transparent py-2 text-lg font-[var(--mono)] focus:border-[var(--accent)] focus:outline-none transition-colors";

  return (
    <div className="mb-8">
      <label className="block font-[var(--display)] text-xl mb-1 text-[var(--ink)]">
        {question.label}
      </label>
      {question.helpText && (
        <p className="text-sm text-[var(--muted)] mb-2">{question.helpText}</p>
      )}

      {question.type === "text" && (
        <input
          type="text"
          className={baseInputClasses}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      )}

      {question.type === "number" && (
        <input
          type="number"
          className={baseInputClasses}
          value={value === undefined ? "" : (value as number)}
          placeholder={isSkippable ? "Skip if unsure" : "Enter a number"}
          onChange={(e) =>
            onChange(
              question.id,
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
          onWheel={(e) => e.currentTarget.blur()}
        />
      )}

      {question.type === "currency" && (
        <div className="flex items-center gap-2">
          <span className="font-[var(--mono)] text-[var(--muted)]">₹</span>
          <input
            type="number"
            className={baseInputClasses}
            value={value === undefined ? "" : (value as number)}
            placeholder={isSkippable ? "Skip if unsure" : "Enter an amount"}
            onChange={(e) =>
              onChange(
                question.id,
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
      )}

      {question.type === "single-select" && (
        <div className="flex flex-wrap gap-2 mt-1">
          {question.options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(question.id, opt.value)}
              className={`px-3 py-1.5 text-sm border transition-colors ${
                value === opt.value
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--rule)] text-[var(--ink)] hover:border-[var(--accent)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.type === "boolean" && (
        <div className="flex gap-2 mt-1">
          {[
            { v: true, label: "Yes" },
            { v: false, label: "No" },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => onChange(question.id, opt.v)}
              className={`px-4 py-1.5 text-sm border transition-colors ${
                value === opt.v
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--rule)] text-[var(--ink)] hover:border-[var(--accent)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}