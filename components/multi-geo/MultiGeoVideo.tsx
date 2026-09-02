"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics/events";

import styles from "./multiGeo.module.css";

type MultiGeoVideoProps = { url: string };

export function MultiGeoVideo({ url }: MultiGeoVideoProps) {
  const [playing, setPlaying] = useState(false);

  function playVideo() {
    if (!url) return;
    trackEvent("MULTI_GEO_VIDEO_PLAY", { segment: "multi_geo" });
    setPlaying(true);
  }

  return (
    <div className={styles.videoShell} data-video-config={url ? "ready" : "missing"}>
      {playing ? (
        <iframe
          src={url}
          title="Как я управляю рекламой БФЛ на масштабе"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className={styles.videoPoster}>
          <div className={styles.posterMap} aria-hidden="true"><span /><span /><span /><span /><span /></div>
          <button type="button" onClick={playVideo} disabled={!url} aria-label={url ? "Запустить видео" : "Видео скоро появится"}>
            <span aria-hidden="true">▶</span>
          </button>
          <p>{url ? "Смотреть видео · 7–9 минут" : "Видео готовится · 7–9 минут"}</p>
          {!url ? <small>Место для видео уже подготовлено</small> : null}
        </div>
      )}
    </div>
  );
}
