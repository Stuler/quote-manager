import {useEffect, useMemo, useState} from "react";
import type { PriceListItem, QuoteDraft, QuoteItem } from "../app/types";
import { LS_KEYS } from "../app/storage";
import { useLocalStorageState } from "../app/useLocalStorageState";
import EditorPanel from "./EditorPanel";
import QuotePreview from "./QuotePreview";
import PriceListModal from "./PriceListModal";
import "../styles/app.css";
import "../styles/print.css";
import {APP_CONFIG} from "../app/config.ts";
import LogoUploader from "./LogoUploader.tsx";
import {loadStoredLogo, LOGO_LS_KEY, saveStoredLogo} from "../app/LogoStorage.ts";

function todayIso(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function addDaysIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function uid(): string {
    return crypto?.randomUUID?.() ?? String(Math.random()).slice(2);
}

const DEFAULT_DRAFT: QuoteDraft = {
    number: "2026-0001",
    createdAt: todayIso(),
    validUntil: addDaysIso(14),
    currency: "EUR",
    vatMode: "WITH_VAT", // aby to sedelo so screenshotom, kľudne daj WITHOUT_VAT
    customer: {
        name: "",
        street: "",
        city: "",
        zip: "",
        country: "Slovensko",
        ico: "",
        dic: "",
        icdph: "",
    },
    items: [
        { id: uid(), name: "", description: "", qty: 1, unit: "ks", unitPrice: 0, vatRate: 23 },
    ],
    note: "",
    view: {
        showDeliveryAddress: false,
        showIco: true,
        showDic: false,
        showIcdph: true,
        showCountry: true,
    },
};

const DEFAULT_VIEW = {
    showDeliveryAddress: false,
    showIco: true,
    showDic: false,
    showIcdph: true,
    showCountry: true,
} as const;

const DEFAULT_PRICELIST: PriceListItem[] = [
    { id: "p1", name: "Služba A", unit: "ks", unitPrice: 50, vatRate: 20, sku: "S-A" },
    { id: "p2", name: "Materiál B", unit: "ks", unitPrice: 12.5, vatRate: 20, sku: "M-B" },
];


export default function AppShell() {
    const [draft, setDraft] = useLocalStorageState<QuoteDraft>(LS_KEYS.draft, DEFAULT_DRAFT);
    const [priceList, setPriceList] = useLocalStorageState<PriceListItem[]>(LS_KEYS.pricelist, DEFAULT_PRICELIST);

    const [isPriceListOpen, setPriceListOpen] = useState(false);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    const canReset = useMemo(() => true, []);

    function updateDraft(patch: Partial<QuoteDraft>) {
        setDraft({ ...draft, ...patch });
    }

    useEffect(() => {
        setLogoDataUrl(loadStoredLogo());
    }, []);

    useEffect(() => {
        // normalize once on mount (handles old localStorage drafts)
        setDraft((prev) => ({
            ...DEFAULT_DRAFT,
            ...prev,
            customer: { ...DEFAULT_DRAFT.customer, ...(prev.customer ?? {}) },
            items: Array.isArray(prev.items) && prev.items.length > 0 ? prev.items : DEFAULT_DRAFT.items,
            view: { ...DEFAULT_VIEW, ...(prev.view ?? {}) },
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function updateLogo(next: string | null) {
        setLogoDataUrl(next);
        saveStoredLogo(next);
    }

    function updateCustomer(patch: Partial<QuoteDraft["customer"]>) {
        setDraft({ ...draft, customer: { ...draft.customer, ...patch } });
    }

    function updateItem(id: string, patch: Partial<QuoteItem>) {
        setDraft({
            ...draft,
            items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        });
    }

    function addEmptyItem() {
        setDraft({
            ...draft,
            items: [
                ...draft.items,
                { id: uid(), name: "", description: "", qty: 1, unit: "ks", unitPrice: 0, vatRate: 20 },
            ],
        });
    }

    function removeItem(id: string) {
        setDraft({ ...draft, items: draft.items.filter((it) => it.id !== id) });
    }

    function addFromPriceList(items: PriceListItem[]) {
        const mapped: QuoteItem[] = items.map((p) => ({
            id: uid(),
            name: p.name,
            description: "",
            qty: 1,
            unit: p.unit,
            unitPrice: p.unitPrice,
            vatRate: p.vatRate ?? 20,
        }));
        setDraft({ ...draft, items: [...draft.items, ...mapped] });
    }

    function printPdf() {
        window.print();
    }

    function resetAll() {
        localStorage.removeItem(LS_KEYS.draft);
        localStorage.removeItem(LS_KEYS.pricelist);
        localStorage.removeItem(LOGO_LS_KEY);

        setDraft(DEFAULT_DRAFT);
        setPriceList(DEFAULT_PRICELIST);
        setLogoDataUrl(null);
    }

    return (
        <div className="app">
            <header className="topbar no-print">
                <div className="topbar__left">
                    <strong>Cenová ponuka</strong>
                </div>
                <div className="topbar__right">
                    <LogoUploader value={logoDataUrl} onChange={updateLogo} />
                    <button className="btn" onClick={() => setPriceListOpen(true)}>Vložiť položky z cenníka</button>
                    <button className="btn" onClick={printPdf}>Stiahnuť PDF (tlač)</button>
                    {canReset && <button className="btn btn--ghost" onClick={resetAll}>Reset</button>}
                </div>
            </header>

            <main className="main">
                <aside className="panel no-print">
                    <EditorPanel
                        draft={draft}
                        onDraftChange={updateDraft}
                        onCustomerChange={updateCustomer}
                        onItemChange={updateItem}
                        onAddItem={addEmptyItem}
                        onRemoveItem={removeItem}
                    />
                </aside>

                <section className="previewWrap">
                    <QuotePreview
                        draft={draft}
                        supplier={APP_CONFIG.supplier}
                        logoUrl={logoDataUrl ?? APP_CONFIG.logoUrl}
                    />
                </section>
            </main>

            <PriceListModal
                isOpen={isPriceListOpen}
                onClose={() => setPriceListOpen(false)}
                priceList={priceList}
                onAddToQuote={(selected) => {
                    addFromPriceList(selected);
                    setPriceListOpen(false);
                }}
                onSavePriceList={setPriceList}
            />
        </div>
    );
}
