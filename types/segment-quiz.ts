import type { AttributionData } from "@/types/attribution";

export type SegmentQuizChannel = "telegram" | "vk";

export type SegmentQuizAnswers = Record<string, string | string[]>;

export type SegmentQuizQuestion =
  | { key: string; title: string; type: "single"; options: readonly string[] }
  | { key: string; title: string; type: "multi"; options: readonly string[]; note?: string }
  | { key: string; title: string; type: "text"; placeholder: string };

export type SegmentQuizPayload = {
  version: string;
  created_at: string;
  segment: string;
  tracking_id: string;
  attribution: AttributionData;
  contact_messenger?: SegmentQuizChannel;
  [key: string]: unknown;
};

export type SegmentQuizSubmitResult = {
  token: string;
  telegramUrl: string | null;
  vkUrl: string | null;
  mocked: boolean;
};
