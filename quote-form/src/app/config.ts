import logoUrl from "../assets/logo.png";
import type { Company } from "./types";

export const APP_CONFIG = {
    supplier: {
        id: "agropuls",
        name: "Agropuls s.r.o",
        street: "Čsl. Armády 1117",
        city: "Trebišov",
        zip: "075 01",
        country: "Slovensko",
        ico: "36677469",
        dic: "2022252100",
        icdph: "SK2022252100",
        logoDataUrl: logoUrl,
        phoneMobile: "",
    } satisfies Company,

    logoUrl,
} as const;
