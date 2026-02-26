import { useRef, useState } from "react";

type Props = {
    value: string | null; // dataURL
    onChange: (next: string | null) => void;
    maxWidth?: number; // px
    jpegQuality?: number; // 0..1
};

async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement, quality: number): string {
    return canvas.toDataURL("image/jpeg", quality);
}

async function downscaleToJpegDataUrl(file: File, maxWidth: number, quality: number): Promise<string> {
    const src = await fileToDataUrl(file);
    const img = await loadImage(src);

    // keep aspect ratio; only downscale if needed
    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.drawImage(img, 0, 0, w, h);

    // JPEG is smaller than PNG for most uploads
    return canvasToJpegDataUrl(canvas, quality);
}

export default function LogoUploader({
                                         value,
                                         onChange,
                                         maxWidth = 900,
                                         jpegQuality = 0.85,
                                     }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function onPick(file: File) {
        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }

        // soft guard: avoid enormous files (still OK if you downscale, but safer UX)
        if (file.size > 12 * 1024 * 1024) {
            setError("Image is too large. Please choose a smaller file.");
            return;
        }

        try {
            const dataUrl = await downscaleToJpegDataUrl(file, maxWidth, jpegQuality);

            // localStorage is usually ~5MB; warn if we got a huge data URL
            if (dataUrl.length > 4_500_000) {
                setError("The logo is still quite large. Try a smaller image.");
            }

            onChange(dataUrl);
        } catch (e) {
            setError("Failed to process the image.");
        }
    }

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPick(f);
                    // allow re-selecting the same file
                    e.currentTarget.value = "";
                }}
            />

            <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
                Nahrať logo
            </button>

            {value && (
                <button type="button" className="btn btn--ghost" onClick={() => onChange(null)}>
                    Odstrániť
                </button>
            )}

            {error && <span style={{ color: "#b91c1c", fontSize: 12 }}>{error}</span>}
        </div>
    );
}
