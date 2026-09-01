import type { FunnelMetricKey, FunnelStatus, PrimaryBottleneck } from "@/types/funnel";

export type BenchmarkBand = {
  status: FunnelStatus;
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
};

export type FunnelBenchmark = {
  bands: readonly BenchmarkBand[];
  nextTarget: Partial<Record<FunnelStatus, number>>;
};

export const funnelBenchmarks: Record<FunnelMetricKey, FunnelBenchmark> = {
  costPerLead: {
    bands: [
      { status: "strong", max: 800, maxInclusive: false },
      { status: "good", min: 800, minInclusive: true, max: 1500, maxInclusive: false },
      { status: "attention", min: 1500, minInclusive: true, max: 2500, maxInclusive: true },
      { status: "poor", min: 2500, minInclusive: false },
    ],
    nextTarget: { good: 800, attention: 1500, poor: 2500 },
  },
  contactRate: {
    bands: [
      { status: "strong", min: .8, minInclusive: true },
      { status: "good", min: .6, minInclusive: true, max: .8, maxInclusive: false },
      { status: "attention", min: .4, minInclusive: true, max: .6, maxInclusive: false },
      { status: "poor", max: .4, maxInclusive: false },
    ],
    nextTarget: { good: .8, attention: .6, poor: .4 },
  },
  bookingRate: {
    bands: [
      { status: "strong", min: .4, minInclusive: false },
      { status: "good", min: .25, minInclusive: true, max: .4, maxInclusive: true },
      { status: "attention", min: .15, minInclusive: true, max: .25, maxInclusive: false },
      { status: "poor", max: .15, maxInclusive: false },
    ],
    nextTarget: { good: .401, attention: .25, poor: .15 },
  },
  showRate: {
    bands: [
      { status: "strong", min: .6, minInclusive: false },
      { status: "good", min: .4, minInclusive: true, max: .6, maxInclusive: true },
      { status: "attention", min: .25, minInclusive: true, max: .4, maxInclusive: false },
      { status: "poor", max: .25, maxInclusive: false },
    ],
    nextTarget: { good: .601, attention: .4, poor: .25 },
  },
  closeRate: {
    bands: [
      { status: "strong", min: .6, minInclusive: false },
      { status: "good", min: .4, minInclusive: true, max: .6, maxInclusive: true },
      { status: "attention", min: .25, minInclusive: true, max: .4, maxInclusive: false },
      { status: "poor", max: .25, maxInclusive: false },
    ],
    nextTarget: { good: .601, attention: .4, poor: .25 },
  },
};

export const benchmarkLabels: Record<FunnelMetricKey, Record<FunnelStatus, string>> = {
  costPerLead: { strong: "Сильный результат", good: "Хороший результат", attention: "Есть что докрутить", poor: "Дорого" },
  contactRate: { strong: "Сильный результат", good: "Хороший результат", attention: "В пределах, но есть что докрутить", poor: "Плохо" },
  bookingRate: { strong: "Сильный результат", good: "Хороший результат", attention: "Есть что докрутить", poor: "Плохо" },
  showRate: { strong: "Сильный результат", good: "Хороший результат", attention: "Есть что докрутить", poor: "Плохо" },
  closeRate: { strong: "Сильный результат", good: "Хороший результат", attention: "В целом приемлемо", poor: "Плохо" },
};

type BenchmarkReaction = { title: string; body?: string; advice?: readonly string[]; insight?: string };

const costAdvice = [
  "Проверить, насколько оффер попадает в ситуацию клиента.",
  "Проверить посадочную и соответствие обещания в рекламе содержанию страницы.",
  "Не гнаться за более дешёвой заявкой, если текущая дальше конвертируется сильно.",
] as const;

const contactAdvice = [
  "Проверь номер: не находится ли он в спам-базах/определителях.",
  "Проверь регион: номер должен выглядеть релевантно человеку из нужного GEO.",
  "Скорость первого звонка: ориентир — позвонить в течение 3–5 минут после заявки.",
] as const;

const bookingAdvice = [
  "Проверь релевантность скрипта офферу. Менеджер должен продолжать тот разговор, который начался в рекламе и на посадочной.",
  "Менеджер должен понимать, с какого оффера/страницы пришёл человек, а не разговаривать со всеми одинаково.",
  "Проверь, какая цель первого звонка и насколько понятно человеку, зачем ему нужна встреча.",
  "Посмотри, как отрабатываются «подумаю» / «сейчас неудобно» / «позвоните позже» и есть ли следующий конкретный шаг.",
] as const;

const showAdvice = [
  "Сократить время между назначением и встречей, если оно слишком большое.",
  "Делать подтверждение сразу после назначения с понятными временем, местом и форматом.",
  "Напоминать о встрече заранее и отдельным касанием в день встречи.",
  "Коротко напоминать, зачем человеку эта встреча и что он на ней получит, а не отправлять только техническое «ждём вас в 15:00».",
  "Для переноса или неявки нужен понятный сценарий переназначения и возврата человека в коммуникацию.",
] as const;

const closeAdvice = [
  "Как проходит консультация и насколько человек понимает ценность решения.",
  "Оффер и условия на встрече.",
  "Работа с сомнениями.",
  "Что происходит после «мне нужно подумать».",
  "Есть ли follow-up после встречи.",
] as const;

