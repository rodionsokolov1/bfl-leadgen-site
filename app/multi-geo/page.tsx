import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { SiteFooter } from "@/components/home/SiteFooter";
import { Header } from "@/components/layout/Header";
import { MultiGeoAnalytics } from "@/components/multi-geo/MultiGeoAnalytics";
import { MultiGeoVideo } from "@/components/multi-geo/MultiGeoVideo";
import { multiGeoConfig } from "@/config/multi-geo";

import styles from "@/components/multi-geo/multiGeo.module.css";

export const metadata: Metadata = {
  title: "Несколько офисов и GEO — система лидогенерации БФЛ",
  description: "Как управлять рекламой, посадочными, заявками и экономикой БФЛ-компании в нескольких GEO.",
};

const problemSections: Array<{
  index: string;
  title: ReactNode;
  body: ReactNode;
  visual: "geo" | "economy" | "chain" | "scale";
}> = [
  {
    index: "01",
    title: <>В одном GEO работает.<br />В другом — нет.</>,
    body: <><p>Запускаешь одну и ту же связку в нескольких городах.</p><p>В одном городе лиды нормальные.<br />В другом — дорого.<br />В третьем — заявок полно, но продажники говорят,<br />что продавать нечего.</p><p>Одна «волшебная связка» не масштабируется<br />одинаково на всю страну.</p></>,
    visual: "geo",
  },
  {
    index: "02",
    title: <>Общий CPL красивый.<br />Экономика по офисам — непонятная.</>,
    body: <><p>Маркетинг показывает:<br />«Средний лид — всё хорошо».</p><p>Но один офис может зарабатывать,<br />второй работать около нормы,<br />а третий просто съедать бюджет.</p><p>Средняя цифра легко скрывает то,<br />что происходит внутри системы.</p></>,
    visual: "economy",
  },
  {
    index: "03",
    title: <>Чем больше заявок —<br />тем сложнее понимать их качество</>,
    body: <><p>На небольшом объёме ещё можно спросить продажников:<br />«Ну как там лиды?»</p><p>На сотнях и тысячах обращений эта модель перестаёт работать.</p><p>Нужно видеть отдельно:</p></>,
    visual: "chain",
  },
  {
    index: "04",
    title: <>Масштабируешь бюджет,<br />но не уверен, что масштабируешь прибыль</>,
    body: <><p>Было больше заявок → стало ещё больше заявок.</p><p>Красиво.</p><p>Но если договоры не растут вместе с ними,<br />то масштабировались не продажи.</p><p>Масштабировались расходы.</p></>,
    visual: "scale",
  },
];

const systemSteps = ["GEO", "РЕКЛАМА", "ОФФЕР", "ПОСАДОЧНАЯ", "ЗАЯВКА", "CRM / ОТДЕЛ ПРОДАЖ", "ВСТРЕЧА", "ДОГОВОР", "ОБРАТНАЯ СВЯЗЬ"];
const evidenceSlots = ["Скрин Direct", "Скрин Метрики", "Посадочные", "CRM", "GEO / статистика"];
const trustFacts = [
  ["БФЛ с 2019 года", "Не изучаю нишу на твоём бюджете."],
  ["62 000+ заявок за 8 месяцев", "Опыт работы не с одной красивой рекламной кампанией, а с большим объёмом."],
  ["55+ посадочных страниц", "Не верю в одну универсальную посадочную для всех GEO."],
  ["Смотрю дальше CPL", "Реклама → заявка → качество → встреча → договор."],
];

function ProblemVisual({ type }: { type: "geo" | "economy" | "chain" | "scale" }) {
  if (type === "geo") return <div className={`${styles.problemVisual} ${styles.geoVisual}`} aria-label="Схема трёх GEO с разной динамикой"><span><i /></span><span><i /></span><span><i /></span></div>;
  if (type === "economy") return <div className={`${styles.problemVisual} ${styles.economyVisual}`} aria-label="Экономика трёх офисов"><span /><span /><span /><em>а где именно мы зарабатываем?</em></div>;
  if (type === "chain") return <div className={`${styles.problemVisual} ${styles.chainVisual}`} aria-label="Цепочка оценки качества"><span>источник</span><i>→</i><span>GEO</span><i>→</i><span>оффер</span><i>→</i><span>посадочная</span><i>→</i><span>качество</span><i>→</i><span>встреча</span><i>→</i><span>договор</span></div>;
  return <div className={`${styles.problemVisual} ${styles.scaleVisual}`} aria-label="Заявки растут быстрее договоров"><div><span>заявки</span><i /></div><div><span>договоры</span><i /></div><em>рост ≠ прибыль</em></div>;
}

