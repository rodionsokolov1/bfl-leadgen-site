"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics/events";

import styles from "./multiGeo.module.css";

type Platform = "youtube" | "vk";
type MultiGeoVideoProps = { sources: Readonly<Record<Platform, string>> };

export function MultiGeoVideo({ sources }: MultiGeoVideoProps) {
  const [active, setActive] = useState<Platform>("youtube");
  const [playing, setPlaying] = useState(false);
  const source = sources[active];

  function selectPlatform(platform: Platform) {
    setActive(platform);
    setPlaying(false);
  }

  function playVideo() {
    trackEvent("MULTI_GEO_VIDEO_PLAY", { segment: "multi_geo", platform: active });
    setPlaying(true);
  }

  return (
    <div className={styles.videoPlayer}>
      <div className={styles.videoTabs} role="tablist" aria-label="Выбрать видеоплатформу">
        <button type="button" role="tab" aria-selected={active === "youtube"} onClick={() => selectPlatform("youtube")}>YouTube</button>
        <button type="button" role="tab" aria-selected={active === "vk"} onClick={() => selectPlatform("vk")}>VK Видео</button>
      </div>
      <div className={styles.videoShell} data-video-platform={active}>
        {playing ? (
          <iframe
            src={source}
            title={`Как я управляю рекламой БФЛ на масштабе — ${active === "youtube" ? "YouTube" : "VK Видео"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className={styles.videoPoster}>
            <div className={styles.posterMap} aria-hidden="true"><span /><span /><span /><span /><span /></div>
            <button type="button" onClick={playVideo} aria-label={`Запустить видео на ${active === "youtube" ? "YouTube" : "VK Видео"}`}>
              <span aria-hidden="true">▶</span>
            </button>
            <p>Смотреть в {active === "youtube" ? "YouTube" : "VK Видео"} · 7–9 минут</p>
          </div>
        )}
      </div>
    </div>
  );
}
