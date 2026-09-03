import Image from "next/image";
import type { CSSProperties } from "react";

import { SocialIcon } from "@/components/home/SocialIcon";

import styles from "./siteChrome.module.css";

const socials = [
  { name: "telegram" as const, label: "Telegram" },
  { name: "vk" as const, label: "ВКонтакте" },
  { name: "whatsapp" as const, label: "WhatsApp" },
];

type HeaderProps = {
  accent?: string;
  homeHref?: string;
};

export function Header({ accent = "#d24b4b", homeHref = "#top" }: HeaderProps) {
  const style = { "--header-accent": accent } as CSSProperties;

  return (
    <header className={styles.header} style={style}>
      <a className={styles.identity} href={homeHref} aria-label="Родион Соколов — на начало страницы">
        <Image className={styles.brandLogo} src="/images/brand/rodion-avatar-logo.png" alt="Портрет Родиона Соколова" width={90} height={90} priority />
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
  );
}
