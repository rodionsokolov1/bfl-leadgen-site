"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { benchmarkLabels, benchmarkReactions } from "@/config/funnel";
import { trackEvent } from "@/lib/analytics/events";
import { getAttribution } from "@/lib/attribution";
import { calculateFunnel, estimatedAcquisitionSpend } from "@/lib/funnel/calculations";
import { diagnoseMetric, findPrimaryBottleneck, getFunnelStatuses } from "@/lib/funnel/diagnostics";
import { funnelFieldLabels, validateFunnelField, validateFunnelInput } from "@/lib/funnel/validation";
import type { FunnelEconomicMetricKey, FunnelField, FunnelInput, FunnelLocalMetricKey, FunnelStatus } from "@/types/funnel";

import { FunnelResults } from "./FunnelResults";
import styles from "./funnel.module.css";

const storageKey = "small-company:funnel:v3";

type FunnelValues = Record<FunnelField, string>;
type Errors = Partial<Record<FunnelField, string>>;

const emptyValues: FunnelValues = {
  leadsCount: "",
  costPerLead: "",
  contactedCount: "",
  meetingsBooked: "",
  meetingsHeld: "",
  contractsCount: "",
};

const stepFields: FunnelField[][] = [
  ["leadsCount", "costPerLead"],
  ["contactedCount"],
  ["meetingsBooked"],
  ["meetingsHeld"],
  ["contractsCount"],
];

const stepEvents = [
  "FUNNEL_STEP_1_COMPLETED",
  "FUNNEL_STEP_2_COMPLETED",
  "FUNNEL_STEP_3_COMPLETED",
  "FUNNEL_STEP_4_COMPLETED",
  "FUNNEL_STEP_5_COMPLETED",
] as const;

function numeric(values: FunnelValues, field: FunnelField): number {
  if (values[field] === "") return Number.NaN;
  const value = Number(values[field]);
  return Number.isFinite(value) ? value : Number.NaN;
}

function toInput(values: FunnelValues): FunnelInput {
  return {
    leadsCount: numeric(values, "leadsCount"),
    costPerLead: numeric(values, "costPerLead"),
    contactedCount: numeric(values, "contactedCount"),
    meetingsBooked: numeric(values, "meetingsBooked"),
    meetingsHeld: numeric(values, "meetingsHeld"),
    contractsCount: numeric(values, "contractsCount"),
  };
}

function displayInput(values: FunnelValues): FunnelInput {
  const input = toInput(values);
  return (Object.keys(input) as FunnelField[]).reduce<FunnelInput>((result, field) => {
    result[field] = Number.isFinite(input[field]) ? input[field] : 0;
    return result;
  }, { ...input });
}

function validateField(field: FunnelField, values: FunnelValues): string | undefined {
  if (values[field] === "") return "Укажи число.";
  return validateFunnelField(field, toInput(values));
}

function validateStep(step: number, values: FunnelValues): Errors {
  return stepFields[step - 1].reduce<Errors>((result, field) => {
    const error = validateField(field, values);
    if (error) result[field] = error;
    return result;
  }, {});
}

function formatMoney(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "не рассчитывается";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";
}

function formatNumber(value: number | null, maximumFractionDigits = 1): string {
  if (value === null || !Number.isFinite(value)) return "не рассчитывается";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "не рассчитывается" : formatNumber(value * 100) + "%";
}

function AnimatedNumber({ value }: { value: number }) {
  const previous = useRef(0);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => {
        previous.current = value;
        setDisplayed(value);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const from = previous.current;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 320);
      setDisplayed(from + (value - from) * progress);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatNumber(displayed, 0)}</>;
}