export default function MultiGeoPage() {
  return (
    <main className={styles.page} style={{ "--accent": multiGeoConfig.accent } as CSSProperties}>
      <MultiGeoAnalytics />
      <div className={styles.top}><div className={styles.frame}><Header accent={multiGeoConfig.accent} homeHref="/" /></div></div>

      <section className={styles.hero} aria-labelledby="multi-geo-title">
        <div className={`${styles.frame} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.branchMark}><span>02</span><strong>НЕСКОЛЬКО ОФИСОВ ИЛИ GEO</strong></div>
            <h1 id="multi-geo-title">Если у тебя несколько офисов<br />или ты работаешь сразу в нескольких городах</h1>
            <p className={styles.heroLead}>скорее всего, проблема уже не в том,<br />где взять ещё лидов.</p>
            <div className={styles.heroBody}><p>У тебя уже есть реклама, менеджеры, заявки<br />и какая-то рабочая система.</p><p>Но при попытке расти всё становится заметно сложнее.</p></div>
          </div>
          <div className={styles.heroVisual}>
            <Image src="/images/home/source-multi-office-web.svg" alt="Нарисованная карта с несколькими GEO и единой системой управления" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
            <p className={styles.heroNote}>масштабировать ≠<br />просто увеличить бюджет</p>
            <small>схема без привязки к реальным данным</small>
          </div>
        </div>
        <a className={styles.scrollCue} href="#problems"><span>дальше — по системе</span><i>↓</i></a>
      </section>

      <section className={styles.problems} id="problems" aria-labelledby="problems-title">
        <div className={styles.frame}>
          <header className={styles.sectionHeader}><span>где обычно начинает ломаться</span><h2 id="problems-title">Скорее всего, хотя бы одна<br />из этих ситуаций тебе знакома</h2></header>
          <div className={styles.problemList}>
            {problemSections.map((problem) => (
              <article className={styles.problemRow} key={problem.index}>
                <div className={styles.problemIndex}>{problem.index}</div>
                <div className={styles.problemCopy}><h3>{problem.title}</h3><div>{problem.body}</div></div>
                <div className={styles.problemArt}><ProblemVisual type={problem.visual} /></div>
              </article>
            ))}
          </div>
          <blockquote className={styles.bigConclusion}><span>Масштабировать нужно не лиды.</span><strong>Масштабировать нужно работающую экономику.</strong></blockquote>
        </div>
      </section>

      <section className={styles.videoIntro} aria-labelledby="video-intro-title">
        <div className={styles.frame}>
          <span className={styles.kicker}>Ладно. Хватит теории.</span>
          <h2 id="video-intro-title">Покажу, как это устроено у меня</h2>
          <div className={styles.stats}>
            <p><strong>62 000+</strong><span>заявок<br />за 8 месяцев 2026 года</span></p>
            <p><strong>55+</strong><span>разных<br />посадочных страниц</span></p>
          </div>
          <div className={styles.videoIntroCopy}><p>И самое интересное здесь не количество заявок.</p><p>А то, как управлять таким объёмом<br />и не превратить рекламу в хаос.</p></div>
        </div>
      </section>

      <section className={styles.videoSection} aria-labelledby="video-title">
        <div className={styles.frame}>
          <div className={styles.videoHeading}>
            <div><span>ВИДЕО · 7–9 МИНУТ</span><h2 id="video-title">Как я управляю рекламой БФЛ на масштабе:<br />62 000+ заявок, 55+ посадочных и несколько GEO</h2></div>
            <p>Что из этой системы можно забрать<br />в твою компанию.</p>
          </div>
          <MultiGeoVideo url={multiGeoConfig.videoUrl} />
          <p className={styles.videoNote}>не секретная связка — архитектура работы</p>
        </div>
      </section>

      <section className={styles.system} data-multi-geo-system aria-labelledby="system-title">
        <div className={styles.frame}>
          <header className={styles.sectionHeader}><h2 id="system-title">Вот что я называю системой</h2><span>Яндекс — только один кусок</span></header>
          <div className={styles.systemDiagram}>
            {systemSteps.map((step, index) => <div className={styles.systemStep} key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < systemSteps.length - 1 ? <i aria-hidden="true">→</i> : null}</div>)}
            <div className={styles.feedbackLoop}><i>↺</i><span>обратно в рекламу</span></div>
          </div>
          <p className={styles.systemNote}>масштабируем то, что подтверждается деньгами</p>
        </div>
      </section>

      <section className={styles.evidence} aria-labelledby="evidence-title">
        <div className={styles.frame}>
          <header className={styles.sectionHeader}><h2 id="evidence-title">Без красивых кейсов<br />из трёх скриншотов</h2><p>Мне важнее показать не одну удачную кампанию,<br />а масштаб системы, с которой я работаю каждый день.</p></header>
          <div className={styles.evidenceGrid}>
            {evidenceSlots.map((slot, index) => <div className={styles.evidenceSlot} key={slot}><span>{String(index + 1).padStart(2, "0")}</span><strong>{slot}</strong><small>реальный материал будет здесь</small></div>)}
          </div>
          <p className={styles.evidenceNote}>только реальные кабинеты, посадочные и CRM</p>
        </div>
      </section>

      <section className={styles.trust} aria-labelledby="trust-title">
        <div className={styles.frame}>
          <header className={styles.sectionHeader}><span>спокойно, по фактам</span><h2 id="trust-title">Почему мне можно доверять</h2></header>
          <ol className={styles.trustGrid}>{trustFacts.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
          <div className={styles.trustThesis}><strong>НЕ БИРЖА ЛИДОВ.</strong><span>СИСТЕМА ПОД ТВОЮ КОМПАНИЮ.</span></div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-title">
        <div className={`${styles.frame} ${styles.finalCard}`}>
          <div><span className={styles.kicker}>следующий шаг</span><h2 id="final-title">Хочешь понять,<br />что можно масштабировать у тебя?</h2></div>
          <div className={styles.finalCopy}><p>Покажи мне, как сейчас устроены<br />реклама, GEO, посадочные и путь до договора.</p><p>Я посмотрю систему и скажу,<br />где вижу точки роста<br />и есть ли вообще смысл нам работать вместе.</p><a href={multiGeoConfig.finalCtaUrl} data-analytics-event="MULTI_GEO_FINAL_CTA">Разобрать мою систему привлечения <span>→</span></a></div>
          <span className={styles.finalArrow} aria-hidden="true">↘</span>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
