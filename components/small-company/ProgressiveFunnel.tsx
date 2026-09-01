"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { funnelAdviceContent, funnelThresholds, type FunnelMetric, type MetricStatus } from "@/config/funnel";
import { calculateFunnel, estimatedAcquisitionSpend } from "@/lib/funnel/calculations";
import { diagnoseMetric } from "@/lib/funnel/diagnostics";
import { trackEvent } from "@/lib/analytics/events";
import type { FunnelField, FunnelInput } from "@/types/funnel";

import { FunnelResults } from "./FunnelResults";
import styles from "./funnel.module.css";

const storageKey = "small-company:funnel:v1";

type FunnelValues = Record<FunnelField, string>;
type Errors = Partial<Record<FunnelField, string>>;

const emptyValues: FunnelValues = {
  leads: "",
  avgCpl: "",
  contacted: "",
  appointments: "",
  heldMeetings: "",
  contracts: "",
};

const stepFields: FunnelField[][] = [
  ["leads", "avgCpl"],
  ["contacted"],
  ["appointments"],
  ["heldMeetings"],
  ["contracts"],
];

const stepEvents = [
  "SMALL_STEP_LEADS_COMPLETED",
  "SMALL_STEP_CONTACT_COMPLETED",
  "SMALL_STEP_APPOINTMENT_COMPLETED",
  "SMALL_STEP_HELD_COMPLETED",
  "SMALL_STEP_CONTRACT_COMPLETED",
] as const;

const fieldLabels: Record<FunnelField, string> = {
  leads: "Количество лидов",
  avgCpl: "Средняя стоимость лида",
  contacted: "Дозвонились до",
  appointments: "Назначено встреч / квалов",
  heldMeetings: "Встреч состоялось",
  contracts: "Заключено договоров",
};

function numeric(values: FunnelValues, field: FunnelField): number {
  const value = Number(values[field]);
  return Number.isFinite(value) && values[field] !== "" ? value : 0;
}

function toInput(values: FunnelValues): FunnelInput {
  return {
    leads: numeric(values, "leads"),
    avgCpl: numeric(values, "avgCpl"),
    contacted: numeric(values, "contacted"),
    appointments: numeric(values, "appointments"),
    heldMeetings: numeric(values, "heldMeetings"),
    contracts: numeric(values, "contracts"),
  };
}

function validateField(field: FunnelField, values: FunnelValues): string | undefined {
  const raw = values[field];
  const value = Number(raw);
  if (raw === "" || !Number.isFinite(value)) return "Укажи число.";
  if (field === "leads" && value <= 0) return "Количество лидов должно быть больше нуля.";
  if (field === "avgCpl" && value <= 0) return "Стоимость лида должна быть больше нуля.";
  if (field === "contacted" && (value < 0 || value > numeric(values, "leads"))) return `Значение должно быть от 0 до ${numeric(values, "leads")}.`;
  if (field === "appointments" && (value < 0 || value > numeric(values, "contacted"))) return `Значение должно быть от 0 до ${numeric(values, "contacted")}.`;
  if (field === "heldMeetings" && (value < 0 || value > numeric(values, "appointments"))) return `Значение должно быть от 0 до ${numeric(values, "appointments")}.`;
  if (field === "contracts" && (value < 0 || value > numeric(values, "heldMeetings"))) return `Значение должно быть от 0 до ${numeric(values, "heldMeetings")}.`;
  return undefined;
}

function validateStep(step: number, values: FunnelValues): Errors {
  return stepFields[step - 1].reduce<Errors>((result, field) => {
    const error = validateField(field, values);
    if (error) result[field] = error;
    return result;
  }, {});
}

function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
}

