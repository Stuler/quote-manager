import { useMemo, useState } from "react";
import type { PriceListItem, QuoteDraft, QuoteItem } from "../app/types";
import { LS_KEYS } from "../app/storage";
import { useLocalStorageState } from "../app/useLocalStorageState";
import EditorPanel from "./EditorPanel";
import QuotePreview from "./QuotePreview";
import PriceListModal from "./PriceListModal";
import "../styles/app.css";
import "../styles/print.css";

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
    vatMode: "WITHOUT_VAT",
    supplier: {
        name: "Moja Firma s.r.o.",
        street: "Ulica 1",
        city: "Bratislava",
        zip: "811 01",
        country: "Slovensko",
        ico: "12345678",
        dic: "1234567890",
        icdph: "SK1234567890",
    },
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
        { id: uid(), name: "", description: "", qty: 1, unit: "ks", unitPrice: 0, vatRate: 20 },
    ],
    note: "",
};

const DEFAULT_PRICELIST: PriceListItem[] = [
    { id: "p1", name: "Služba A", unit: "ks", unitPrice: 50, vatRate: 20, sku: "S-A" },
    { id: "p2", name: "Materiál B", unit: "ks", unitPrice: 12.5, vatRate: 20, sku: "M-B" },
];

export default function AppShell() {
    const [draft, setDraft] = useLocalStorageState<QuoteDraft>(LS_KEYS.draft, DEFAULT_DRAFT);
    const [priceList, setPriceList] = useLocalStorageState<PriceListItem[]>(LS_KEYS.pricelist, DEFAULT_PRICELIST);

    const [isPriceListOpen, setPriceListOpen] = useState(false);

    const canReset = useMemo(() => true, []);

    function updateDraft(patch: Partial<QuoteDraft>) {
        setDraft({ ...draft, ...patch });
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
        setDraft(DEFAULT_DRAFT);
        setPriceList(DEFAULT_PRICELIST);
    }

    return (
        <div className="app">
            <header className="topbar no-print">
                <div className="topbar__left">
                    <strong>Cenová ponuka</strong>
                </div>
                <div className="topbar__right">
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
                    <QuotePreview draft={draft} />
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
