"use client";

import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics/events";
import { getAttribution } from "@/lib/attribution";
import type { AnalyticsEventName } from "@/types/analytics";
import type { SegmentQuizAnswers, SegmentQuizChannel, SegmentQuizPayload, SegmentQuizQuestion, SegmentQuizSubmitResult } from "@/types/segment-quiz";

type QuizStyles = Record<string, string>;

type QuizPayloadContext = {
  answers: SegmentQuizAnswers;
  channel: SegmentQuizChannel;
  trackingId: string;
  attribution: ReturnType<typeof getAttribution>["current"];
};

type SequentialSegmentQuizProps = {
  id: string;
  styles: QuizStyles;
  storageNamespace: string;
  segment: string;
  questions: readonly SegmentQuizQuestion[];
  emptyAnswers: SegmentQuizAnswers;
  offer: { note: string; title: string; lead: string; body: string; delivery: string };
  completeActionLabel: string;
  createPayload: (context: QuizPayloadContext) => SegmentQuizPayload;
  submitPayload: (payload: SegmentQuizPayload) => Promise<SegmentQuizSubmitResult>;
  events: { start: AnalyticsEventName; complete: AnalyticsEventName; telegram: AnalyticsEventName; vk: AnalyticsEventName };
};

function readStoredAnswers(storageNamespace: string, questions: readonly SegmentQuizQuestion[], emptyAnswers: SegmentQuizAnswers): SegmentQuizAnswers {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(`${storageNamespace}:quiz-answers`) ?? "null") as SegmentQuizAnswers | null;
    if (!parsed) return emptyAnswers;
    return questions.reduce<SegmentQuizAnswers>((answers, question) => {
      const value = parsed[question.key];
      answers[question.key] = question.type === "multi"
        ? (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [])
        : (typeof value === "string" ? value : "");
      return answers;
    }, {});
  } catch {
    return emptyAnswers;
  }
}

function getTrackingId(storageNamespace: string, existing?: string): string {
  if (existing) return existing;
  const trackingKey = `${storageNamespace}:tracking-id`;
  try {
    const stored = window.sessionStorage.getItem(trackingKey);
    if (stored) return stored;
    const created = globalThis.crypto.randomUUID();
    window.sessionStorage.setItem(trackingKey, created);
    return created;
  } catch {
    return globalThis.crypto.randomUUID();
  }
}

function isAnswered(question: SegmentQuizQuestion, value: string | string[] | undefined): boolean {
  return question.type === "multi" ? Array.isArray(value) && value.length > 0 : typeof value === "string" && value.trim().length > 0;
}

