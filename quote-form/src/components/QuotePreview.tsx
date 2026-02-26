import type { Company, QuoteDraft } from "../app/types";
import { formatDate, formatMoney } from "../app/format";
import { lineGross, lineNet, quoteTotal, vatSummary } from "../app/calc";

type Props = {
    draft: QuoteDraft;
    supplier: Company;
    logoUrl: string;
};

function Placeholder({ children }: { children: string }) {
    return <span className="ph">{children}</span>;
}

function safe(v?: string) {
    return (v ?? "").trim();
}

function PartyLine({ value, placeholder }: { value?: string; placeholder: string }) {
    const v = safe(value);
    return v ? <span>{v}</span> : <Placeholder>{placeholder}</Placeholder>;
}

export default function QuotePreview({ draft, supplier, logoUrl }: Props) {
    const total = quoteTotal(draft.items, draft.vatMode);
    const summary = draft.vatMode === "WITH_VAT" ? vatSummary(draft.items) : [];

    const showIco = draft.view.showIco;
    const showDic = draft.view.showDic;
    const showIcdph = draft.view.showIcdph;
    const showCountry = draft.view.showCountry;
    const showDelivery = draft.view.showDeliveryAddress;

    return (
        <div className="a4" id="print-area">
            <div className="doc">
                <div className="doc__header">
                    <div className="logoBox">
                        <img src={logoUrl} alt="Logo" className="logoImg" />
                    </div>

                    <div className="titleBox">
                        <div className="title">CENOVÁ PONUKA</div>
                        <div className="subTitle">Číslo ponuky</div>
                        <div className="quoteNo">{draft.number || <Placeholder>—</Placeholder>}</div>
                    </div>
                </div>

                <div className="doc__parties">
                    <div className="party">
                        <div className="party__label">DODÁVATEĽ</div>

                        <div className="party__name">
                            {safe(supplier.name) ? supplier.name : <Placeholder>Začnite písať meno alebo IČO</Placeholder>}
                        </div>

                        <div className="party__line">
                            <PartyLine value={supplier.street} placeholder="Ulica a číslo" />
                        </div>

                        <div className="party__line">
                            <PartyLine value={supplier.zip} placeholder="PSČ" />{" "}
                            <PartyLine value={supplier.city} placeholder="Mesto" />
                        </div>

                        {showCountry && (
                            <div className="party__line">
                                <PartyLine value={supplier.country} placeholder="Krajina" />
                            </div>
                        )}

                        <div className="party__meta">
                            {showIco && (
                                <div>
                                    <strong>IČO:</strong>{" "}
                                    {safe(supplier.ico) ? supplier.ico : <Placeholder>IČO</Placeholder>}
                                </div>
                            )}
                            {showDic && (
                                <div>
                                    <strong>DIČ:</strong>{" "}
                                    {safe(supplier.dic) ? supplier.dic : <Placeholder>DIČ</Placeholder>}
                                </div>
                            )}
                            {showIcdph && (
                                <div>
                                    <strong>IČ DPH:</strong>{" "}
                                    {safe(supplier.icdph) ? supplier.icdph : <Placeholder>IČ DPH</Placeholder>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="party">
                        <div className="party__label">ODBERATEĽ</div>

                        <div className="party__name">
                            {safe(draft.customer.name) ? draft.customer.name : <Placeholder>Začnite písať meno alebo IČO</Placeholder>}
                        </div>

                        <div className="party__line">
                            <PartyLine value={draft.customer.street} placeholder="Ulica a číslo" />
                        </div>

                        <div className="party__line">
                            <PartyLine value={draft.customer.zip} placeholder="PSČ" />{" "}
                            <PartyLine value={draft.customer.city} placeholder="Mesto" />
                        </div>

                        {showCountry && (
                            <div className="party__line">
                                <PartyLine value={draft.customer.country} placeholder="Krajina" />
                            </div>
                        )}

                        <div className="party__meta">
                            {showIco && (
                                <div>
                                    <strong>IČO:</strong>{" "}
                                    {safe(draft.customer.ico) ? draft.customer.ico : <Placeholder>IČO</Placeholder>}
                                </div>
                            )}
                            {showDic && (
                                <div>
                                    <strong>DIČ:</strong>{" "}
                                    {safe(draft.customer.dic) ? draft.customer.dic : <Placeholder>DIČ</Placeholder>}
                                </div>
                            )}
                            {showIcdph && (
                                <div>
                                    <strong>IČ DPH:</strong>{" "}
                                    {safe(draft.customer.icdph) ? draft.customer.icdph : <Placeholder>IČ DPH</Placeholder>}
                                </div>
                            )}
                        </div>

                        {showDelivery && (
                            <div className="deliveryBox">
                                <div className="deliveryLabel">Dodacia adresa</div>
                                <div className="party__line">
                                    <PartyLine value={draft.customer.deliveryStreet} placeholder="Ulica a číslo" />
                                </div>
                                <div className="party__line">
                                    <PartyLine value={draft.customer.deliveryZip} placeholder="PSČ" />{" "}
                                    <PartyLine value={draft.customer.deliveryCity} placeholder="Mesto" />
                                </div>
                                {showCountry && (
                                    <div className="party__line">
                                        <PartyLine value={draft.customer.deliveryCountry} placeholder="Krajina" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="doc__dates">
                    <div><strong>DÁTUM VYTVORENIA:</strong> {formatDate(draft.createdAt)}</div>
                    <div><strong>DÁTUM PLATNOSTI:</strong> {formatDate(draft.validUntil)}</div>
                </div>

                <div className="doc__items">
                    <div className="sectionLabel">Cenová ponuka:</div>

                    <table className="itemsTable">
                        <thead>
                        <tr>
                            <th style={{ width: "44%" }}>Názov a popis položky</th>
                            <th style={{ width: "10%" }}>Množstvo</th>
                            <th style={{ width: "10%" }}>Jednotka</th>

                            {draft.vatMode === "WITH_VAT" ? (
                                <>
                                    <th style={{ width: "14%" }}>Jedn. cena<br/>bez DPH</th>
                                    <th style={{ width: "8%" }}>DPH</th>
                                    <th style={{ width: "14%" }}>Celkom {draft.currency}<br/>s DPH</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ width: "13%" }}>Jedn. cena</th>
                                    <th style={{ width: "13%" }}>Celkom</th>
                                </>
                            )}
                        </tr>
                        </thead>

                        <tbody>
                        {draft.items.map((it) => (
                            <tr key={it.id}>
                                <td>
                                    <div className="itName">{safe(it.name) ? it.name : <Placeholder>Názov položky</Placeholder>}</div>
                                    {safe(it.description) ? <div className="itDesc">{it.description}</div> : null}
                                </td>
                                <td className="num">{it.qty}</td>
                                <td className="num">{it.unit}</td>

                                {draft.vatMode === "WITH_VAT" ? (
                                    <>
                                        <td className="num">{formatMoney(it.unitPrice, draft.currency)}</td>
                                        <td className="num">{(it.vatRate ?? 0).toFixed(0)}%</td>
                                        <td className="num">{formatMoney(lineGross(it), draft.currency)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="num">{formatMoney(it.unitPrice, draft.currency)}</td>
                                        <td className="num">{formatMoney(lineNet(it), draft.currency)}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {draft.vatMode === "WITH_VAT" ? (
                        <div className="vatSummaryRow">
                            <table className="vatTable">
                                <thead>
                                <tr>
                                    <th>Sadzba DPH</th>
                                    <th className="num">Základ dane</th>
                                    <th className="num">DPH</th>
                                    <th className="num">Celkom s DPH</th>
                                </tr>
                                </thead>
                                <tbody>
                                {summary.map((r) => (
                                    <tr key={r.vatRate}>
                                        <td>{r.vatRate.toFixed(0)}%</td>
                                        <td className="num">{formatMoney(r.base, draft.currency)}</td>
                                        <td className="num">{formatMoney(r.vat, draft.currency)}</td>
                                        <td className="num">{formatMoney(r.total, draft.currency)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="totalBox">
                                <div className="totalBox__label">Celková suma:</div>
                                <div className="totalBox__value">{formatMoney(total, draft.currency)}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="totalBox">
                            <div className="totalBox__label">Celková suma:</div>
                            <div className="totalBox__value">{formatMoney(total, draft.currency)}</div>
                        </div>
                    )}

                    {draft.vatMode === "WITH_VAT" && (
                        <div className="vatNote">Dodávateľ je platiteľom DPH.</div>
                    )}
                </div>

                <div className="doc__footer">
                    <div className="note">{safe(draft.note) ? draft.note : " "}</div>
                    <div className="signature">Podpis a pečiatka</div>
                </div>
            </div>
        </div>
    );
}
