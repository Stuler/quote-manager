import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const first = useRef(true);

    useEffect(() => {
        // aby sa neprepísalo hneď pri mount-e (ak chceš)
        if (first.current) {
            first.current = false;
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore
        }
    }, [key, value]);

    return [value, setValue] as const;
}
