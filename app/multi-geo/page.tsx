import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { SiteFooter } from "@/components/home/SiteFooter";
import { Header } from "@/components/layout/Header";
import { MultiGeoAnalytics } from "@/components/multi-geo/MultiGeoAnalytics";
import { MultiCityQuiz } from "@/components/multi-geo/MultiCityQuiz";
import { MultiGeoVideo } from "@/components/multi-geo/MultiGeoVideo";
import { TrustSection } from "@/components/small-company/StaticSections";
import { multiGeoConfig } from "@/config/multi-geo";

import styles from "@/components/multi-geo/multiGeo.module.css";

export const metadata: Metadata = {
  title: "Несколько офисов и городов — система лидогенерации БФЛ",
  description: "Как управлять рекламой, посадочными, заявками и экономикой БФЛ-компании в нескольких городах.",
};

const problemSections: Array<{
  index: string;
  title: string;
  body: ReactNode;
  visual: "geo" | "chain" | "scale";
}> = [
  {
    index: "01",
    title: "В одном городе работает. В другом — нет.",
    body: <><p>Работаешь с одним подрядчиком в нескольких городах.</p><p>В одном городе лиды нормальные. В другом — дорого. В третьем — заявок полно, но продажники говорят, что все лиды говно.</p><p>Одна «волшебная связка» не масштабируется одинаково на все города.</p></>,
    visual: "geo",
  },
  {
    index: "02",
    title: "Цена лида низкая. Экономика по офисам — не бьётся.",
    body: <><p>Маркетолог говорит: смотри, сколько много недорогих заявок...</p><p>Но с этими заявками отдел продаж не справляется: один офис может зарабатывать, второй работать около нуля, а третий просто сливать всё подряд...</p></>,
    visual: "chain",
  },
  {
    index: "03",
    title: "Просто добавить денег в рекламу — не масштабирование",
    body: <><p>Сделать в два раза больше заявок обычно проще, чем сделать в два раза больше договоров.</p><p>Если не понимать, какие города, связки и офисы реально приносят деньги, вместе с объёмом начинают расти и потери.</p></>,
    visual: "scale",
  },
];

function ProblemVisual({ type }: { type: "geo" | "chain" | "scale" }) {
  const visuals = {
    geo: { src: "/images/multi-geo/problem-geo-pencil.jpg", alt: "Карта России с офисами в разных регионах" },
    chain: { src: "/images/multi-geo/problem-quality-pencil.jpg", alt: "Менеджер проверяет качество входящих заявок" },
    scale: { src: "/images/multi-geo/problem-scale-pencil.jpg", alt: "Поток заявок растёт быстрее количества договоров" },
  } satisfies Record<typeof type, { src: string; alt: string }>;
  const visual = visuals[type];

  return <div className={styles.problemVisual}><Image src={visual.src} alt={visual.alt} fill sizes="(max-width: 900px) 100vw, 46vw" /></div>;
}

export default function MultiGeoPage() {
  return (
    <main className={styles.page} style={{ "--accent": multiGeoConfig.accent } as CSSProperties}>
      <MultiGeoAnalytics />
      <div className={styles.top}><div className={styles.frame}><Header accent={multiGeoConfig.accent} homeHref="/" /></div></div>

      <section className={styles.hero} aria-labelledby="multi-geo-title">
        <div className={`${styles.frame} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.branchMark}><span>02</span><strong>НЕСКОЛЬКО ОФИСОВ ИЛИ ГОРОДОВ</strong></div>
            <h1 id="multi-geo-title">Если у тебя несколько офисов или ты работаешь сразу в нескольких городах</h1>
            <a className={styles.heroBridge} href="#problems">Скорее всего, хотя бы одна из этих ситуаций тебе знакома: <span>↓</span></a>
          </div>
        </div>
      </section>

      <section className={styles.problems} id="problems" aria-label="Типичные проблемы при работе в нескольких городах">
        <div className={styles.frame}>
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
            <p><strong>62 500+</strong><span>заявок за 8 месяцев 2026 года</span></p>
            <p><strong>60+</strong><span>сайтов</span></p>
            <p><strong>сотни</strong><span>городов в РФ</span></p>
          </div>
          <div className={styles.videoIntroCopy}><p>И самое интересное здесь не количество заявок.</p><p>А то, как управлять таким объёмом и не превратить рекламу в хаос.</p></div>
        </div>
      </section>

      <section className={styles.videoSection} aria-labelledby="video-title">
        <div className={styles.frame}>
          <div className={styles.videoHeading}>
            <div><span>ВИДЕО · 7–9 МИНУТ</span><h2 id="video-title">Как я управляю рекламой БФЛ на масштабе: 62 500+ заявок, на 60+ сайтах и сотни городов в РФ</h2></div>
          </div>
          <MultiGeoVideo url={multiGeoConfig.videoUrl} />
          <p className={styles.videoNote}>не секретная связка — архитектура работы</p>
        </div>
      </section>

      <TrustSection tone="blue" />

      <MultiCityQuiz />

      <SiteFooter />
    </main>
  );
}
