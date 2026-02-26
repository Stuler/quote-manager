import {useEffect, useMemo, useState} from "react";
import type {Company, PriceListItem, QuoteDraft, QuoteItem} from "../app/types";
import {LS_KEYS} from "../app/storage";
import {useLocalStorageState} from "../app/useLocalStorageState";
import EditorPanel from "./EditorPanel";
import QuotePreview from "./QuotePreview";
import PriceListModal from "./PriceListModal";
import "../styles/app.css";
import "../styles/print.css";
import {APP_CONFIG} from "../app/config.ts";

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
    vatMode: "WITH_VAT",
    customer: {
        id: "",
        name: "",
        street: "",
        city: "",
        zip: "",
        country: "Slovensko",
        ico: "",
        dic: "",
        icdph: "",
    },
    items: [{ id: uid(), name: "", description: "", qty: 1, unit: "ks", unitPrice: 0, vatRate: 23 }],
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

// creates a valid default supplier (ensures id + optional fields exist)
function makeDefaultSupplier(): Company {
    return {
        ...APP_CONFIG.supplier,
        id: APP_CONFIG.supplier.id ?? crypto.randomUUID(),
        logoDataUrl: APP_CONFIG.supplier.logoDataUrl ?? null,
        phoneMobile: APP_CONFIG.supplier.phoneMobile ?? "",
    };
}

export default function AppShell() {
    const [draft, setDraft] = useLocalStorageState<QuoteDraft>(LS_KEYS.draft, DEFAULT_DRAFT);
    const [priceList, setPriceList] = useLocalStorageState<PriceListItem[]>(LS_KEYS.pricelist, DEFAULT_PRICELIST);

    // suppliers in localStorage (ensure default has id)
    const [suppliers, setSuppliers] = useLocalStorageState<Company[]>(
        LS_KEYS.suppliers,
        [
            {
                ...APP_CONFIG.supplier,
                id: APP_CONFIG.supplier.id ?? crypto.randomUUID(),
                logoDataUrl: null,
                phoneMobile: "",
            },
        ]
    );

    // active supplier id in localStorage
    const [activeSupplierId, setActiveSupplierId] = useLocalStorageState<string>(
        LS_KEYS.activeSupplierId,
        suppliers[0]?.id
    );

    // Make sure draft is always valid (old localStorage migrations)
    useEffect(() => {
        setDraft((prev) => ({
            ...DEFAULT_DRAFT,
            ...prev,
            customer: { ...DEFAULT_DRAFT.customer, ...(prev.customer ?? {}) },
            items: Array.isArray(prev.items) && prev.items.length > 0 ? prev.items : DEFAULT_DRAFT.items,
            view: { ...DEFAULT_VIEW, ...(prev.view ?? {}) },
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Normalize suppliers + ensure activeSupplierId always points to an existing supplier
    useEffect(() => {
        // 1) ensure every supplier has id + new fields
        setSuppliers((prev) => {
            return (Array.isArray(prev) && prev.length > 0 ? prev : [makeDefaultSupplier()]).map((s) => ({
                ...s,
                id: s.id && String(s.id).trim().length > 0 ? s.id : crypto.randomUUID(),
                logoDataUrl: s.logoDataUrl ?? null,
                phoneMobile: s.phoneMobile ?? "",
            }));
        });

        // 2) ensure activeSupplierId is valid
        if (!activeSupplierId || !suppliers.some((s) => s.id === activeSupplierId)) {
            const firstId = suppliers[0]?.id;
            if (firstId) setActiveSupplierId(firstId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suppliers.length]);

    const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) ?? suppliers[0];

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
            items: [...draft.items, { id: uid(), name: "", description: "", qty: 1, unit: "ks", unitPrice: 0, vatRate: 20 }],
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

    // Patch currently selected supplier (also used for per-supplier logo & phone)
    function updateActiveSupplier(patch: Partial<Company>) {
        if (!activeSupplierId) return;
        setSuppliers((prev) => prev.map((s) => (s.id === activeSupplierId ? { ...s, ...patch } : s)));
    }

    function addSupplier() {
        const newSupplier: Company = {
            id: crypto.randomUUID(),
            name: "Nový dodávateľ",
            street: "",
            city: "",
            zip: "",
            country: "",
            ico: "",
            dic: "",
            icdph: "",
            phoneMobile: "",
            logoDataUrl: null,
        };

        setSuppliers((prev) => [...prev, newSupplier]);
        setActiveSupplierId(newSupplier.id);
    }

    function removeSupplier(id: string) {
        if (suppliers.length <= 1) return;

        const next = suppliers.filter((s) => s.id !== id);
        setSuppliers(next);
        setActiveSupplierId(next[0].id);
    }

    function printPdf() {
        window.print();
    }

    function resetAll() {
        localStorage.removeItem(LS_KEYS.draft);
        localStorage.removeItem(LS_KEYS.pricelist);
        localStorage.removeItem(LS_KEYS.suppliers);
        localStorage.removeItem(LS_KEYS.activeSupplierId);

        const first: Company = {
            ...APP_CONFIG.supplier,
            id: APP_CONFIG.supplier.id ?? crypto.randomUUID(),
            logoDataUrl: null,
            phoneMobile: "",
        };

        setDraft(DEFAULT_DRAFT);
        setPriceList(DEFAULT_PRICELIST);
        setSuppliers([first]);
        setActiveSupplierId(first.id);
    }

    return (
        <div className="app">
            <header className="topbar no-print">
                <div className="topbar__left">
                    <strong>Cenová ponuka</strong>
                </div>

                <div className="topbar__right">
                    <button className="btn" onClick={() => setPriceListOpen(true)}>
                        Vložiť položky z cenníka
                    </button>

                    <button className="btn" onClick={printPdf}>
                        Stiahnuť PDF (tlač)
                    </button>

                    {canReset && (
                        <button className="btn btn--ghost" onClick={resetAll}>
                            Reset
                        </button>
                    )}
                </div>
            </header>

            <main className="main">
                <aside className="panel no-print">
                    {activeSupplier && (
                        <EditorPanel
                            draft={draft}
                            supplier={activeSupplier}
                            suppliers={suppliers}
                            activeSupplierId={activeSupplierId}
                            onSelectSupplier={setActiveSupplierId}
                            onAddSupplier={addSupplier}
                            onRemoveSupplier={removeSupplier}
                            onSupplierChange={updateActiveSupplier}
                            onDraftChange={updateDraft}
                            onCustomerChange={updateCustomer}
                            onItemChange={updateItem}
                            onAddItem={addEmptyItem}
                            onRemoveItem={removeItem}
                        />
                    )}
                </aside>

                <section className="previewWrap">
                    {activeSupplier && (
                        <QuotePreview
                            draft={draft}
                            supplier={activeSupplier}
                            logoUrl={activeSupplier.logoDataUrl ?? APP_CONFIG.logoUrl}
                        />
                    )}
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
