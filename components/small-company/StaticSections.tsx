import Image from "next/image";

import { smallCompanyConfig, smallCompanyPains, trustFacts } from "@/config/small-company";

import { FunnelStartLink } from "./FunnelStartLink";
import styles from "./smallCompany.module.css";

export function SmallCompanyHero() {
  return (
    <section className={styles.hero} aria-labelledby="small-company-title">
      <div className={styles.scribbleDots} aria-hidden="true" />
      <div className={styles.frame}>
        <div className={styles.branchMark}>
          <span className={styles.number}>01</span>
          <span className={styles.eyebrow}>ТЫ ЧАСТНЫЙ ЮРИСТ ИЛИ У ТЕБЯ 1–2 ОФИСА</span>
        </div>
        <h1 id="small-company-title">Скорее всего, дело не только в количестве лидов</h1>
        <p className={styles.heroLead}>Если ты уже запускал рекламу на БФЛ, то наверняка сталкивался хотя бы с одной из этих ситуаций:</p>
        <div className={styles.painGrid}>
          {smallCompanyPains.map((pain, index) => (
            <article className={styles.painCard} key={pain.title}>
              <span className={styles.cardIndex}>0{index + 1}</span>
              <h2>{pain.title}</h2>
              <p>{pain.body}</p>
              <strong>{pain.emphasis}</strong>
            </article>
          ))}
        </div>
        <div className={styles.heroConclusion}>
          <p>Поэтому прежде чем предлагать тебе ещё рекламу, <strong>давай сначала проверим, нужна ли тебе она вообще.</strong></p>
          <FunnelStartLink className={styles.primaryButton} href="#funnel-intro">Разобрать мою воронку <span>→</span></FunnelStartLink>
        </div>
      </div>
    </section>
  );
}

export function FunnelIntro() {
  return (
    <section className={styles.intro} id="funnel-intro" aria-labelledby="funnel-intro-title">
      <div className={`${styles.frame} ${styles.introGrid}`}>
        <div>
          <span className={styles.eyebrow}>ДИАГНОСТИКА ВОРОНКИ</span>
          <h2 id="funnel-intro-title">За 3 минуты посмотрим, где у тебя реально теряются деньги</h2>
          <p>Не нужен доступ к рекламному кабинету, CRM или отчётам.</p>
          <p>Возьми показатели <strong>за один обычный полный месяц</strong> и последовательно введи всего несколько цифр.</p>
        </div>
        <div className={styles.pathCard}>
          <p>Мы посмотрим путь:</p>
          <strong>лид → дозвон → назначенная встреча → состоявшаяся встреча → договор.</strong>
          <ul>
            <li>сколько стоит каждый следующий этап;</li>
            <li>где происходит самая большая потеря;</li>
            <li>что сильнее всего влияет на стоимость договора;</li>
            <li>есть ли смысл покупать больше лидов прямо сейчас.</li>
          </ul>
          <p className={styles.note}>Не знаешь точную цифру? Укажи примерно — для первичной диагностики хватит.</p>
          <FunnelStartLink className={styles.primaryButton} href="#funnel-start">Начать с лидов <span>→</span></FunnelStartLink>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className={styles.trust} aria-labelledby="trust-title">
      <div className={styles.frame}>
        <span className={styles.eyebrow}>СПРАВЕДЛИВЫЙ ВОПРОС</span>
        <h2 id="trust-title">А ты вообще кто такой и почему тебе можно доверять?</h2>
        <div className={styles.trustGrid}>
          <div className={styles.trustCopy}>
            <h3>Работаю с юристами с 2019 года</h3>
            <p className={styles.veteran}>Я не наблюдатель, я ветеран этого рынка</p>
            <p>Мой первый клиент на БФЛ <strong>«ОК-Банкрот Тюмень» — работаем с 2019 г. по сей день.</strong></p>
            <blockquote>Там, где другие только тестируют — я уже знаю, что сработает. Там, где учились — я преподавал.<br /><br />Я не наблюдатель — я один из немногих, кто реально делает результат в этой нише. Иначе партнёры не работали бы со мной годами.</blockquote>
          </div>
          <div className={styles.proofVisual}>
            {smallCompanyConfig.trustProofImage ? (
              <Image src={smallCompanyConfig.trustProofImage} alt="Подтверждение работы с клиентом с 2019 года" fill sizes="(max-width: 900px) 100vw, 42vw" />
            ) : (
              <div className={styles.proofMissing}>
                <Image src="/images/home/rodion-portrait.svg" alt="Родион Соколов" width={420} height={610} />
                <p>Реальный скрин подтверждения будет подключён здесь после передачи исходного ассета.</p>
              </div>
            )}
          </div>
        </div>
        <ul className={styles.factGrid}>
          {trustFacts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      </div>
    </section>
  );
}
