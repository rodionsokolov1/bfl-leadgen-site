import type { FunnelField, FunnelInput } from "@/types/funnel";

export const funnelFieldLabels: Record<FunnelField, string> = {
  leadsCount: "Количество заявок",
  costPerLead: "Средняя стоимость заявки",
  contactedCount: "Состоялся разговор с",
  meetingsBooked: "Назначено встреч",
  meetingsHeld: "Встреч состоялось",
  contractsCount: "Заключено договоров",
};

export function validateFunnelField(field: FunnelField, input: FunnelInput): string | undefined {
  const value = input[field];
  if (!Number.isFinite(value)) return "Укажи число.";
  if (field !== "costPerLead" && !Number.isInteger(value)) return "Укажи целое число.";
  if (value < 0) return "Значение не может быть отрицательным.";
  if (field === "leadsCount" && value <= 0) return "Количество заявок должно быть больше нуля.";
  if (field === "costPerLead" && value <= 0) return "Стоимость заявки должна быть больше нуля.";
  if (field === "contactedCount" && value > input.leadsCount) return "Разговоров не может быть больше, чем заявок.";
  if (field === "meetingsBooked" && value > input.contactedCount) return "Встреч не может быть больше, чем состоявшихся разговоров.";
  if (field === "meetingsHeld" && value > input.meetingsBooked) return "Состоявшихся встреч не может быть больше, чем назначенных.";
  if (field === "contractsCount" && value > input.meetingsHeld) return "Договоров не может быть больше, чем состоявшихся встреч.";
  return undefined;
}

export function validateFunnelInput(input: FunnelInput): Partial<Record<FunnelField, string>> {
  return (Object.keys(input) as FunnelField[]).reduce<Partial<Record<FunnelField, string>>>((errors, field) => {
    const error = validateFunnelField(field, input);
    if (error) errors[field] = error;
    return errors;
  }, {});
}
