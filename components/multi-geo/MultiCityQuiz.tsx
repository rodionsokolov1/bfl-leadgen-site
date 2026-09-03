"use client";

import { SequentialSegmentQuiz } from "@/components/segment-quiz/SequentialSegmentQuiz";
import { multiGeoConfig } from "@/config/multi-geo";
import { submitSegmentQuiz } from "@/lib/segment-quiz/submitQuiz";
import type { SegmentQuizAnswers, SegmentQuizPayload } from "@/types/segment-quiz";

import styles from "./multiGeo.module.css";

const emptyAnswers: SegmentQuizAnswers = {
  cities_count: "",
  main_lead_source: "",
  monthly_ad_budget: "",
  sales_team_structure: "",
  main_pains: [],
};

export function MultiCityQuiz() {
  return (
    <SequentialSegmentQuiz
      id="multi-city-quiz"
      styles={styles}
      storageNamespace="multi-city"
      segment="multi_city"
      questions={multiGeoConfig.quiz.questions}
      emptyAnswers={emptyAnswers}
      offer={{
        note: "ну а дальше всё просто",
        title: "Если тебе откликается мой подход — давай попробуем",
        lead: "Начнём с тестового периода.",
        body: "5 вопросов помогут мне понять твою ситуацию и не предлагать тебе какую-то универсальную хрень “для всех”.",
        delivery: "После ответов отправлю предложение в Telegram или VK.",
      }}
      completeActionLabel="Получить предложение →"
      createPayload={({ answers, channel, trackingId, attribution }): SegmentQuizPayload => ({
        version: "multi-city-v1",
        created_at: new Date().toISOString(),
        segment: "multi_city",
        tracking_id: trackingId,
        ...answers,
        contact_messenger: channel,
        attribution,
      })}
      submitPayload={(payload) => submitSegmentQuiz(payload, {
        ...multiGeoConfig.quiz,
        storageNamespace: "multi-city",
        linkPrefix: "multi_city",
      })}
      events={{
        start: "MULTI_CITY_QUIZ_START",
        complete: "MULTI_CITY_QUIZ_COMPLETE",
        telegram: "MULTI_CITY_QUIZ_TELEGRAM",
        vk: "MULTI_CITY_QUIZ_VK",
      }}
    />
  );
}
