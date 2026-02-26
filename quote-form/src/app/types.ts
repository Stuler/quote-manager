export type CurrencyCode = "EUR" | "CZK";
export type VatMode = "WITHOUT_VAT" | "WITH_VAT";

export type Company = {
    id: string;
    name: string;
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
    ico?: string;
    dic?: string;
    icdph?: string;
    phoneMobile?: string;
    logoDataUrl?: string | null;

    deliveryStreet?: string;
    deliveryCity?: string;
    deliveryZip?: string;
    deliveryCountry?: string;
};

export type QuoteItem = {
    id: string;
    name: string;
    description?: string;
    qty: number;
    unit: string;
    unitPrice: number; // ALWAYS bez DPH (netto)
    discountPct?: number;
    vatRate?: number;
};

export type QuoteViewSettings = {
    showDeliveryAddress: boolean;
    showIco: boolean;
    showDic: boolean;
    showIcdph: boolean;
    showCountry: boolean;
};

export type QuoteDraft = {
    number: string;
    createdAt: string;   // ISO yyyy-mm-dd
    validUntil: string;  // ISO yyyy-mm-dd
    currency: CurrencyCode;
    vatMode: VatMode;

    customer: Company;
    items: QuoteItem[];

    note?: string;

    view: QuoteViewSettings;
};

export type PriceListItem = {
    id: string;
    name: string;
    unit: string;
    unitPrice: number; // ALWAYS bez DPH
    vatRate?: number;
    sku?: string;
};
