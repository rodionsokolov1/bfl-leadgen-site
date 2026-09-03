import type { SegmentQuizChannel, SegmentQuizPayload, SegmentQuizSubmitResult } from "@/types/segment-quiz";

export type SegmentQuizTransportConfig = {
  endpoint: string;
  telegramUsername: string;
  vkContactUrl: string;
  useDevMock: boolean;
  storageNamespace: string;
  linkPrefix: string;
};

function assertToken(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
    throw new Error("Сервер вернул некорректный quiz token.");
  }
  return value;
}

function configuredTelegramUrl(token: string, config: SegmentQuizTransportConfig): string | null {
  const username = config.telegramUsername.trim().replace(/^@/, "");
  return username ? `https://t.me/${username}?start=${encodeURIComponent(`${config.linkPrefix}_${token}`)}` : null;
}

function configuredVkUrl(token: string, config: SegmentQuizTransportConfig): string | null {
  if (!config.vkContactUrl) return null;
  try {
    const url = new URL(config.vkContactUrl);
    url.searchParams.set("ref", `${config.linkPrefix}_${token}`);
    return url.toString();
  } catch {
    return null;
  }
}

function safeChannelUrl(value: unknown, channel: SegmentQuizChannel): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (channel === "telegram" && url.hostname !== "t.me") return null;
    if (channel === "vk" && url.hostname !== "vk.com" && url.hostname !== "vk.me") return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function submitToEndpoint(payload: SegmentQuizPayload, config: SegmentQuizTransportConfig): Promise<SegmentQuizSubmitResult> {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Не удалось сохранить ответы: HTTP ${response.status}.`);
  const body = await response.json() as { token?: unknown; telegramUrl?: unknown; vkUrl?: unknown };
  const token = assertToken(body.token);
  return {
    token,
    telegramUrl: safeChannelUrl(body.telegramUrl, "telegram") ?? configuredTelegramUrl(token, config),
    vkUrl: safeChannelUrl(body.vkUrl, "vk") ?? configuredVkUrl(token, config),
    mocked: false,
  };
}

function submitToDevMock(payload: SegmentQuizPayload, config: SegmentQuizTransportConfig): SegmentQuizSubmitResult {
  const token = globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  try {
    window.sessionStorage.setItem(`${config.storageNamespace}:mock-quiz:${token}`, JSON.stringify(payload));
  } catch {
    // Deep links remain available when browser storage is blocked.
  }
  return {
    token,
    telegramUrl: configuredTelegramUrl(token, config),
    vkUrl: configuredVkUrl(token, config),
    mocked: true,
  };
}

export async function submitSegmentQuiz(payload: SegmentQuizPayload, config: SegmentQuizTransportConfig): Promise<SegmentQuizSubmitResult> {
  if (config.endpoint) return submitToEndpoint(payload, config);
  if (config.useDevMock) return submitToDevMock(payload, config);
  throw new Error("Endpoint для отправки ответов пока не настроен.");
}
