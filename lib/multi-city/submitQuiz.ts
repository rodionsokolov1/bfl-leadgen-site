import { multiGeoConfig } from "@/config/multi-geo";
import { submitSegmentQuiz } from "@/lib/segment-quiz/submitQuiz";
import type { SegmentQuizSubmitResult } from "@/types/segment-quiz";
import type { MultiCityQuizPayload } from "@/types/multi-city-quiz";

export type MultiCityQuizSubmitResult = SegmentQuizSubmitResult;

export function submitMultiCityQuiz(payload: MultiCityQuizPayload): Promise<MultiCityQuizSubmitResult> {
  return submitSegmentQuiz(payload, {
    ...multiGeoConfig.quiz,
    storageNamespace: "multi-city",
    linkPrefix: "multi_city",
  });
}
