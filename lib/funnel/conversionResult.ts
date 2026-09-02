import { bottleneckContent } from "../../config/funnel.ts";
import type { FunnelInput, FunnelMetrics, OverallDiagnosisType, PrimaryBottleneck } from "@/types/funnel";
import {
  analyzeBottlenecks,
  getDynamicConversionTargets,
  getFunnelStatuses,
  getOverallDiagnosisType,
  type FunnelStatuses,
} from "./diagnostics.ts";

export type ResultVisual = "lead_cost" | "contact" | "booking" | "show" | "close" | "scaling" | "multiple";

export type ConversionResultModel = {
  overallDiagnosisType: OverallDiagnosisType;
  primaryBottleneck: PrimaryBottleneck;
  primaryBottleneckImpact: number | null;
  secondaryBottleneckCount: number;
  multipleBottlenecks: boolean;
  contractCostStatus: FunnelStatuses["costPerContract"];
  title: string;
  summary: string;
  focusLabel: string;
  focusTitle: string;
  focusBody: string;
  focusDetail?: string;
  teaser: string[];
  ctaLabel: string;
  telegramReserve: string;
  visual: ResultVisual;
};

const bottleneckLabels: Record<Exclude<PrimaryBottleneck, "none">, string> = {
  cost_per_lead: "стоимость заявки",
  contact_rate: "дозвон",
  booking_rate: "назначение встречи",
  show_rate: "доходимость до встречи",
  close_rate: "переход от встречи к договору",
};

const focusContent: Record<Exclude<PrimaryBottleneck, "none">, { title: string; body: string; visual: ResultVisual }> = {
  cost_per_lead: {
    title: "Главный резерв сейчас — стоимость заявки",
    body: "Я бы начал с оффера и посадочной страницы, а затем посмотрел, насколько эта стоимость оправдывается дальнейшей конверсией.",
    visual: "lead_cost",
  },
  contact_rate: {
    title: "Главный резерв сейчас — дозвон",
    body: "Начни с номера и скорости первого звонка: проверь спам-метки, соответствие номера региону и первый контакт в течение 3–5 минут.",
    visual: "contact",
  },
  booking_rate: {
    title: "Главный резерв сейчас — назначение встречи",
    body: "Я бы проверил, соответствует ли разговор менеджера тому офферу, на который человек оставил заявку, и насколько хорошо продаётся сам следующий шаг — встреча.",
    visual: "booking",
  },
  show_rate: {
    title: "Главный резерв сейчас — доходимость до встречи",
    body: "Я бы посмотрел, что происходит между назначением и самой встречей: срок ожидания, подтверждение, напоминания и повторная работа с переносами.",
    visual: "show",
  },
  close_rate: {
    title: "Главный резерв сейчас — переход от встречи к договору",
    body: "До этого этапа реклама свою работу уже в значительной степени выполнила. Здесь я бы смотрел саму консультацию, предложение, работу с сомнениями и follow-up.",
    visual: "close",
  },
};

function money(value: number | null): string {
  return value === null
    ? "не рассчитывается"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) + " ₽";
}

function percent(value: number | null): string {
  return value === null
    ? "не рассчитывается"
    : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value * 100) + "%";
}

function headline(type: OverallDiagnosisType, compensatedLeadCost: boolean, cumulativeEconomy: boolean): string {
  if (compensatedLeadCost) return "Заявка стоит дороже benchmark, но итоговая экономика остаётся хорошей.";
  if (type === "EXCELLENT") return "Экономика воронки выглядит сильной";
  if (type === "GOOD") return "Воронка работает. Теперь можно искать запас для роста";
  if (type === "NEEDS_IMPROVEMENT") return "Конверсии могут выглядеть нормально. Но экономика уже требует внимания.";
  if (type === "MULTIPLE_BOTTLENECKS") {
    return cumulativeEconomy
      ? "Конверсии выглядят нормально. Но экономика воронки уже не сходится."
      : "Здесь нет одного провала — экономика теряется постепенно";
  }
  return "Заявки есть. Но до договора доходит слишком дорого.";
}

function summary(type: OverallDiagnosisType, cost: number | null, compensatedLeadCost: boolean): string {
  if (compensatedLeadCost) {
    return `По введённым цифрам один договор обходится примерно в ${money(cost)}. Дальнейшая воронка компенсирует стоимость заявки.`;
  }
  if (type === "EXCELLENT") return `Один договор сейчас обходится примерно в ${money(cost)}. Явного экономического провала по введённым цифрам не видно.`;
  if (type === "GOOD") return `Стоимость договора — около ${money(cost)}. Критического провала не видно, но воронку ещё можно докрутить.`;
  if (type === "NEEDS_IMPROVEMENT") return `Один договор обходится примерно в ${money(cost)}. Здесь уже имеет смысл смотреть не только на проценты, а на стоимость каждого этапа вместе.`;
  if (type === "MULTIPLE_BOTTLENECKS") return `Несколько этапов по отдельности выглядят приемлемо, но их комбинация приводит к стоимости договора около ${money(cost)}.`;
  return `По введённым цифрам один договор обходится примерно в ${money(cost)}.`;
}

