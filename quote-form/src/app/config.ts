import logoUrl from "../assets/logo.png";
import type { Company } from "./types";

export const APP_CONFIG = {
    supplier: {
        name: "Moja Firma s.r.o.",
        street: "Ulica 1",
        city: "Bratislava",
        zip: "811 01",
        country: "Slovensko",
        ico: "12345678",
        dic: "1234567890",
        icdph: "SK1234567890",
    } satisfies Company,

    logoUrl,
} as const;
