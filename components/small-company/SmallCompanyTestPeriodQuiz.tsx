"use client";

import { SequentialSegmentQuiz } from "@/components/segment-quiz/SequentialSegmentQuiz";
import { smallCompanyConfig } from "@/config/small-company";
import { submitSegmentQuiz } from "@/lib/segment-quiz/submitQuiz";
import type { SegmentQuizAnswers, SegmentQuizPayload } from "@/types/segment-quiz";

import styles from "./smallCompany.module.css";

const emptyAnswers: SegmentQuizAnswers = {
  lead_source: "",
  yandex_experience: "",
  monthly_lead_capacity: "",
  lead_priority: "",
  city_region: "",
};

export function SmallCompanyTestPeriodQuiz() {
  return (
    <SequentialSegmentQuiz
      id="test-period-quiz"
      styles={styles}
      storageNamespace="small-company"
      segment="small_company"
      questions={smallCompanyConfig.testPeriodQuiz.questions}
      emptyAnswers={emptyAnswers}
      offer={{
        note: "ну а дальше всё просто",
        title: "Если тебе откликается мой подход — давай попробуем",
        lead: "Начнём с тестового периода.",
        body: "5 вопросов помогут мне понять твою ситуацию и не предлагать тебе какую-то универсальную хрень «для всех».",
        delivery: "После ответов отправлю предложение в Telegram или VK.",
      }}
      completeActionLabel="Продолжить →"
      createPayload={({ answers, channel, trackingId, attribution }): SegmentQuizPayload => ({
        version: "small-company-test-period-v1",
        created_at: new Date().toISOString(),
        segment: "small_company",
        tracking_id: trackingId,
        ...answers,
        contact_messenger: channel,
        attribution,
      })}
      submitPayload={(payload) => submitSegmentQuiz(payload, {
        ...smallCompanyConfig.testPeriodQuiz,
        storageNamespace: "small-company",
        linkPrefix: "small_company",
      })}
      events={{
        start: "SMALL_COMPANY_QUIZ_START",
        complete: "SMALL_COMPANY_QUIZ_COMPLETE",
        telegram: "SMALL_COMPANY_QUIZ_TELEGRAM",
        vk: "SMALL_COMPANY_QUIZ_VK",
      }}
    />
  );
}
