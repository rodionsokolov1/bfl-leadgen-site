import Image from "next/image";

import { smallCompanyConfig, smallCompanyPains, trustFacts } from "@/config/small-company";

import { FunnelStartLink } from "./FunnelStartLink";
import styles from "./smallCompany.module.css";

export function SmallCompanyHero() {
  return (
    <section className={styles.hero} aria-label="Диагностика воронки для частного юриста и небольшой компании">
      <div className={styles.scribbleDots} aria-hidden="true" />
      <div className={styles.frame}>
        <div className={styles.branchMark}>
          <span className={styles.number}>01</span>
          <span className={styles.eyebrow}>ТЫ ЧАСТНЫЙ ЮРИСТ ИЛИ У ТЕБЯ 1–2 ОФИСА</span>
        </div>
        <p className={styles.heroLead}>Если ты уже запускал рекламу на БФЛ, то наверняка сталкивался хотя бы с одной из этих ситуаций:</p>
        <div className={styles.painGrid}>
          {smallCompanyPains.map((pain, index) => (
            <article className={styles.painCard} key={pain.title}>
              <span className={styles.cardIndex}>0{index + 1}</span>
              <h2>{pain.title}</h2>
              {pain.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {pain.inlineText ? (
                <p className={styles.painInline}>{pain.inlineText}{" "}<strong>{pain.emphasis[0]}</strong></p>
              ) : pain.emphasis.map((paragraph) => <strong key={paragraph}>{paragraph}</strong>)}
            </article>
          ))}
        </div>
        <div className={styles.heroConclusion}>
          <p><strong>Прежде чем покупать новые заявки и искать подрядчиков, давай проверим, сколько денег ты уже теряешь внутри текущей воронки.</strong></p>
          <FunnelStartLink className={styles.primaryButton} href="#funnel-intro">Разобрать мою воронку <span>→</span></FunnelStartLink>
        </div>
      </div>
    </section>
  );
}

export function FunnelIntro() {
  return (
    <section className={styles.intro} id="funnel-intro" aria-labelledby="funnel-intro-title">
      <div className={`${styles.frame} ${styles.introContent}`}>
        <div>
          <span className={styles.eyebrow}>ДИАГНОСТИКА ВОРОНКИ</span>
          <h2 id="funnel-intro-title">За 3 минуты посмотрим, где у тебя реально теряются деньги</h2>
          <p>Не нужен доступ к рекламному кабинету, CRM или отчётам.</p>
          <p><strong>Возьми показатели за один обычный полный месяц и последовательно введи всего несколько цифр</strong></p>
        </div>
      </div>
    </section>
  );
}

export function TrustSection({ tone = "green" }: { tone?: "green" | "blue" }) {
  return (
    <section className={styles.trust} data-tone={tone} aria-labelledby="trust-title">
      <div className={styles.frame}>
        <div className={styles.trustGrid}>
          <div className={styles.trustCopy}>
            <span className={styles.trustLabel}>КОРОТКО ОБО МНЕ</span>
            <h2 id="trust-title">Я работаю с юристами по БФЛ с 2019 года</h2>
            <p className={styles.trustSubtitle}>Поэтому здесь не будет теории ради теории</p>
            <div className={styles.trustBody}>
              <p>Мой первый клиент в этой нише — «ОК-Банкрот Тюмень».<br />С ним мы работаем с 2019 года по сегодняшний день.</p>
              <p>Это важно по одной причине:<br />если бы результата не было, такое партнёрство не длилось бы годами.</p>
              <p>За это время я глубоко погрузился в рынок БФЛ и хорошо понимаю, где у юридических компаний чаще всего теряются деньги: в рекламе, обработке, дозвоне, назначении встреч и продажах.</p>
            </div>
            <blockquote className={styles.trustAccent}>Я не из тех, кто рассказывает, как “должно быть”.<br />Я смотрю на цифры, воронку и экономику — и уже потом делаю выводы.</blockquote>
          </div>
          <figure className={styles.proofVisual}>
            <div className={styles.proofScene}>
              <Image className={styles.proofGif} src={smallCompanyConfig.trustProofImage} alt="Экран телефона с реальными платежами от ОК-Банкрот" width={300} height={651} unoptimized />
              <span className={`${styles.proofNote} ${styles.proofNoteOne}`}>работаем с 2019 года</span>
              <span className={`${styles.proofNote} ${styles.proofNoteTwo}`}>реальные оплаты</span>
              <span className={`${styles.proofNote} ${styles.proofNoteThree}`}>не разовый кейс</span>
            </div>
            <figcaption>На экране — часть реальных платежей от клиента, с которым мы работаем с 2019 года.</figcaption>
          </figure>
        </div>
        <ul className={styles.factGrid}>
          {trustFacts.map((fact) => <li key={fact.value}><strong>{fact.value}</strong><span>{fact.label}</span></li>)}
        </ul>
      </div>
    </section>
  );
}
