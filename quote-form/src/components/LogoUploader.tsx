import { useRef, useState } from "react";

type Props = {
    value: string | null; // dataURL
    onChange: (next: string | null) => void;
    buttonLabel?: string;
    removeLabel?: string;
    previewAlt?: string;
    maxWidth?: number; // px
    jpegQuality?: number; // 0..1
    outputFormat?: "image/jpeg" | "image/png";
};

async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
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

function canvasToDataUrl(
    canvas: HTMLCanvasElement,
    outputFormat: "image/jpeg" | "image/png",
    quality: number
): string {
    if (outputFormat === "image/png") {
        return canvas.toDataURL(outputFormat);
    }

    return canvas.toDataURL(outputFormat, quality);
}

async function downscaleToDataUrl(
    file: File,
    maxWidth: number,
    quality: number,
    outputFormat: "image/jpeg" | "image/png"
): Promise<string> {
    const src = await fileToDataUrl(file);
    const img = await loadImage(src);

    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    ctx.drawImage(img, 0, 0, width, height);

    return canvasToDataUrl(canvas, outputFormat, quality);
}

export default function ImageUploader({
    value,
    onChange,
    buttonLabel = "Nahrať obrázok",
    removeLabel = "Odstrániť",
    previewAlt = "Nahraný obrázok",
    maxWidth = 900,
    jpegQuality = 0.85,
    outputFormat = "image/jpeg",
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function onPick(file: File) {
        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            setError("Image is too large. Please choose a smaller file.");
            return;
        }

        try {
            const dataUrl = await downscaleToDataUrl(file, maxWidth, jpegQuality, outputFormat);

            if (dataUrl.length > 4_500_000) {
                setError("The image is still quite large. Try a smaller file.");
            }

            onChange(dataUrl);
        } catch {
            setError("Failed to process the image.");
        }
    }

    return (
        <div className="imageUploader">
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onPick(file);
                    e.currentTarget.value = "";
                }}
            />

            <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
                {buttonLabel}
            </button>

            {value && (
                <button type="button" className="btn btn--ghost" onClick={() => onChange(null)}>
                    {removeLabel}
                </button>
            )}

            {value && <img src={value} alt={previewAlt} className="imageUploader__preview" />}
            {error && <span style={{ color: "#b91c1c", fontSize: 12 }}>{error}</span>}
        </div>
    );
}