export function buildConversionResultModel(
  input: FunnelInput,
  metrics: FunnelMetrics,
  statuses = getFunnelStatuses(input, metrics),
): ConversionResultModel {
  const analysis = analyzeBottlenecks(input, metrics, statuses);
  const type = getOverallDiagnosisType(metrics, statuses, analysis);
  const conversionsHealthy = [statuses.contactRate, statuses.bookingRate, statuses.showRate, statuses.closeRate]
    .every((status) => status === "strong" || status === "good");
  const compensatedLeadCost = (statuses.costPerLead === "attention" || statuses.costPerLead === "poor")
    && metrics.costPerContract !== null
    && metrics.costPerContract <= 40000;
  const cumulativeEconomy = conversionsHealthy && statuses.costPerContract === "poor";
  const primary = analysis.primaryBottleneck;

  let focusLabel = "ГДЕ Я БЫ СМОТРЕЛ В ПЕРВУЮ ОЧЕРЕДЬ";
  let focusTitle = "Явного слабого места не вижу";
  let focusBody = "В такой ситуации я бы уже смотрел на масштабирование: новые аудитории, офферы, GEO и увеличение объёма трафика.";
  let focusDetail: string | undefined;
  let visual: ResultVisual = "scaling";

  if (compensatedLeadCost) {
    focusTitle = "Снижать стоимость заявки любой ценой здесь не нужно";
    focusBody = "Важно понять, какие именно дорогие заявки в итоге превращаются в договоры.";
    visual = "lead_cost";
  } else if (type === "MULTIPLE_BOTTLENECKS") {
    visual = "multiple";
    if (primary === "none") {
      focusTitle = "Здесь нет одного провала — нужно смотреть всю цепочку";
      focusBody = "Стоимость накапливается постепенно, поэтому отдельная локальная конверсия не объясняет итог целиком.";
    } else {
      focusTitle = `Первым я бы всё равно проверил ${bottleneckLabels[primary]}`;
      focusBody = bottleneckContent[primary].recommendation;
    }
  } else if (primary !== "none") {
    const content = focusContent[primary];
    focusTitle = content.title;
    focusBody = content.body;
    visual = content.visual;
    if (primary === "contact_rate") focusDetail = `Сейчас до разговора доходит ${percent(metrics.contactRate)} заявок.`;
    if (primary === "show_rate") {
      const target = getDynamicConversionTargets(primary, metrics, statuses)
        .find((candidate) => candidate.achievable && candidate.requiredRate !== null);
      if (target?.requiredRate !== null && target?.requiredRate !== undefined) {
        focusDetail = `Чтобы встреча стоила не дороже ${money(target.targetCost)}, нужна доходимость около ${percent(target.requiredRate)}.`;
      }
    }
  } else if (type === "EXCELLENT" || type === "GOOD") {
    focusLabel = "ГДЕ Я БЫ СМОТРЕЛ ДАЛЬШЕ";
    focusTitle = "Здесь уже можно думать о масштабировании";
    focusBody = "Я бы смотрел новые аудитории, офферы, GEO и увеличение объёма — при этом следил, чтобы текущие показатели не начали проседать.";
  }

  const healthyEconomy = type === "EXCELLENT" || type === "GOOD";
  const teaser = healthyEconomy
    ? ["где ещё остаётся запас", "какие показатели важно сохранить", "за счёт чего можно масштабироваться"]
    : ["подробный разбор всей воронки", "что логичнее проверять первым", "персональный чек-лист следующих действий"];
  const telegramReserve = primary === "none"
    ? healthyEconomy ? "Запас — масштабирование" : "Смотрим всю цепочку"
    : type === "MULTIPLE_BOTTLENECKS"
      ? "Смотрим всю цепочку"
      : `Главный резерв — ${bottleneckLabels[primary]}`;

  return {
    overallDiagnosisType: type,
    primaryBottleneck: primary,
    primaryBottleneckImpact: analysis.primaryBottleneckImpact,
    secondaryBottleneckCount: analysis.secondaryBottlenecks.length,
    multipleBottlenecks: analysis.multipleBottlenecks,
    contractCostStatus: statuses.costPerContract,
    title: headline(type, compensatedLeadCost, cumulativeEconomy),
    summary: summary(type, metrics.costPerContract, compensatedLeadCost),
    focusLabel,
    focusTitle,
    focusBody,
    focusDetail,
    teaser,
    ctaLabel: "Отправить мою воронку и получить разбор",
    telegramReserve,
    visual,
  };
}
