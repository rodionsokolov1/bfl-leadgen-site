import type { AttributionData } from "@/types/attribution";

export type MultiCityQuizAnswers = {
  cities_count: string;
  main_lead_source: string;
  monthly_ad_budget: string;
  sales_team_structure: string;
  main_pains: string[];
};

export type MultiCityQuizPayload = MultiCityQuizAnswers & {
  version: "multi-city-v1";
  created_at: string;
  segment: "multi_city";
  tracking_id: string;
  attribution: AttributionData;
};

export type MultiCityQuizChannel = "telegram" | "vk";
