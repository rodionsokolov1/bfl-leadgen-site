import Image from "next/image";

import { Header } from "@/components/layout/Header";

import styles from "./home.module.css";

export function Hero() {
  return (
    <section className={`${styles.section} ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.pageDots} aria-hidden="true" />
      <div className={styles.frame}>
        <Header />

        <div className={styles.heroGrid} id="top">
          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span>Привет <span className={styles.wave} aria-label="машу рукой">👋</span></span>
              <span>Занимаешься БФЛ?</span>
            </h1>
            <p className={styles.heroLead}>
              ТОГДА ТЫ КЛИКНУЛ ТУДА, КУДА НУЖНО И<br />
              <span className={styles.markerUnderline}>моя реклама работает правильно</span> 😉
            </p>
            <p className={styles.heroPromise}>
              Удели буквально пару минут на изучение<br className={styles.mobileFluidBreak} />{" "}
              сайта и я тебя не разочарую... Обещаю...
            </p>
          </div>

          <div className={styles.heroPortrait}>
            <span className={styles.portraitScribble} aria-hidden="true" />
            <Image className={styles.portraitImage} src="/images/home/rodion-portrait.svg" alt="Родион Соколов" width={584} height={850} priority />
            <span className={styles.portraitAccent} aria-hidden="true">{"///"}</span>
            <div className={styles.nameCard}><strong>Родион Соколов</strong><span>Маркетолог для БФЛ</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