export function SequentialSegmentQuiz({
  id,
  styles,
  storageNamespace,
  segment,
  questions,
  emptyAnswers,
  offer,
  completeActionLabel,
  createPayload,
  submitPayload,
  events,
}: SequentialSegmentQuizProps) {
  const [answers, setAnswers] = useState<SegmentQuizAnswers>(emptyAnswers);
  const [restored, setRestored] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [changing, setChanging] = useState(false);
  const [submitting, setSubmitting] = useState<SegmentQuizChannel | null>(null);
  const [status, setStatus] = useState("");
  const started = useRef(false);
  const completed = useRef(false);
  const transitionTimer = useRef<number | null>(null);

  const isFinal = currentStep >= questions.length;
  const currentQuestion = isFinal ? null : questions[currentStep];
  const isComplete = questions.every((question) => isAnswered(question, answers[question.key]));

  useEffect(() => {
    const saved = readStoredAnswers(storageNamespace, questions, emptyAnswers);
    const frame = window.requestAnimationFrame(() => {
      setAnswers(saved);
      started.current = questions.some((question) => isAnswered(question, saved[question.key]));
      const firstUnanswered = questions.findIndex((question) => !isAnswered(question, saved[question.key]));
      setCurrentStep(firstUnanswered === -1 ? questions.length - 1 : firstUnanswered);
      setRestored(true);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    };
  }, [emptyAnswers, questions, storageNamespace]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(`${storageNamespace}:quiz-answers`, JSON.stringify(answers));
    } catch {
      // The quiz still works when browser storage is unavailable.
    }
  }, [answers, restored, storageNamespace]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent(events.start, { segment });
  }

  function changeStep(nextStep: number) {
    if (changing) return;
    setChanging(true);
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = window.setTimeout(() => {
      setCurrentStep(nextStep);
      setChanging(false);
      transitionTimer.current = null;
    }, 180);
  }

  function chooseSingle(question: Extract<SegmentQuizQuestion, { type: "single" }>, value: string) {
    if (changing) return;
    markStarted();
    setStatus("");
    setAnswers((current) => ({ ...current, [question.key]: value }));
    changeStep(Math.min(currentStep + 1, questions.length - 1));
  }

  function toggleMulti(question: Extract<SegmentQuizQuestion, { type: "multi" }>, value: string) {
    markStarted();
    setStatus("");
    setAnswers((current) => {
      const currentValues: string[] = Array.isArray(current[question.key]) ? current[question.key] as string[] : [];
      return {
        ...current,
        [question.key]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  }

  function updateText(question: Extract<SegmentQuizQuestion, { type: "text" }>, value: string) {
    markStarted();
    setStatus("");
    setAnswers((current) => ({ ...current, [question.key]: value }));
  }

  function completeQuiz() {
    if (!isComplete || changing) return;
    if (!completed.current) {
      completed.current = true;
      trackEvent(events.complete, {
        segment,
        ...Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, Array.isArray(value) ? value.join(" | ") : value])),
      });
    }
    changeStep(questions.length);
  }

  function goBack() {
    if (changing || currentStep === 0) return;
    changeStep(isFinal ? questions.length - 1 : currentStep - 1);
  }

  async function submit(channel: SegmentQuizChannel) {
    if (!isComplete || submitting) return;
    setSubmitting(channel);
    setStatus("");
    const attributionContext = getAttribution();
    const attribution = { ...attributionContext.firstTouch, ...attributionContext.current };
    const payload = createPayload({
      answers,
      channel,
      trackingId: getTrackingId(storageNamespace, attribution.tracking_id),
      attribution,
    });

    try {
      window.sessionStorage.setItem(`${storageNamespace}:pending-quiz`, JSON.stringify(payload));
      trackEvent(channel === "telegram" ? events.telegram : events.vk, { segment, tracking_id: payload.tracking_id });
      const result = await submitPayload(payload);
      const url = channel === "telegram" ? result.telegramUrl : result.vkUrl;
      window.sessionStorage.setItem(`${storageNamespace}:submitted-quiz:${result.token}`, JSON.stringify(payload));
      if (!url) {
        setStatus(channel === "telegram" ? "Telegram пока не подключён." : "ВКонтакте пока не подключён.");
        return;
      }
      window.location.assign(url);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось отправить ответы. Попробуй ещё раз.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <section className={styles.finalCta} id={id} aria-labelledby={`${id}-title`}>
      <div className={styles.frame}>
        <div className={styles.quizOffer}>
          <span className={styles.quizNote}>{offer.note}</span>
          <h2 id={`${id}-title`}>{offer.title}</h2>
          <p className={styles.quizLead}>{offer.lead}</p>
          <p className={styles.quizBody}>{offer.body}</p>
          <p className={styles.quizDelivery}>{offer.delivery}</p>
        </div>

        <div className={styles.quizProgress} aria-live="polite"><strong>{isFinal ? "готово" : `${currentStep + 1} из ${questions.length}`}</strong><span aria-hidden="true">↘</span></div>

        <div className={styles.quizStage} data-changing={changing || undefined} aria-live="polite">
          {currentQuestion?.type === "single" && (
            <fieldset className={styles.quizQuestion} key={currentQuestion.key}>
              <legend><span>{String(currentStep + 1).padStart(2, "0")}</span><span>{currentQuestion.title}</span></legend>
              <div className={styles.quizOptions}>
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.key] === option;
                  return <button type="button" className={styles.quizOption} data-selected={selected || undefined} aria-pressed={selected} disabled={changing} onClick={() => chooseSingle(currentQuestion, option)} key={option}><span className={styles.optionCheck} aria-hidden="true">✓</span><span>{option}</span></button>;
                })}
              </div>
              {currentStep > 0 && <button type="button" className={styles.quizBack} onClick={goBack}>← назад</button>}
            </fieldset>
          )}

          {currentQuestion?.type === "multi" && (
            <fieldset className={styles.quizQuestion} key={currentQuestion.key}>
              <legend><span>{String(currentStep + 1).padStart(2, "0")}</span><span>{currentQuestion.title}{currentQuestion.note && <small>{currentQuestion.note}</small>}</span></legend>
              <div className={styles.quizOptions}>
                {currentQuestion.options.map((option) => {
                  const selected = Array.isArray(answers[currentQuestion.key]) && answers[currentQuestion.key].includes(option);
                  return <button type="button" className={styles.quizOption} data-selected={selected || undefined} aria-pressed={selected} onClick={() => toggleMulti(currentQuestion, option)} key={option}><span className={styles.optionCheck} aria-hidden="true">✓</span><span>{option}</span></button>;
                })}
              </div>
              <div className={styles.quizControls}>
                <button type="button" className={styles.quizBack} onClick={goBack}>← назад</button>
                <button type="button" className={styles.quizNextButton} disabled={!isComplete || changing} onClick={completeQuiz}>{completeActionLabel}</button>
              </div>
            </fieldset>
          )}

          {currentQuestion?.type === "text" && (
            <fieldset className={styles.quizQuestion} key={currentQuestion.key}>
              <legend><span>{String(currentStep + 1).padStart(2, "0")}</span><span>{currentQuestion.title}</span></legend>
              <input className={styles.quizTextInput} type="text" value={typeof answers[currentQuestion.key] === "string" ? answers[currentQuestion.key] : ""} onChange={(event) => updateText(currentQuestion, event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); completeQuiz(); } }} placeholder={currentQuestion.placeholder} autoComplete="address-level2" />
              <div className={styles.quizControls}>
                <button type="button" className={styles.quizBack} onClick={goBack}>← назад</button>
                <button type="button" className={styles.quizNextButton} disabled={!isComplete || changing} onClick={completeQuiz}>{completeActionLabel}</button>
              </div>
            </fieldset>
          )}

          {isFinal && (
            <div className={styles.quizFinish} data-ready>
              <button type="button" className={styles.quizBack} onClick={goBack}>← назад</button>
              <div><span className={styles.quizFinishMark} aria-hidden="true">✓</span><h3>Понял твою ситуацию</h3><p>Выбери, куда отправить предложение по тестовому периоду:</p></div>
              <div className={styles.quizActions}>
                <button type="button" disabled={Boolean(submitting)} onClick={() => submit("telegram")}><span className={styles.telegramPlane} aria-hidden="true">➤</span>{submitting === "telegram" ? "Отправляю…" : "Получить в Telegram →"}</button>
                <button type="button" disabled={Boolean(submitting)} onClick={() => submit("vk")}>{submitting === "vk" ? "Отправляю…" : "Получить во ВКонтакте →"}</button>
              </div>
              {status && <p className={styles.quizStatus} role="status">{status}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
