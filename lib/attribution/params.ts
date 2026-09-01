import { attributionKeys, type AttributionData } from "@/types/attribution";

export function readAttributionParams(search: string | URLSearchParams): AttributionData {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return attributionKeys.reduce<AttributionData>((data, key) => {
    const value = params.get(key);
    if (value) data[key] = value;
    return data;
  }, {});
}

export function appendAttributionParams(path: string, attribution: AttributionData): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(attribution)) {
    if (value && !params.has(key)) params.set(key, value);
  }
  const serialized = params.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}
