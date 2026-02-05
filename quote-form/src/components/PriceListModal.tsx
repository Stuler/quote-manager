import { useMemo, useState } from "react";
import type { PriceListItem } from "../app/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;

    priceList: PriceListItem[];
    onSavePriceList: (next: PriceListItem[]) => void;

    onAddToQuote: (selected: PriceListItem[]) => void;
};

export default function PriceListModal({
                                           isOpen,
                                           onClose,
                                           priceList,
                                           onSavePriceList,
                                           onAddToQuote,
                                       }: Props) {
    const [query, setQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return priceList;
        return priceList.filter((p) =>
            [p.name, p.sku].filter(Boolean).some((x) => String(x).toLowerCase().includes(q))
        );
    }, [priceList, query]);

    if (!isOpen) return null;

    const selected = priceList.filter((p) => selectedIds[p.id]);

    function toggle(id: string) {
        setSelectedIds((m) => ({ ...m, [id]: !m[id] }));
    }

    function addNewQuick() {
        const id = `pl-${Date.now()}`;
        const next: PriceListItem = { id, name: "Nová položka", unit: "ks", unitPrice: 0, vatRate: 20 };
        onSavePriceList([next, ...priceList]);
    }

    return (
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal__head">
                    <strong>Cenník</strong>
                    <button className="btn btn--ghost" onClick={onClose}>Zavrieť</button>
                </div>

                <div className="modal__tools">
                    <input
                        placeholder="Hľadať..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="btn" onClick={addNewQuick}>+ Pridať do cenníka</button>
                    <button
                        className="btn"
                        disabled={selected.length === 0}
                        onClick={() => onAddToQuote(selected)}
                    >
                        Vložiť vybrané ({selected.length})
                    </button>
                </div>

                <div className="modal__body">
                    <table className="simpleTable">
                        <thead>
                        <tr>
                            <th></th>
                            <th>Názov</th>
                            <th>SKU</th>
                            <th>Jednotka</th>
                            <th>Jedn. cena</th>
                            <th>DPH %</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedIds[p.id]}
                                        onChange={() => toggle(p.id)}
                                    />
                                </td>
                                <td>{p.name}</td>
                                <td>{p.sku ?? ""}</td>
                                <td>{p.unit}</td>
                                <td className="num">{p.unitPrice.toFixed(2)}</td>
                                <td className="num">{(p.vatRate ?? 20).toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <p className="muted">
                        (Základ: selection + vloženie. Editáciu cenníka vieme doplniť neskôr cez inline edit v tabuľke.)
                    </p>
                </div>
            </div>
        </div>
    );
}
