export type CurrencyCode = "EUR" | "CZK";
export type VatMode = "WITHOUT_VAT" | "WITH_VAT";

export type Company = {
    name: string;
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
    ico?: string;
    dic?: string;
    icdph?: string;
};

export type QuoteItem = {
    id: string;
    name: string;
    description?: string;
    qty: number;
    unit: string;      // "ks"
    unitPrice: number; // bez DPH (alebo podľa tvojho režimu)
    discountPct?: number;
    vatRate?: number;  // 20
};

export type QuoteDraft = {
    number: string;
    createdAt: string;   // ISO yyyy-mm-dd
    validUntil: string;  // ISO yyyy-mm-dd
    currency: CurrencyCode;
    vatMode: VatMode;

    supplier: Company; // pre jednu firmu môže byť fixné a len read-only
    customer: Company;

    items: QuoteItem[];
    note?: string;
};

export type PriceListItem = {
    id: string;
    name: string;
    unit: string;
    unitPrice: number;
    vatRate?: number;
    sku?: string;
};
