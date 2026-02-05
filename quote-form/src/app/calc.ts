import type { QuoteItem, VatMode } from "./types";

function round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function itemLineTotal(item: QuoteItem, vatMode: VatMode): number {
    const qty = item.qty || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discountPct ? item.discountPct / 100 : 0;

    const base = qty * unitPrice * (1 - discount);

    if (vatMode === "WITHOUT_VAT") {
        return round2(base);
    }

    const vatRate = (item.vatRate ?? 20) / 100;
    return round2(base * (1 + vatRate));
}

export function quoteTotal(items: QuoteItem[], vatMode: VatMode): number {
    return round2(items.reduce((sum, it) => sum + itemLineTotal(it, vatMode), 0));
}

export function formatMoney(n: number, currency: string): string {
    // jednoduché; ak chceš, sprav locale-aware Intl.NumberFormat
    return `${n.toFixed(2)} ${currency}`;
}
