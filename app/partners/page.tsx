import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";

import { SiteFooter } from "@/components/home/SiteFooter";
import { Header } from "@/components/layout/Header";
import { partnersConfig } from "@/config/partners";

import styles from "@/components/partners/partners.module.css";

export const metadata: Metadata = {
  title: "Партнёрская программа — Родион Соколов",
  description: "Партнёрская программа для маркетологов, РОМов и РОПов, которые работают с юридическими компаниями по БФЛ.",
};

const trustFacts = [
  { value: "С 2015 года", label: "в интернет-рекламе" },
  { value: "С 2019 года", label: "в БФЛ" },
  { value: "62 500+", label: "заявок на БФЛ" },
  { value: "60+", label: "посадочных страниц в работе и тестах" },
] as const;

const workSteps = [
  { title: "Разбираю текущую ситуацию", text: "Смотрю, откуда сейчас идут клиенты, что уже пробовали и какая экономика." },
  { title: "Смотрю воронку целиком", text: "Реклама → заявка → обработка → встреча → договор." },
  { title: "Предлагаю конкретный формат", text: "Если могу помочь — говорю как именно. Если не могу — не продаю лишнее." },
  { title: "Запускаем и смотрим на цифры", text: "Если система работает — продолжаем и масштабируем." },
] as const;

const partnerFit = [
  "уже получают заявки, но недовольны качеством или экономикой",
  "покупают лиды и хотят собственный источник клиентов",
  "работают в нескольких городах и хотят масштабироваться",
  "меняли подрядчиков и не понимают, где именно проблема",
  "готовы вкладываться в систему, а не искать «волшебную связку»",
] as const;

export default function PartnersPage() {
  const pageStyle = {
    "--partner-accent": partnersConfig.accent,
    "--partner-system": partnersConfig.systemAccent,
  } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle}>
      <div className={styles.top}><div className={styles.frame}><Header accent={partnersConfig.accent} homeHref="/" /></div></div>

      <section className={styles.hero} aria-labelledby="partners-title">
        <div className={`${styles.frame} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.label}>ПАРТНЁРСКАЯ ПРОГРАММА</span>
            <h1 id="partners-title">
              <span>Есть знакомые или клиенты среди юристов по БФЛ?</span>
              <span className={styles.heroTitleAccent}>Давай зарабатывать вместе.</span>
            </h1>
            <p className={styles.heroLead}>Ты знакомишь меня с компанией, которой нужен маркетинг.<br />Я сам провожу переговоры, разбираю задачу и веду проект.<br />Ты получаешь партнёрское вознаграждение.</p>
            <div className={styles.rewardGrid} aria-label="Условия партнёрского вознаграждения">
              <div><strong>30%</strong><span>с первой оплаты клиента</span></div>
              <div><strong>+ 10%</strong><span>с ежемесячных оплат в течение 3 месяцев</span></div>
            </div>
            <a className={styles.primaryButton} href={partnersConfig.telegramUrl}>Обсудить партнёрство <span>→</span></a>
            <small className={styles.buttonNote}>Можешь просто написать, кто клиент и какая у него ситуация.</small>
          </div>

          <div className={styles.heroVisual}>
            <Image
              className={styles.heroIllustration}
              src="/images/partners/partnership-handshake.png"
              alt="Деловое знакомство: рукопожатие, переданный контакт и партнёрское вознаграждение"
              width={1280}
              height={1280}
              sizes="(max-width: 1100px) 80vw, 42vw"
              priority
            />
            <span className={styles.heroVisualNote}>ты знакомишь — я беру работу на себя</span>
          </div>
        </div>
      </section>

      <section className={styles.noSelling} aria-labelledby="no-selling-title">
        <div className={`${styles.frame} ${styles.splitGrid}`}>
          <div>
            <span className={styles.label}>КАК ЭТО РАБОТАЕТ</span>
            <h2 id="no-selling-title">Тебе не нужно ничего продавать</h2>
            <p className={styles.sectionLead}>Твоя задача — просто познакомить нас.<br />Дальше всё беру на себя: сам выхожу на связь, провожу разбор, предлагаю формат работы и веду проект.</p>
          </div>
          <div className={styles.notNeeded}>
            <h3>Тебе не нужно:</h3>
            <ul>
              <li>презентовать мои услуги</li>
              <li>объяснять, как работает реклама</li>
              <li>участвовать в переговорах</li>
              <li>вести проект после знакомства</li>
            </ul>
            <strong className={styles.markerConclusion}>Привёл к диалогу → дальше моя работа</strong>
          </div>
        </div>
      </section>

      <section className={styles.trust} aria-labelledby="partner-trust-title">
        <div className={styles.frame}>
          <div className={styles.trustHeading}>
            <span className={styles.label}>КТО Я</span>
            <h2 id="partner-trust-title">Я занимаюсь лидогенерацией БФЛ с 2019 года</h2>
            <p>Не продаю пачки готовых лидов и не ограничиваюсь «настройкой Директа».<br />Я собираю под конкретную юридическую компанию систему привлечения клиентов и смотрю на всю экономику — от рекламы до встреч и договоров.</p>
          </div>
          <ul className={styles.factGrid}>
            {trustFacts.map((fact) => <li key={fact.value}><strong>{fact.value}</strong><span>{fact.label}</span></li>)}
          </ul>
          <p className={styles.proofText}>Мой первый клиент в БФЛ — «ОК-Банкрот Тюмень».<br /><strong>Работаем с 2019 года по сегодняшний день.</strong></p>
        </div>
      </section>

      <section className={styles.approach} aria-labelledby="approach-title">
        <div className={styles.frame}>
          <div className={styles.sectionHeading}>
            <span className={styles.label}>ПОДХОД К РАБОТЕ</span>
            <h2 id="approach-title">Я не начинаю с фразы «давай запустим рекламу»</h2>
          </div>
          <ol className={styles.stepGrid}>
            {workSteps.map((step, index) => (
              <li key={step.title}><span>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.fit} aria-labelledby="fit-title">
        <div className={styles.frame}>
          <div className={`${styles.splitGrid} ${styles.fitGrid}`}>
            <div>
              <span className={styles.label}>КОГО ИМЕЕТ СМЫСЛ РЕКОМЕНДОВАТЬ</span>
              <h2 id="fit-title">Лучше всего я подойду компаниям, которые уже занимаются БФЛ и хотят выстроить системный маркетинг</h2>
            </div>
            <div className={styles.fitList}>
              <ul>{partnerFit.map((item) => <li key={item}>{item}</li>)}</ul>
              <p><strong>Не уверен, подходит ли компания?</strong><br />Просто опиши ситуацию — я сам скажу, есть ли смысл нас знакомить.</p>
            </div>
          </div>

          <div className={styles.finalCard} id="partner-contact">
            <div><span className={styles.finalNote}>есть кто-то на примете?</span><h2>Есть компания на примете? Просто познакомь нас.</h2><p>Всё остальное я возьму на себя.</p></div>
            <div className={styles.finalAction}>
              <strong>30% с первой оплаты + 10% с ежемесячных оплат в течение 3 месяцев</strong>
              <a className={styles.primaryButton} href={partnersConfig.telegramUrl}>Обсудить рекомендацию в Telegram <span>→</span></a>
              <small>Достаточно просто написать, кто клиент и с чем нужна помощь.</small>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
