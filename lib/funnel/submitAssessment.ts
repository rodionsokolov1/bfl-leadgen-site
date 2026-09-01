import { smallCompanyConfig } from "@/config/small-company";
import type { FunnelAssessmentPayload } from "@/types/funnel";

export interface SubmitAssessmentResult {
  token: string;
  telegramUrl: string | null;
  mocked: boolean;
}

function telegramUrl(token: string): string | null {
  const username = smallCompanyConfig.telegram.botUsername.trim().replace(/^@/, "");
  return username ? `https://t.me/${username}?start=${encodeURIComponent(`funnel_${token}`)}` : null;
}

function assertToken(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
    throw new Error("Сервер вернул некорректный assessment token.");
  }
  return value;
}

async function submitToEndpoint(payload: FunnelAssessmentPayload): Promise<SubmitAssessmentResult> {
  const response = await fetch(smallCompanyConfig.telegram.assessmentEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Не удалось сохранить воронку: HTTP ${response.status}.`);
  const body = await response.json() as { token?: unknown; telegramUrl?: unknown };
  const token = assertToken(body.token);
  return {
    token,
    telegramUrl: typeof body.telegramUrl === "string" && body.telegramUrl.startsWith("https://t.me/") ? body.telegramUrl : telegramUrl(token),
    mocked: false,
  };
}

function submitToDevMock(payload: FunnelAssessmentPayload): SubmitAssessmentResult {
  const token = payload.assessmentId.replaceAll("-", "").slice(0, 16);
  try {
    window.sessionStorage.setItem(`small-company:mock-assessment:${token}`, JSON.stringify(payload));
  } catch {
    // The in-memory flow and generated token remain usable when storage is blocked.
  }
  return { token, telegramUrl: telegramUrl(token), mocked: true };
}

export async function submitFunnelAssessment(payload: FunnelAssessmentPayload): Promise<SubmitAssessmentResult> {
  if (smallCompanyConfig.telegram.assessmentEndpoint) return submitToEndpoint(payload);
  if (smallCompanyConfig.telegram.useDevMock) return submitToDevMock(payload);
  throw new Error("Endpoint для отправки воронки пока не настроен.");
}
