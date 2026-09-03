import Image from "next/image";

import styles from "./home.module.css";

export function IntroSection() {
  return (
    <section className={`${styles.section} ${styles.intro}`} aria-labelledby="intro-title">
      <div className={styles.frame}>
        <h2 id="intro-title" className={styles.introTitle}>
          У федеральной компании, небольшого офиса<br className={styles.introTitleBreak} />{" "}
          и частного юриста разные проблемы,<br className={styles.introTitleBreak} />{" "}
          но все хотят одного — <span>качественные лиды</span>
        </h2>

        <div className={styles.introGrid}>
          <div className={styles.introCopy}>
            <blockquote className={styles.quote}>
              <p>писать про <u>У МЕНЯ САМЫЕ ЛУЧШИЕ ЛИДЫ,</u></p>
              <p>я не буду, оставлю это своим коллегам...</p>
            </blockquote>
            <p className={styles.introAside}>А возможно, проблема у тебя вообще не в лидах и мои услуги тебе сейчас не понадобятся</p>
          </div>
          <div className={styles.posterScene}>
            <Image src="/images/home/source-intro-final.svg" alt="Объявления о лидах на ограждении" fill sizes="(max-width: 850px) 100vw, 52vw" />
          </div>
        </div>

        <a className={styles.introPrompt} href="#private-lawyer">
          <strong>Давай для начала определим, кто ты<br className={styles.mobileFluidBreak} />{" "}и чем я могу быть тебе полезен:</strong>
          <span>ЛИСТАЙ НИЖЕ</span><i aria-hidden="true">↓</i>
        </a>
      </div>
    </section>
  );
}
