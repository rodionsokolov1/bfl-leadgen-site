import Image from "next/image";

import { SocialIcon } from "./SocialIcon";
import styles from "./home.module.css";

const socials = [
  { name: "telegram" as const, label: "Telegram" },
  { name: "vk" as const, label: "ВКонтакте" },
  { name: "whatsapp" as const, label: "WhatsApp" },
];

export function Hero() {
  return (
    <section className={`${styles.section} ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.pageDots} aria-hidden="true" />
      <div className={styles.frame}>
        <header className={styles.header}>
          <a className={styles.identity} href="#top" aria-label="Родион Соколов — на начало страницы">
            <Image className={styles.brandLogo} src="/images/home/brand-logo.svg" alt="Логотип Родион Соколов" width={90} height={90} />
            <span className={styles.identityText}>
              <strong>Родион Соколов</strong>
              <small>Маркетинг для БФЛ</small>
            </span>
          </a>
          <p className={styles.experience}>Привлекаю клиентов<br />для юристов с 2019 года</p>
          <nav className={styles.socials} aria-label="Социальные сети">
            {socials.map((social) => (
              <a className={`${styles.social} ${styles[social.name]}`} href="#contacts" key={social.name}>
                <span className={styles.socialIcon}><SocialIcon name={social.name} /></span>
                <span>{social.label}</span>
              </a>
            ))}
          </nav>
        </header>

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
