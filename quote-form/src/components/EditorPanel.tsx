import type { QuoteDraft, QuoteItem } from "../app/types";

type Props = {
    draft: QuoteDraft;
    onDraftChange: (patch: Partial<QuoteDraft>) => void;
    onCustomerChange: (patch: Partial<QuoteDraft["customer"]>) => void;

    onItemChange: (id: string, patch: Partial<QuoteItem>) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
};

export default function EditorPanel({
                                        draft,
                                        onDraftChange,
                                        onCustomerChange,
                                        onItemChange,
                                        onAddItem,
                                        onRemoveItem,
                                    }: Props) {

    const view = draft.view ?? {
        showDeliveryAddress: false,
        showIco: true,
        showDic: false,
        showIcdph: true,
        showCountry: true,
    };

    return (
        <div className="panel__inner">
            <h2>Nastavenia</h2>

            <div className="fieldRow">
                <div className="field">
                    <label>Číslo ponuky</label>
                    <input value={draft.number} onChange={(e) => onDraftChange({ number: e.target.value })} />
                </div>

                <div className="field">
                    <label>Mena</label>
                    <select value={draft.currency} onChange={(e) => onDraftChange({ currency: e.target.value as any })}>
                        <option value="EUR">EUR</option>
                        <option value="CZK">CZK</option>
                    </select>
                </div>
            </div>

            <div className="fieldRow">
                <div className="field">
                    <label>Dátum vytvorenia</label>
                    <input type="date" value={draft.createdAt} onChange={(e) => onDraftChange({ createdAt: e.target.value })} />
                </div>
                <div className="field">
                    <label>Dátum platnosti</label>
                    <input type="date" value={draft.validUntil} onChange={(e) => onDraftChange({ validUntil: e.target.value })} />
                </div>
            </div>

            <div className="field">
                <label>Režim DPH</label>
                <select value={draft.vatMode} onChange={(e) => onDraftChange({ vatMode: e.target.value as any })}>
                    <option value="WITHOUT_VAT">Doklad bez DPH</option>
                    <option value="WITH_VAT">Doklad s DPH</option>
                </select>
            </div>

            <hr />

            <h2>Zobrazenie</h2>

            <div className="fieldRow">
                <label className="chk">
                    <input
                        type="checkbox"
                        checked={view.showDeliveryAddress}
                        onChange={(e) => onDraftChange({ view: { ...view, showDeliveryAddress: e.target.checked } })}
                    />
                    Dodacia adresa
                </label>

                <label className="chk">
                    <input
                        type="checkbox"
                        checked={view.showCountry}
                        onChange={(e) => onDraftChange({ view: { ...view, showCountry: e.target.checked } })}
                    />
                    Krajina
                </label>
            </div>

            <div className="fieldRow">
                <label className="chk">
                    <input
                        type="checkbox"
                        checked={view.showIco}
                        onChange={(e) => onDraftChange({ view: { ...view, showIco: e.target.checked } })}
                    />
                    IČO
                </label>

                <label className="chk">
                    <input
                        type="checkbox"
                        checked={view.showDic}
                        onChange={(e) => onDraftChange({ view: { ...view, showDic: e.target.checked } })}
                    />
                    DIČ
                </label>
            </div>

            <div className="fieldRow">
                <label className="chk">
                    <input
                        type="checkbox"
                        checked={view.showIcdph}
                        onChange={(e) => onDraftChange({ view: { ...view, showIcdph: e.target.checked } })}
                    />
                    IČ DPH
                </label>
            </div>

            <hr />

            <h2>Odberateľ</h2>

            <div className="field">
                <label>Názov</label>
                <input value={draft.customer.name ?? ""} onChange={(e) => onCustomerChange({ name: e.target.value })} />
            </div>

            <div className="fieldRow">
                <div className="field">
                    <label>Ulica a číslo</label>
                    <input value={draft.customer.street ?? ""} onChange={(e) => onCustomerChange({ street: e.target.value })} />
                </div>
                <div className="field">
                    <label>Mesto</label>
                    <input value={draft.customer.city ?? ""} onChange={(e) => onCustomerChange({ city: e.target.value })} />
                </div>
            </div>

            <div className="fieldRow">
                <div className="field">
                    <label>PSČ</label>
                    <input value={draft.customer.zip ?? ""} onChange={(e) => onCustomerChange({ zip: e.target.value })} />
                </div>

                {view.showCountry && (
                    <div className="field">
                        <label>Krajina</label>
                        <input
                            value={draft.customer.country ?? ""}
                            onChange={(e) => onCustomerChange({ country: e.target.value })}
                        />
                    </div>
                )}
            </div>

            {(view.showIco || view.showDic) && (
                <div className="fieldRow">
                    {view.showIco && (
                        <div className="field">
                            <label>IČO</label>
                            <input value={draft.customer.ico ?? ""} onChange={(e) => onCustomerChange({ ico: e.target.value })} />
                        </div>
                    )}

                    {view.showDic && (
                        <div className="field">
                            <label>DIČ</label>
                            <input value={draft.customer.dic ?? ""} onChange={(e) => onCustomerChange({ dic: e.target.value })} />
                        </div>
                    )}
                </div>
            )}

            {view.showIcdph && (
                <div className="field">
                    <label>IČ DPH</label>
                    <input value={draft.customer.icdph ?? ""} onChange={(e) => onCustomerChange({ icdph: e.target.value })} />
                </div>
            )}

            {view.showDeliveryAddress && (
                <>
                    <hr />
                    <h2>Dodacia adresa</h2>

                    <div className="field">
                        <label>Ulica a číslo</label>
                        <input
                            value={draft.customer.deliveryStreet ?? ""}
                            onChange={(e) => onCustomerChange({ deliveryStreet: e.target.value })}
                        />
                    </div>

                    <div className="fieldRow">
                        <div className="field">
                            <label>Mesto</label>
                            <input
                                value={draft.customer.deliveryCity ?? ""}
                                onChange={(e) => onCustomerChange({ deliveryCity: e.target.value })}
                            />
                        </div>
                        <div className="field">
                            <label>PSČ</label>
                            <input
                                value={draft.customer.deliveryZip ?? ""}
                                onChange={(e) => onCustomerChange({ deliveryZip: e.target.value })}
                            />
                        </div>
                    </div>

                    {view.showCountry && (
                        <div className="field">
                            <label>Krajina</label>
                            <input
                                value={draft.customer.deliveryCountry ?? ""}
                                onChange={(e) => onCustomerChange({ deliveryCountry: e.target.value })}
                            />
                        </div>
                    )}
                </>
            )}

            <hr />

            <h2>Položky</h2>

            <div className="items">
                {draft.items.map((it) => (
                    <div key={it.id} className="itemCard">
                        <div className="field">
                            <label>Názov</label>
                            <input value={it.name} onChange={(e) => onItemChange(it.id, { name: e.target.value })} />
                        </div>

                        <div className="field">
                            <label>Popis</label>
                            <input
                                value={it.description ?? ""}
                                onChange={(e) => onItemChange(it.id, { description: e.target.value })}
                            />
                        </div>

                        <div className="fieldRow">
                            <div className="field">
                                <label>Množstvo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={it.qty}
                                    onChange={(e) => onItemChange(it.id, { qty: Number(e.target.value) })}
                                />
                            </div>

                            <div className="field">
                                <label>Jednotka</label>
                                <input value={it.unit} onChange={(e) => onItemChange(it.id, { unit: e.target.value })} />
                            </div>
                        </div>

                        <div className="fieldRow">
                            <div className="field">
                                <label>Jedn. cena {draft.vatMode === "WITH_VAT" ? "bez DPH" : ""}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={it.unitPrice}
                                    onChange={(e) => onItemChange(it.id, { unitPrice: Number(e.target.value) })}
                                />
                            </div>

                            {draft.vatMode === "WITH_VAT" && (
                                <div className="field">
                                    <label>DPH %</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={it.vatRate ?? 23}
                                        onChange={(e) => onItemChange(it.id, { vatRate: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="fieldRow">
                            <div className="field">
                                <label>Zľava %</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={it.discountPct ?? 0}
                                    onChange={(e) => onItemChange(it.id, { discountPct: Number(e.target.value) })}
                                />
                            </div>

                            <div className="field field--actions">
                                <button type="button" className="btn btn--danger" onClick={() => onRemoveItem(it.id)}>
                                    Odstrániť
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button type="button" className="btn" onClick={onAddItem}>
                    + Pridať ďalšiu položku
                </button>
            </div>

            <hr />

            <div className="field">
                <label>Poznámka</label>
                <textarea rows={4} value={draft.note ?? ""} onChange={(e) => onDraftChange({ note: e.target.value })} />
            </div>
        </div>
    );
}