function BenchmarkReaction({ metric, status }: { metric: FunnelLocalMetricKey; status: FunnelStatus | null }) {
  if (!status) return null;
  const reaction = benchmarkReactions[metric][status];
  return (
    <div className={styles.reaction}>
      <span className={styles.statusBadge} data-status={status}>{benchmarkLabels[metric][status]}</span>
      <strong>{reaction.title}</strong>
      {reaction.body ? <p>{reaction.body}</p> : null}
      {reaction.advice ? <ul>{reaction.advice.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      {reaction.insight ? <p className={styles.handNote}>{reaction.insight}</p> : null}
    </div>
  );
}

function EconomicStatus({ label, metric, value }: { label: string; metric: FunnelEconomicMetricKey; value: number | null }) {
  const status = diagnoseMetric(value, metric);
  if (value === null || !status) return null;
  return (
    <div className={styles.economicStatus} data-status={status}>
      <span>{label}</span>
      <strong>{formatMoney(value)}</strong>
      <small className={styles.statusBadge} data-status={status}>{benchmarkLabels[metric][status]}</small>
    </div>
  );
}

type FieldProps = {
  field: FunnelField;
  suffix?: string;
  value: string;
  error?: string;
  integer?: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
};

function FunnelFieldInput({ field, suffix, value, error, integer = true, onBlur, onChange }: FieldProps) {
  const errorId = field + "-error";
  return (
    <label className={styles.field}>
      <span>{funnelFieldLabels[field]}</span>
      <span className={[styles.inputShell, error ? styles.inputError : ""].join(" ")}>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          inputMode={integer ? "numeric" : "decimal"}
          min="0"
          name={field}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          step={integer ? "1" : "any"}
          type="number"
          value={value}
        />
        {suffix ? <span>{suffix}</span> : null}
      </span>
      {error ? <small className={styles.error} id={errorId}>{error}</small> : null}
    </label>
  );
}

type StepProps = {
  errors: Errors;
  onBlur: (field: FunnelField) => void;
  onChange: (field: FunnelField, value: string) => void;
  onComplete: () => void;
  onBack: (() => void) | null;
  values: FunnelValues;
};

function StepShell({ children, number, title, help, onBack }: { children: ReactNode; number: number; title: string; help?: string; onBack: (() => void) | null }) {
  return (
    <article className={styles.step} key={number}>
      <header className={styles.stepHeader}>
        <span>ВОПРОС {number}</span>
        {onBack ? <button type="button" onClick={onBack}>← Назад</button> : null}
      </header>
      <h3 id="current-funnel-question" tabIndex={-1}>{title}</h3>
      {help ? <p className={styles.stepHelp}>{help}</p> : null}
      {children}
    </article>
  );
}

function StepOne(props: StepProps) {
  const input = displayInput(props.values);
  const result = calculateFunnel(input);
  const valid = props.values.leadsCount !== "" && props.values.costPerLead !== "" && !props.errors.leadsCount && !props.errors.costPerLead;
  const status = valid ? diagnoseMetric(input.costPerLead, "costPerLead") : null;
  return (
    <StepShell number={1} title="Сколько заявок ты получил за последний полный месяц?" onBack={props.onBack}>
      <div className={styles.fieldGrid}>
        <FunnelFieldInput field="leadsCount" suffix="заявок" value={props.values.leadsCount} error={props.errors.leadsCount} onBlur={() => props.onBlur("leadsCount")} onChange={(value) => props.onChange("leadsCount", value)} />
        <FunnelFieldInput field="costPerLead" suffix="₽" value={props.values.costPerLead} error={props.errors.costPerLead} integer={false} onBlur={() => props.onBlur("costPerLead")} onChange={(value) => props.onChange("costPerLead", value)} />
      </div>
      {valid ? (
        <div aria-live="polite">
          <div className={styles.liveResult}>
            <span>На входе получается</span>
            <strong>{formatNumber(input.leadsCount, 0)} заявок</strong>
            <strong>≈ {formatMoney(result.adSpend)} рекламного бюджета</strong>
            <span>Средняя стоимость заявки — {formatMoney(input.costPerLead)}</span>
          </div>
          <BenchmarkReaction metric="costPerLead" status={status} />
        </div>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Следующий шаг <span>→</span></button>
    </StepShell>
  );
}

function StepTwo(props: StepProps) {
  const input = displayInput(props.values);
  const result = calculateFunnel(input);
  const valid = props.values.contactedCount !== "" && !props.errors.contactedCount;
  const status = valid ? diagnoseMetric(result.contactRate, "contactRate") : null;
  return (
    <StepShell number={2} title="До скольких из этих людей вы реально дозвонились?" onBack={props.onBack}>
      <FunnelFieldInput field="contactedCount" suffix="чел." value={props.values.contactedCount} error={props.errors.contactedCount} onBlur={() => props.onBlur("contactedCount")} onChange={(value) => props.onChange("contactedCount", value)} />
      {valid ? (
        <div aria-live="polite">
          <div className={styles.liveResult}>
            <strong>Дозвон — {formatPercent(result.contactRate)}</strong>
            <span>Стоимость состоявшегося контакта — {formatMoney(result.costPerContact)}</span>
            <span>{formatNumber(result.losses.beforeContact, 0)} заявок остались без разговора</span>
            <span>На их привлечение пришлось ≈ {formatMoney(estimatedAcquisitionSpend(result.losses.beforeContact, input.costPerLead))} рекламного бюджета</span>
          </div>
          <BenchmarkReaction metric="contactRate" status={status} />
        </div>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Следующий шаг <span>→</span></button>
    </StepShell>
  );
}

function StepThree(props: StepProps) {
  const input = displayInput(props.values);
  const result = calculateFunnel(input);
  const valid = props.values.meetingsBooked !== "" && !props.errors.meetingsBooked;
  const status = valid ? diagnoseMetric(result.bookingRate, "bookingRate") : null;
  return (
    <StepShell number={3} title="Скольким из тех, до кого дозвонились, назначили встречу?" help="Онлайн или в офисе — неважно. Считаем людей, которые согласились на следующий целевой шаг." onBack={props.onBack}>
      <FunnelFieldInput field="meetingsBooked" value={props.values.meetingsBooked} error={props.errors.meetingsBooked} onBlur={() => props.onBlur("meetingsBooked")} onChange={(value) => props.onChange("meetingsBooked", value)} />
      {valid ? (
        <div aria-live="polite">
          <div className={styles.liveResult}>
            <strong>Дозвон → встреча — {formatPercent(result.bookingRate)}</strong>
            <span>Стоимость назначенной встречи — {formatMoney(result.costPerBookedMeeting)}</span>
            {result.bookingRate === null ? <span>Показатель не рассчитывается, потому что состоявшихся разговоров пока нет.</span> : null}
          </div>
          <BenchmarkReaction metric="bookingRate" status={status} />
          <EconomicStatus label="Стоимость назначенной встречи" metric="costPerBookedMeeting" value={result.costPerBookedMeeting} />
        </div>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Следующий шаг <span>→</span></button>
    </StepShell>
  );
}

function StepFour(props: StepProps) {
  const input = displayInput(props.values);
  const result = calculateFunnel(input);
  const valid = props.values.meetingsHeld !== "" && !props.errors.meetingsHeld;
  const status = valid ? diagnoseMetric(result.showRate, "showRate") : null;
  return (
    <StepShell number={4} title="Сколько назначенных встреч реально состоялось?" onBack={props.onBack}>
      <FunnelFieldInput field="meetingsHeld" value={props.values.meetingsHeld} error={props.errors.meetingsHeld} onBlur={() => props.onBlur("meetingsHeld")} onChange={(value) => props.onChange("meetingsHeld", value)} />
      {valid ? (
        <div aria-live="polite">
          <div className={styles.liveResult}>
            <strong>Доходимость — {formatPercent(result.showRate)}</strong>
            <span>Стоимость состоявшейся встречи — {formatMoney(result.costPerHeldMeeting)}</span>
            {result.showRate === null ? <span>Показатель не рассчитывается, потому что назначенных встреч пока нет.</span> : null}
          </div>
          <BenchmarkReaction metric="showRate" status={status} />
          <EconomicStatus label="Стоимость состоявшейся встречи" metric="costPerHeldMeeting" value={result.costPerHeldMeeting} />
        </div>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Следующий шаг <span>→</span></button>
    </StepShell>
  );
}

function StepFive(props: StepProps) {
  const input = displayInput(props.values);
  const result = calculateFunnel(input);
  const valid = props.values.contractsCount !== "" && !props.errors.contractsCount;
  const status = valid ? diagnoseMetric(result.closeRate, "closeRate") : null;
  return (
    <StepShell number={5} title="Сколько состоявшихся встреч закончились договором?" onBack={props.onBack}>
      <FunnelFieldInput field="contractsCount" value={props.values.contractsCount} error={props.errors.contractsCount} onBlur={() => props.onBlur("contractsCount")} onChange={(value) => props.onChange("contractsCount", value)} />
      {valid ? (
        <div aria-live="polite">
          <div className={styles.liveResult}>
            <strong>Встреча → договор — {formatPercent(result.closeRate)}</strong>
            <span>Стоимость договора — {formatMoney(result.costPerContract)}</span>
            <span>На один договор приходится ≈ {formatNumber(result.leadsPerContract)} заявок</span>
            {result.closeRate === null ? <span>Показатель не рассчитывается, потому что состоявшихся встреч пока нет.</span> : null}
          </div>
          <BenchmarkReaction metric="closeRate" status={status} />
          <EconomicStatus label="Стоимость договора" metric="costPerContract" value={result.costPerContract} />
          <p className={styles.importantCopy}>До состоявшейся встречи реклама уже проделала значительную часть своей работы. На этом этапе проблема может находиться совсем не в качестве заявок.</p>
        </div>
      ) : null}
    </StepShell>
  );
}

function FunnelVisualization({ completedSteps, currentStep, input, onEdit }: { completedSteps: number; currentStep: number; input: FunnelInput; onEdit: (step: number) => void }) {
  const result = calculateFunnel(input);
  const stages = [
    { label: "Заявки", count: input.leadsCount, meta: formatMoney(input.costPerLead) },
    { label: "Состоявшиеся разговоры", count: input.contactedCount, meta: formatPercent(result.contactRate) },
    { label: "Назначенные встречи", count: input.meetingsBooked, meta: formatPercent(result.bookingRate) },
    { label: "Состоявшиеся встречи", count: input.meetingsHeld, meta: formatPercent(result.showRate) },
    { label: "Договоры", count: input.contractsCount, meta: formatPercent(result.closeRate) },
  ];
  return (
    <aside className={styles.visual} aria-label="Заполненная часть воронки">
      <p className={styles.visualTitle}>Твоя воронка дорисовывается здесь</p>
      <svg aria-hidden="true" className={styles.funnelOutline} viewBox="0 0 420 550">
        <path d="M28 34 C110 45 309 18 392 36 L330 512 C255 529 166 529 91 512 Z" />
        {stages.slice(0, completedSteps).map((_, index) => <path d={"M" + (48 + index * 12) + " " + (125 + index * 88) + " Q210 " + (138 + index * 88) + " " + (372 - index * 12) + " " + (125 + index * 88)} key={index} />)}
      </svg>
      <div className={styles.visualStages}>
        {stages.slice(0, completedSteps).map((stage, index) => (
          <button
            className={[styles.visualStage, currentStep === index + 1 ? styles.visualStageActive : ""].join(" ")}
            key={stage.label}
            onClick={() => onEdit(index + 1)}
            style={{ width: (100 - index * 10) + "%" }}
            type="button"
          >
            <span>{stage.label}</span><strong><AnimatedNumber value={stage.count} /></strong><small>{stage.meta}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

export function ProgressiveFunnel() {
  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<FunnelValues>(emptyValues);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<FunnelField, boolean>>>({});
  const [attempted, setAttempted] = useState<Partial<Record<number, boolean>>>({});
  const input = useMemo(() => displayInput(values), [values]);
  const isFunnelValid = useMemo(() => Object.keys(validateFunnelInput(toInput(values))).length === 0, [values]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as { values?: Partial<FunnelValues>; currentStep?: number; completedSteps?: number };
          setValues({ ...emptyValues, ...parsed.values });
          setCurrentStep(Math.min(5, Math.max(1, parsed.currentStep ?? 1)));
          setCompletedSteps(Math.min(5, Math.max(0, parsed.completedSteps ?? 0)));
        }
      } catch {
        // A blocked sessionStorage must not make the diagnostic unusable.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ values, currentStep, completedSteps, isValid: isFunnelValid }));
    } catch {
      // Keep the state in memory when storage is unavailable.
    }
  }, [completedSteps, currentStep, hydrated, isFunnelValid, values]);

  const errors = useMemo(() => stepFields.flat().reduce<Errors>((result, field) => {
    const step = stepFields.findIndex((fields) => fields.includes(field)) + 1;
    if (touched[field] || attempted[step]) {
      const error = validateField(field, values);
      if (error) result[field] = error;
    }
    return result;
  }, {}), [attempted, touched, values]);

  function focusQuestion() {
    window.setTimeout(() => {
      document.getElementById("current-funnel-question")?.focus({ preventScroll: true });
      document.getElementById("diagnostic-shell")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function handleChange(field: FunnelField, value: string) {
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      if (value === "0") {
        const fieldIndex = stepFields.flat().indexOf(field);
        for (const downstream of stepFields.flat().slice(fieldIndex + 1)) {
          if (downstream !== "costPerLead") nextValues[downstream] = "0";
        }
      }
      return nextValues;
    });
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleComplete(step: number) {
    setAttempted((current) => ({ ...current, [step]: true }));
    if (Object.keys(validateStep(step, values)).length > 0) return;
    const isNewCompletion = step > completedSteps;
    const nextCompleted = Math.max(completedSteps, step);
    setCompletedSteps(nextCompleted);
    if (isNewCompletion) {
      trackEvent(stepEvents[step - 1], { segment: "small_company", step });
    }
    if (step < 5) {
      setCurrentStep(step + 1);
      focusQuestion();
      return;
    }
    if (Object.keys(validateFunnelInput(toInput(values))).length === 0) {
      const metrics = calculateFunnel(input);
      const statuses = getFunnelStatuses(input, metrics);
      const attributionContext = getAttribution();
      const attribution = { ...attributionContext.firstTouch, ...attributionContext.current };
      trackEvent("FUNNEL_DIAGNOSTIC_COMPLETED", {
        primary_bottleneck: findPrimaryBottleneck(input, metrics, statuses),
        statuses: JSON.stringify(statuses),
        tracking_id: attribution.tracking_id,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
      });
      window.setTimeout(() => document.getElementById("funnel-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }

  useEffect(() => {
    if (!hydrated || currentStep !== 5 || completedSteps >= 5 || values.contractsCount === "") return;

    const timer = window.setTimeout(() => {
      const completedInput = toInput(values);
      if (Object.keys(validateFunnelInput(completedInput)).length > 0) return;

      const metrics = calculateFunnel(completedInput);
      const statuses = getFunnelStatuses(completedInput, metrics);
      const attributionContext = getAttribution();
      const attribution = { ...attributionContext.firstTouch, ...attributionContext.current };

      setCompletedSteps(5);
      trackEvent(stepEvents[4], { segment: "small_company", step: 5 });
      trackEvent("FUNNEL_DIAGNOSTIC_COMPLETED", {
        primary_bottleneck: findPrimaryBottleneck(completedInput, metrics, statuses),
        statuses: JSON.stringify(statuses),
        tracking_id: attribution.tracking_id,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
      });
      window.setTimeout(() => document.getElementById("funnel-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [completedSteps, currentStep, hydrated, values]);

  function editStep(step: number) {
    if (step > completedSteps) return;
    setCurrentStep(step);
    focusQuestion();
  }

  const common: StepProps = {
    errors,
    onBack: currentStep > 1 ? () => { setCurrentStep((step) => step - 1); focusQuestion(); } : null,
    onBlur: (field) => setTouched((current) => ({ ...current, [field]: true })),
    onChange: handleChange,
    onComplete: () => handleComplete(currentStep),
    values,
  };

  const currentQuestion = currentStep === 1 ? <StepOne {...common} />
    : currentStep === 2 ? <StepTwo {...common} />
      : currentStep === 3 ? <StepThree {...common} />
        : currentStep === 4 ? <StepFour {...common} />
          : <StepFive {...common} />;

  return (
    <section className={styles.funnelSection} id="funnel-start" aria-labelledby="progressive-funnel-title">
      <div className={styles.frame}>
        <div className={styles.progressBar} aria-label={"Прогресс: " + currentStep + " из 5 шагов"}>
          <span>ДИАГНОСТИКА</span><strong>{currentStep}/5</strong><i><b style={{ width: (currentStep / 5) * 100 + "%" }} /></i>
        </div>
        <h2 className={styles.srOnly} id="progressive-funnel-title">Пошаговая диагностика воронки</h2>
        <div className={styles.funnelGrid} id="diagnostic-shell">
          <div className={styles.steps}>{currentQuestion}</div>
          <FunnelVisualization completedSteps={completedSteps} currentStep={currentStep} input={input} onEdit={editStep} />
        </div>
        {completedSteps === 5 && isFunnelValid ? <FunnelResults input={input} /> : null}
      </div>
    </section>
  );
}
