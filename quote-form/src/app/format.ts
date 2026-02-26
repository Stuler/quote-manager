import type { CurrencyCode } from "./types";

export function formatMoney(value: number, currency: CurrencyCode): string {
    return new Intl.NumberFormat("sk-SK", {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatDate(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return new Intl.DateTimeFormat("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(d);
}
