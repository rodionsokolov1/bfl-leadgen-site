"use client";

import { useState } from "react";

import { smallCompanyConfig } from "@/config/small-company";
import { trackEvent } from "@/lib/analytics/events";

import styles from "./smallCompany.module.css";

type Platform = "youtube" | "vk";

export function ProofVideoTabs() {
  const [active, setActive] = useState<Platform>(smallCompanyConfig.videoSources.youtube ? "youtube" : smallCompanyConfig.videoSources.vk ? "vk" : "youtube");
  const [playing, setPlaying] = useState(false);
  const source = smallCompanyConfig.videoSources[active];
  const hasVideo = Boolean(smallCompanyConfig.videoSources.youtube || smallCompanyConfig.videoSources.vk);

  function select(platform: Platform) {
    setActive(platform);
    setPlaying(false);
  }

  function play() {
    if (!source) return;
    setPlaying(true);
    trackEvent("SMALL_TRUST_VIDEO_PLAY", { platform: active, segment: "small_company" });
  }

  return (
    <section className={styles.video} aria-labelledby="proof-video-title">
      <div className={`${styles.frame} ${styles.videoGrid}`}>
        <div>
          <span className={styles.eyebrow}>РАБОЧАЯ КУХНЯ</span>
          <h2 id="proof-video-title">Лучше один раз показать, чем ещё десять раз написать</h2>
          <p>Я записал короткий разбор и показал часть своей реальной рабочей кухни:</p>
          <ul>
            <li>объём заявок;</li><li>Matomba;</li><li>Power BI одного крупного проекта;</li><li>количество протестированных посадочных;</li><li>как я смотрю на рекламу и дальнейшую воронку.</li>
          </ul>
          <strong className={styles.videoCaption}>Без нарисованных кейсов — показываю то, с чем реально работаю.</strong>
        </div>
        <div className={styles.videoCard}>
          <div className={styles.videoTabs} role="tablist" aria-label="Платформа видео">
            <button type="button" role="tab" aria-selected={active === "youtube"} disabled={!smallCompanyConfig.videoSources.youtube} onClick={() => select("youtube")}>YouTube</button>
            <button type="button" role="tab" aria-selected={active === "vk"} disabled={!smallCompanyConfig.videoSources.vk} onClick={() => select("vk")}>VK Видео</button>
          </div>
          <div className={styles.videoPlaceholder}>
            {playing && source ? <iframe src={source} title={`Proof-видео: ${active}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <><button type="button" aria-label="Запустить proof-видео" disabled={!source} onClick={play}>▶</button><p>{hasVideo ? "Нажми, чтобы запустить видео" : "Видео будет подключено после передачи финальных URL"}</p></>}
          </div>
        </div>
      </div>
    </section>
  );
}
