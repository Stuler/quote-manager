import type { QuoteDraft } from "../app/types";
import { formatMoney, itemLineTotal, quoteTotal } from "../app/calc";

type Props = { draft: QuoteDraft };

export default function QuotePreview({ draft }: Props) {
    const total = quoteTotal(draft.items, draft.vatMode);

    return (
        <div className="a4" id="print-area">
            <div className="doc">
                <div className="doc__header">
                    <div className="logoBox">
                        {/* fixné logo (alebo import obrázka) */}
                        <div className="logoPlaceholder">Vaše logo</div>
                    </div>

                    <div className="titleBox">
                        <div className="title">CENOVÁ PONUKA</div>
                        <div className="subTitle">Číslo ponuky</div>
                        <div className="quoteNo">{draft.number}</div>
                    </div>
                </div>

                <div className="doc__parties">
                    <div className="party">
                        <div className="party__label">DODÁVATEĽ</div>
                        <div className="party__name">{draft.supplier.name}</div>
                        <div className="party__line">{draft.supplier.street}</div>
                        <div className="party__line">
                            {draft.supplier.zip} {draft.supplier.city}
                        </div>
                        <div className="party__line">{draft.supplier.country}</div>
                        <div className="party__meta">
                            {draft.supplier.ico && <div><strong>IČO:</strong> {draft.supplier.ico}</div>}
                            {draft.supplier.dic && <div><strong>DIČ:</strong> {draft.supplier.dic}</div>}
                            {draft.supplier.icdph && <div><strong>IČ DPH:</strong> {draft.supplier.icdph}</div>}
                        </div>
                    </div>

                    <div className="party">
                        <div className="party__label">ODBERATEĽ</div>
                        <div className="party__name">{draft.customer.name || "—"}</div>
                        <div className="party__line">{draft.customer.street || ""}</div>
                        <div className="party__line">
                            {draft.customer.zip || ""} {draft.customer.city || ""}
                        </div>
                        <div className="party__line">{draft.customer.country || ""}</div>
                        <div className="party__meta">
                            {draft.customer.ico && <div><strong>IČO:</strong> {draft.customer.ico}</div>}
                            {draft.customer.dic && <div><strong>DIČ:</strong> {draft.customer.dic}</div>}
                            {draft.customer.icdph && <div><strong>IČ DPH:</strong> {draft.customer.icdph}</div>}
                        </div>
                    </div>
                </div>

                <div className="doc__dates">
                    <div><strong>DÁTUM VYTVORENIA:</strong> {draft.createdAt}</div>
                    <div><strong>DÁTUM PLATNOSTI:</strong> {draft.validUntil}</div>
                </div>

                <div className="doc__items">
                    <div className="sectionLabel">Cenová ponuka:</div>
                    <table className="itemsTable">
                        <thead>
                        <tr>
                            <th style={{ width: "48%" }}>Názov a popis položky</th>
                            <th style={{ width: "10%" }}>Množstvo</th>
                            <th style={{ width: "10%" }}>Jednotka</th>
                            <th style={{ width: "16%" }}>Jedn. cena</th>
                            <th style={{ width: "16%" }}>Celkom</th>
                        </tr>
                        </thead>
                        <tbody>
                        {draft.items.map((it) => (
                            <tr key={it.id}>
                                <td>
                                    <div className="itName">{it.name || "—"}</div>
                                    {it.description ? <div className="itDesc">{it.description}</div> : null}
                                </td>
                                <td className="num">{it.qty}</td>
                                <td className="num">{it.unit}</td>
                                <td className="num">{formatMoney(it.unitPrice, draft.currency)}</td>
                                <td className="num">{formatMoney(itemLineTotal(it, draft.vatMode), draft.currency)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="totalBox">
                        <div className="totalBox__label">Celková suma:</div>
                        <div className="totalBox__value">{formatMoney(total, draft.currency)}</div>
                    </div>
                </div>

                <div className="doc__footer">
                    <div className="note">
                        {draft.note ? draft.note : " "}
                    </div>
                    <div className="signature">Podpis a pečiatka</div>
                </div>
            </div>
        </div>
    );
}