export const benchmarkReactions: Record<FunnelMetricKey, Record<FunnelStatus, BenchmarkReaction>> = {
  costPerLead: {
    strong: { title: "Стоимость заявки выглядит сильно.", body: "Но пока это только вход в воронку — смотрим, во что эти заявки превращаются дальше." },
    good: { title: "По стоимости заявки всё выглядит хорошо.", body: "Вывод о рекламе всё равно делаем только после дальнейшей конверсии." },
    attention: { title: "Здесь есть что докрутить.", body: "Я бы посмотрел оффер и посадочную, но сначала проверим качество этих заявок дальше по воронке.", advice: costAdvice },
    poor: { title: "Заявка обходится дорого. Но выводы делать рано.", body: "Если дальше она хорошо превращается во встречи и договоры, такая стоимость может быть нормальной для твоей экономики.", advice: costAdvice },
  },
  contactRate: {
    strong: { title: "С дозвоном всё очень хорошо.", body: "Здесь явной потери не видно — идём дальше." },
    good: { title: "Хороший дозвон.", body: "Основной резерв, скорее всего, находится уже после первого разговора." },
    attention: { title: "Дозвон в пределах нормы, но здесь есть запас.", body: "Даже несколько дополнительных состоявшихся разговоров могут заметно изменить экономику следующих этапов.", advice: contactAdvice },
    poor: { title: "Здесь уже есть заметная просадка.", body: "Значительная часть заявок не доходит даже до первого разговора.", advice: [...contactAdvice, "Проверь регламент повторных попыток дозвона."] },
  },
  bookingRate: {
    strong: { title: "Сильная конверсия в назначенную встречу.", body: "Первый разговор хорошо переводит человека в следующий шаг." },
    good: { title: "Хороший результат.", body: "Смотрим, сколько назначенных встреч действительно состоятся." },
    attention: { title: "Здесь есть что докрутить.", body: "Люди отвечают на звонок, но заметная часть не переходит к встрече.", advice: bookingAdvice, insight: "Если реклама обещала одно, а менеджер начинает разговор с другого — хороший лид легко превращается в «плохой»." },
    poor: { title: "Похоже, одно из слабых мест находится в первом разговоре.", body: "До человека дозвонились, но дальше воронка резко сужается.", advice: bookingAdvice, insight: "Если реклама обещала одно, а менеджер начинает разговор с другого — хороший лид легко превращается в «плохой»." },
  },
  showRate: {
    strong: { title: "Сильная доходимость.", body: "Люди не просто соглашаются на встречу — они действительно приходят." },
    good: { title: "Хороший результат.", body: "Смотрим последний этап — сколько встреч превращаются в договор." },
    attention: { title: "Здесь есть запас.", body: "Человек уже согласился на встречу, но часть ценности теряется между назначением и самой встречей.", advice: showAdvice },
    poor: { title: "Здесь воронка теряет много уже назначенных встреч.", body: "Покупать сверху больше заявок до исправления этого этапа может просто увеличить потери.", advice: showAdvice },
  },
  closeRate: {
    strong: { title: "Сильная конверсия встречи в договор." },
    good: { title: "Хороший результат на финальном этапе." },
    attention: { title: "В целом приемлемо, но есть пространство для роста.", advice: closeAdvice },
    poor: { title: "Здесь уже стоит смотреть не рекламный кабинет, а саму консультацию и дальнейшую работу с человеком.", advice: closeAdvice },
  },
};

export const bottleneckContent: Record<Exclude<PrimaryBottleneck, "none">, { title: string; body: string; recommendation: string }> = {
  cost_per_lead: {
    title: "Первым делом я бы посмотрел входящий трафик и оффер",
    body: "Стоимость заявки сейчас сильнее всего давит на итоговую экономику. Но если дальше заявки конвертируются сильно, не нужно снижать цену любой ценой.",
    recommendation: "Проверь оффер и посадочную: совпадает ли обещание в рекламе с тем, что человек видит после клика.",
  },
  contact_rate: {
    title: "Главный резерв сейчас — дозвон",
    body: "Часть заявок не доходит даже до первого разговора. До покупки дополнительного трафика я бы сначала проверил телефонию и скорость обработки.",
    recommendation: "Начни с номера и скорости звонка: проверь спам-метки, соответствие региону и первый контакт в течение 3–5 минут.",
  },
  booking_rate: {
    title: "Главный резерв — перевод разговора во встречу",
    body: "До человека дозваниваются, но дальше воронка заметно сужается.",
    recommendation: "Проверь, продолжает ли скрипт менеджера тот оффер, на который человек оставил заявку, и понимает ли клиент ценность встречи.",
  },
  show_rate: {
    title: "Главный резерв — доходимость до встречи",
    body: "Люди уже согласились на встречу, но часть из них теряется до её начала.",
    recommendation: "Проверь подтверждение, напоминания, срок до встречи и сценарий переназначения для тех, кто не пришёл.",
  },
  close_rate: {
    title: "Главный резерв находится уже после состоявшейся встречи",
    body: "До этого этапа маркетинг уже довёл человека до консультации. Здесь в первую очередь стоит смотреть саму встречу, предложение и дальнейший follow-up.",
    recommendation: "Разбери, что происходит после «мне нужно подумать» и как человек возвращается в диалог после встречи.",
  },
};

export const allGoodContent = {
  title: "Явного провала внутри воронки не видно",
  body: "По введённым цифрам основные этапы работают хорошо. В такой ситуации я бы уже смотрел на масштабирование трафика, новые аудитории, офферы и GEO, а не пытался бесконечно «чинить» рабочую воронку.",
} as const;
