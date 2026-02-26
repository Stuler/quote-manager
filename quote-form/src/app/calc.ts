import type { QuoteItem, VatMode } from "./types";

function round2(n: number) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function discMul(discountPct?: number) {
    const d = (discountPct ?? 0) / 100;
    return 1 - d;
}

export function lineNet(item: QuoteItem): number {
    const qty = item.qty || 0;
    const unitNet = item.unitPrice || 0; // ALWAYS net
    return round2(qty * unitNet * discMul(item.discountPct));
}

export function lineVat(item: QuoteItem): number {
    const rate = (item.vatRate ?? 0) / 100;
    return round2(lineNet(item) * rate);
}

export function lineGross(item: QuoteItem): number {
    return round2(lineNet(item) + lineVat(item));
}

export function lineTotal(item: QuoteItem, vatMode: VatMode): number {
    return vatMode === "WITH_VAT" ? lineGross(item) : lineNet(item);
}

export function quoteTotal(items: QuoteItem[], vatMode: VatMode): number {
    return round2(items.reduce((s, it) => s + lineTotal(it, vatMode), 0));
}

export type VatSummaryRow = {
    vatRate: number;
    base: number;
    vat: number;
    total: number;
};

export function vatSummary(items: QuoteItem[]): VatSummaryRow[] {
    const map = new Map<number, { base: number; vat: number; total: number }>();

    for (const it of items) {
        const rate = it.vatRate ?? 0;
        const base = lineNet(it);
        const vat = lineVat(it);
        const total = round2(base + vat);

        const cur = map.get(rate) ?? { base: 0, vat: 0, total: 0 };
        cur.base = round2(cur.base + base);
        cur.vat = round2(cur.vat + vat);
        cur.total = round2(cur.total + total);
        map.set(rate, cur);
    }

    return [...map.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([vatRate, v]) => ({ vatRate, ...v }));
}
