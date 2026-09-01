import Image from "next/image";

import { SocialIcon } from "./SocialIcon";
import styles from "./home.module.css";

const socials = [
  { name: "telegram" as const, label: "Telegram" },
  { name: "vk" as const, label: "ВКонтакте" },
  { name: "whatsapp" as const, label: "WhatsApp" },
];

export function SiteFooter() {
  return (
    <footer className={`${styles.section} ${styles.footer}`} id="contacts">
      <div className={`${styles.frame} ${styles.footerCard}`}>
        <div className={styles.footerIdentity}>
          <Image className={styles.footerLogo} src="/images/home/brand-logo.svg" alt="Логотип Родион Соколов" width={100} height={100} />
          <div><strong>Родион Соколов</strong><span>Маркетинг для БФЛ</span><a href="/privacy">Политика конфиденциальности</a></div>
        </div>
        <p className={styles.footerExperience}>Привлекаю клиентов<br />на БФЛ с 2019 года</p>
        <p className={styles.legal}>ИП Соколов Р.Р.<br />ИНН: 366421581<br />ОГРНИП: 1163668058597</p>
        <nav className={styles.socials} aria-label="Контакты">
          {socials.map((social) => (
            <a className={`${styles.social} ${styles[social.name]}`} href="#contacts" key={social.name}>
              <span className={styles.socialIcon}><SocialIcon name={social.name} /></span><span>{social.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
