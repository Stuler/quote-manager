export const LOGO_LS_KEY = "quote:logoDataUrl";

export function loadStoredLogo(): string | null {
    try {
        return localStorage.getItem(LOGO_LS_KEY);
    } catch {
        return null;
    }
}

export function saveStoredLogo(dataUrl: string | null): void {
    try {
        if (!dataUrl) {
            localStorage.removeItem(LOGO_LS_KEY);
            return;
        }
        localStorage.setItem(LOGO_LS_KEY, dataUrl);
    } catch {
        // ignore
    }
}
