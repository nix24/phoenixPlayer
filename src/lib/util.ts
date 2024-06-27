import { get } from "svelte/store";
import { db } from "./db";
import { musicStore } from "./store/MusicStore";

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function fetchSongById(id: string) {
    const song = await db.songs.get(id);
    if (song) return song;
    return null;
}
export async function deleteSong(id: string) {
    const songIndex = get(musicStore).songs.findIndex(song => song.id === id);
    if (songIndex !== -1) {
        await db.songs.delete(id);
        musicStore.update(store => ({
            ...store,
            songs: [...store.songs.slice(0, songIndex), ...store.songs.slice(songIndex + 1)],
        }));
    }
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