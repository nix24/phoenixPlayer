import { db } from "./db";
export async function fetchSongById(id: string) {
    const song = await db?.songs.get(id);
    if (song) return song;
    return null;
}

export function createBlobUrl(audioData: ArrayBuffer) {
    //we convert the audio data to a blob url
    return URL.createObjectURL(new Blob([audioData], { type: "audio/mpeg" }));
}

// -----------------------------------

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): Promise<ReturnType<F>> => {
        return new Promise((resolve) => {
            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(() => {
                resolve(func(...args));
            }, waitFor);
        });
    };
}