function formatNumber(value: number | null, maximumFractionDigits = 1): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${formatNumber(value * 100)}%`;
}

function StageInsight({ metric, status }: { metric: FunnelMetric; status: MetricStatus }) {
  if (status === "unscored") {
    return <p className={styles.unscored}>Показатель посчитан без оценки: согласованный benchmark для этого этапа пока не задан.</p>;
  }
  if (status === "good" || status === "excellent") return null;
  const advice = funnelAdviceContent[metric];
  return (
    <details className={styles.insight} open={metric === "cpl"}>
      <summary>{advice.title}</summary>
      <ul>{advice.items.map((item) => <li key={item}>{item}</li>)}</ul>
      <strong>{advice.footer}</strong>
    </details>
  );
}

type FieldProps = {
  field: FunnelField;
  suffix?: string;
  value: string;
  error?: string;
  onBlur: () => void;
  onChange: (value: string) => void;
};

function FunnelFieldInput({ field, suffix, value, error, onBlur, onChange }: FieldProps) {
  const errorId = `${field}-error`;
  return (
    <label className={styles.field}>
      <span>{fieldLabels[field]}</span>
      <span className={`${styles.inputShell} ${error ? styles.inputError : ""}`}>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          inputMode="decimal"
          min="0"
          name={field}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          step="any"
          type="number"
          value={value}
        />
        {suffix ? <span>{suffix}</span> : null}
      </span>
      {error ? <small className={styles.error} id={errorId}>{error}</small> : null}
    </label>
  );
}

type StageProps = {
  completed: boolean;
  errors: Errors;
  number: number;
  onBlur: (field: FunnelField) => void;
  onChange: (field: FunnelField, value: string) => void;
  onComplete: () => void;
  values: FunnelValues;
};

function StepShell({ children, completed, number, title }: { children: ReactNode; completed: boolean; number: number; title: string }) {
  return (
    <article className={`${styles.step} ${completed ? styles.completed : ""}`} id={`funnel-step-${number}`}>
      <header className={styles.stepHeader}>
        <span>ШАГ {number}</span>
        {completed ? <strong>готово ✓</strong> : null}
      </header>
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function StepOne(props: StageProps) {
  const input = toInput(props.values);
  const result = calculateFunnel(input);
  return (
    <StepShell completed={props.completed} number={1} title="Сколько заявок ты получил за последний полный месяц?">
      <div className={styles.fieldGrid}>
        <FunnelFieldInput field="leads" suffix="лидов" value={props.values.leads} error={props.errors.leads} onBlur={() => props.onBlur("leads")} onChange={(value) => props.onChange("leads", value)} />
        <FunnelFieldInput field="avgCpl" suffix="₽" value={props.values.avgCpl} error={props.errors.avgCpl} onBlur={() => props.onBlur("avgCpl")} onChange={(value) => props.onChange("avgCpl", value)} />
      </div>
      {input.leads > 0 && input.avgCpl > 0 ? (
        <>
          <div className={styles.liveResult}>
            <span>На входе получается</span>
            <strong>{formatNumber(input.leads)} лидов</strong>
            <strong>≈ {formatMoney(result.adSpend)} рекламного бюджета</strong>
            <p>Пока это просто CPL. Самое интересное начинается дальше.</p>
          </div>
          <StageInsight metric="cpl" status={diagnoseMetric(input.avgCpl, funnelThresholds.cpl)} />
        </>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Что произошло с этими лидами? <span>→</span></button>
    </StepShell>
  );
}

function StepTwo(props: StageProps) {
  const input = toInput(props.values);
  const result = calculateFunnel(input);
  return (
    <StepShell completed={props.completed} number={2} title="До скольких из этих лидов вы реально дозвонились?">
      <FunnelFieldInput field="contacted" suffix="человек" value={props.values.contacted} error={props.errors.contacted} onBlur={() => props.onBlur("contacted")} onChange={(value) => props.onChange("contacted", value)} />
      {props.values.contacted !== "" && !props.errors.contacted ? (
        <>
          <div className={styles.liveResult}>
            <strong>Дозвон: {formatPercent(result.contactRate)}</strong>
            <span>Стоимость состоявшегося контакта: {formatMoney(result.costPerContact)}</span>
            <span>Не удалось связаться: {formatNumber(result.losses.beforeContact)} контактов</span>
            <span>На их привлечение пришлось ≈ {formatMoney(estimatedAcquisitionSpend(result.losses.beforeContact, input.avgCpl))} рекламного расхода</span>
            <p className={styles.handNote}>За этот контакт уже заплачено.</p>
          </div>
          <StageInsight metric="contactRate" status={diagnoseMetric(result.contactRate, funnelThresholds.contactRate)} />
        </>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Перейти к назначениям <span>→</span></button>
    </StepShell>
  );
}

function StepThree(props: StageProps) {
  const result = calculateFunnel(toInput(props.values));
  return (
    <StepShell completed={props.completed} number={3} title="Скольким из дозвонившихся назначили встречу?">
      <FunnelFieldInput field="appointments" value={props.values.appointments} error={props.errors.appointments} onBlur={() => props.onBlur("appointments")} onChange={(value) => props.onChange("appointments", value)} />
      {props.values.appointments !== "" && !props.errors.appointments ? <><div className={styles.liveResult}><strong>Дозвон → назначение: {formatPercent(result.appointmentRate)}</strong><span>Стоимость назначенной встречи: {formatMoney(result.costPerAppointment)}</span></div><StageInsight metric="appointmentRate" status={diagnoseMetric(result.appointmentRate, funnelThresholds.appointmentRate)} /></> : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Проверить доходимость <span>→</span></button>
    </StepShell>
  );
}

function StepFour(props: StageProps) {
  const result = calculateFunnel(toInput(props.values));
  return (
    <StepShell completed={props.completed} number={4} title="Сколько назначенных встреч реально состоялось?">
      <FunnelFieldInput field="heldMeetings" value={props.values.heldMeetings} error={props.errors.heldMeetings} onBlur={() => props.onBlur("heldMeetings")} onChange={(value) => props.onChange("heldMeetings", value)} />
      {props.values.heldMeetings !== "" && !props.errors.heldMeetings ? <><div className={styles.liveResult}><strong>Доходимость: {formatPercent(result.showRate)}</strong><span>Стоимость состоявшейся встречи: {formatMoney(result.costPerHeldMeeting)}</span></div><StageInsight metric="showRate" status={diagnoseMetric(result.showRate, funnelThresholds.showRate)} /></> : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Перейти к договорам <span>→</span></button>
    </StepShell>
  );
}

function StepFive(props: StageProps) {
  const result = calculateFunnel(toInput(props.values));
  return (
    <StepShell completed={props.completed} number={5} title="Сколько состоявшихся встреч закончились договором?">
      <FunnelFieldInput field="contracts" value={props.values.contracts} error={props.errors.contracts} onBlur={() => props.onBlur("contracts")} onChange={(value) => props.onChange("contracts", value)} />
      {props.values.contracts !== "" && !props.errors.contracts ? (
        <>
          <div className={styles.liveResult}>
            <strong>Встреча → договор: {formatPercent(result.closeRate)}</strong>
            <span>Лид → договор: {formatPercent(result.leadToContractRate)}</span>
            <span>Стоимость договора: {formatMoney(result.costPerContract)}</span>
            <span>На один договор требуется ≈ {formatNumber(result.leadsPerContract)} лидов</span>
          </div>
          <StageInsight metric="closeRate" status={diagnoseMetric(result.closeRate, funnelThresholds.closeRate)} />
        </>
      ) : null}
      <button className={styles.nextButton} type="button" onClick={props.onComplete}>Показать мою воронку <span>→</span></button>
    </StepShell>
  );
}

function FunnelVisualization({ completedSteps, input }: { completedSteps: number; input: FunnelInput }) {
  const result = calculateFunnel(input);
  const stages = [
    { label: "Лиды", count: input.leads, meta: formatMoney(input.avgCpl) },
    { label: "Дозвон", count: input.contacted, meta: formatPercent(result.contactRate) },
    { label: "Назначено", count: input.appointments, meta: formatPercent(result.appointmentRate) },
    { label: "Состоялось", count: input.heldMeetings, meta: formatPercent(result.showRate) },
    { label: "Договоры", count: input.contracts, meta: formatPercent(result.closeRate) },
  ];
  return (
    <aside className={styles.visual} aria-label="Визуализация заполненной части воронки">
      <p className={styles.visualTitle}>Твоя воронка дорисовывается здесь</p>
      <svg aria-hidden="true" className={styles.funnelOutline} viewBox="0 0 420 550">
        <path d="M28 34 C110 45 309 18 392 36 L330 512 C255 529 166 529 91 512 Z" />
        {stages.slice(0, completedSteps).map((_, index) => <path d={`M${48 + index * 12} ${125 + index * 88} Q210 ${138 + index * 88} ${372 - index * 12} ${125 + index * 88}`} key={index} />)}
      </svg>
      <div className={styles.visualStages}>
        {stages.slice(0, completedSteps).map((stage, index) => (
          <div className={styles.visualStage} key={stage.label} style={{ width: `${100 - index * 10}%` }}>
            <span>{stage.label}</span><strong>{formatNumber(stage.count)}</strong><small>{stage.meta}</small>
          </div>
        ))}
      </div>
      {completedSteps > 1 ? <p className={styles.visualNote}>За этот контакт уже заплачено.</p> : null}
    </aside>
  );
}

export function ProgressiveFunnel() {
  const [hydrated, setHydrated] = useState(false);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState<FunnelValues>(emptyValues);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<FunnelField, boolean>>>({});
  const [attempted, setAttempted] = useState<Partial<Record<number, boolean>>>({});
  const input = useMemo(() => toInput(values), [values]);
  const isFunnelValid = useMemo(() => stepFields.every((_, index) => Object.keys(validateStep(index + 1, values)).length === 0), [values]);
  const visibleSteps = started ? Math.min(5, completedSteps + 1) : 0;

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const stored = window.sessionStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as { started?: boolean; values?: Partial<FunnelValues>; completedSteps?: number };
          setStarted(Boolean(parsed.started));
          setValues({ ...emptyValues, ...parsed.values });
          const restoredSteps = Math.min(5, Math.max(0, parsed.completedSteps ?? 0));
          setCompletedSteps(restoredSteps);
        }
      } catch {
        // A blocked sessionStorage must not make the calculator unusable.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const beginFunnel = useCallback(() => {
    setStarted(true);
    if (!started) {
      trackEvent("SMALL_FUNNEL_STARTED", { segment: "small_company" });
    }
  }, [started]);

  useEffect(() => {
    window.addEventListener("small-funnel-start", beginFunnel);
    const hashTimer = window.location.hash === "#funnel-start" ? window.setTimeout(beginFunnel, 0) : null;
    return () => {
      if (hashTimer !== null) window.clearTimeout(hashTimer);
      window.removeEventListener("small-funnel-start", beginFunnel);
    };
  }, [beginFunnel]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ started, values, completedSteps, isValid: isFunnelValid }));
    } catch {
      // Keep all state in memory when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent("small-funnel-state", { detail: { completedSteps, input, isValid: isFunnelValid } }));
  }, [completedSteps, hydrated, input, isFunnelValid, started, values]);

  const errors = useMemo(() => {
    return stepFields.flat().reduce<Errors>((result, field) => {
      const step = stepFields.findIndex((fields) => fields.includes(field)) + 1;
      if (touched[field] || attempted[step]) {
        const error = validateField(field, values);
        if (error) result[field] = error;
      }
      return result;
    }, {});
  }, [attempted, touched, values]);

  function handleChange(field: FunnelField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleComplete(step: number) {
    setAttempted((current) => ({ ...current, [step]: true }));
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length > 0) return;
    setCompletedSteps((current) => Math.max(current, step));
    if (step > completedSteps) {
      trackEvent(stepEvents[step - 1], { segment: "small_company", step });
      if (step === 5) trackEvent("SMALL_FUNNEL_RESULT_VIEWED", { segment: "small_company" });
    }
    const nextStep = step + 1;
    window.setTimeout(() => {
      document.getElementById(nextStep <= 5 ? `funnel-step-${nextStep}` : "funnel-complete")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  const common = (number: number): Omit<StageProps, "number"> => ({
    completed: completedSteps >= number && Object.keys(validateStep(number, values)).length === 0,
    errors,
    onBlur: (field) => setTouched((current) => ({ ...current, [field]: true })),
    onChange: handleChange,
    onComplete: () => handleComplete(number),
    values,
  });

  return (
    <section className={styles.funnelSection} id="funnel-start" aria-labelledby="progressive-funnel-title">
      <div className={styles.frame}>
        {!started ? (
          <div className={styles.closedState}>
            <span className={styles.closedArrow} aria-hidden="true">↘</span>
            <h2 id="progressive-funnel-title">Воронка пока свёрнута</h2>
            <p>Начни диагностику выше — и здесь появится только первый шаг.</p>
            <button type="button" className={styles.nextButton} onClick={beginFunnel}>Начать с лидов <span>→</span></button>
          </div>
        ) : (
          <>
            <div className={styles.progressBar} aria-label={`Прогресс: ${completedSteps} из 5 шагов`}>
              <span>ДИАГНОСТИКА</span><strong>{Math.min(completedSteps + 1, 5)}/5</strong><i><b style={{ width: `${(completedSteps / 5) * 100}%` }} /></i>
            </div>
            <h2 className={styles.srOnly} id="progressive-funnel-title">Пошаговая диагностика воронки</h2>
            <div className={styles.funnelGrid}>
              <div className={styles.steps}>
                {visibleSteps >= 1 ? <StepOne number={1} {...common(1)} /> : null}
                {visibleSteps >= 2 ? <StepTwo number={2} {...common(2)} /> : null}
                {visibleSteps >= 3 ? <StepThree number={3} {...common(3)} /> : null}
                {visibleSteps >= 4 ? <StepFour number={4} {...common(4)} /> : null}
                {visibleSteps >= 5 ? <StepFive number={5} {...common(5)} /> : null}
                {completedSteps === 5 ? <div className={styles.completeMarker} id="funnel-complete"><strong>{isFunnelValid ? "Все 5 шагов заполнены" : "Исправь противоречие выше"}</strong><span>{isFunnelValid ? "Итоговая экономика появилась ниже." : "Расчёты и отправка снова откроются после исправления."}</span></div> : null}
              </div>
              <FunnelVisualization completedSteps={completedSteps} input={input} />
            </div>
            {completedSteps === 5 && isFunnelValid ? <FunnelResults input={input} /> : null}
          </>
        )}
      </div>
    </section>
  );
}
