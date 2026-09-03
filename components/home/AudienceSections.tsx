import Image from "next/image";

import styles from "./home.module.css";

export function AudienceSections() {
  return (
    <>
      <section className={`${styles.section} ${styles.audience} ${styles.greenSection}`} id="private-lawyer" aria-labelledby="private-title">
        <div className={`${styles.frame} ${styles.audienceFrame}`}>
          <div className={styles.audienceCopy}>
            <header className={styles.audienceHeading}>
              <span className={styles.number}>01</span>
              <div><span className={styles.eyebrow}>ТЫ ЧАСТНЫЙ ЮРИСТ</span><h2 id="private-title">или у тебя небольшая компания</h2></div>
            </header>
            <div className={styles.bodyCopy}>
              <p>Скорее всего, у тебя ограниченный<br />маркетинговый бюджет и бесконечно<br />тестировать маркетологов в поисках<br />«лучшего» — так себе стратегия.</p>
              <p><strong>Узнай за 3 минуты,</strong> где в небольшой<br className={styles.mobileFluidBreak} />{" "}БФЛ-компании чаще всего <strong>теряются деньги:</strong><br className={styles.mobileFluidBreak} />{" "}реклама, лиды, обработка или продажи.<br className={styles.mobileFluidBreak} />{" "}И станет понятнее, нужен ли тебе вообще<br className={styles.mobileFluidBreak} />{" "}новый маркетолог.</p>
            </div>
            <a className={styles.actionButton} href="/quiz">Посмотреть, где теряются деньги <span>→</span></a>
          </div>
          <div className={`${styles.scene} ${styles.privateScene}`}>
            <Image src="/images/home/source-private-lawyer-web-v2.svg" alt="Родион за рабочим столом с ноутбуком" fill sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.audience} ${styles.blueSection}`} aria-labelledby="multi-title">
        <div className={`${styles.frame} ${styles.audienceFrame} ${styles.reverse}`}>
          <div className={`${styles.scene} ${styles.multiScene}`}>
            <Image src="/images/home/source-multi-office-web.svg" alt="Единая система распределения заявок по офисам" fill sizes="(max-width: 900px) 100vw, 57vw" />
          </div>
          <div className={styles.audienceCopy}>
            <header className={styles.audienceHeading}>
              <span className={styles.number}>02</span>
              <div><span className={styles.eyebrow}>У ТЕБЯ НЕСКОЛЬКО ОФИСОВ</span><h2 id="multi-title">или работаешь в нескольких городах</h2></div>
            </header>
            <div className={styles.bodyCopy}>
              <p>Тебе, скорее всего, уже нужны не просто заявки.<br className={styles.mobileFluidBreak} />{" "}Нужно попадать в KPI по качеству, встречам<br className={styles.mobileFluidBreak} />{" "}и договорам — и масштабировать то, что<br className={styles.mobileFluidBreak} />{" "}действительно приносит деньги.</p>
              <p><strong>Посмотри, как я привлёк более 62 500 заявок<br className={styles.mobileFluidBreak} />{" "}за 8 месяцев 2026 года</strong> на более чем <strong>60 разных</strong><br className={styles.mobileFluidBreak} />{" "}посадочных страничек для своих партнёров.</p>
            </div>
            <a className={styles.actionButton} href="/multi-geo" data-analytics-event="SEGMENT_MULTI_GEO_OPEN">Посмотреть, как устроена система <span>→</span></a>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.audience} ${styles.orangeSection}`} aria-labelledby="partner-title">
        <div className={`${styles.frame} ${styles.audienceFrame}`}>
          <div className={styles.audienceCopy}>
            <header className={styles.audienceHeading}>
              <span className={styles.number}>03</span>
              <div><span className={styles.eyebrow}>А возможно ты</span><h2 id="partner-title">Маркетолог, РОМ или РОП</h2></div>
            </header>
            <div className={styles.bodyCopy}>
              <p>Скорее всего, ты пришёл посмотреть,<br />что тут придумал коллега, и утащить пару идей.</p>
              <p>Нормально, «кради как художник».</p>
              <p>А если хочешь зарабатывать вместе со мной,<br className={styles.mobileFluidBreak} />{" "}то переходи ниже:</p>
            </div>
            <a className={styles.actionButton} href="/partners">Посмотреть, как можем работать вместе <span>→</span></a>
          </div>
          <div className={`${styles.scene} ${styles.partnerScene}`}>
            <Image src="/images/home/source-partner-web-v2.svg" alt="Рабочее место маркетолога с аналитикой и заметками" fill sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
        </div>
      </section>
    </>
  );
}
