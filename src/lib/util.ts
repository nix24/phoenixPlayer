import { get } from "svelte/store";
import { db } from "./db";
import { musicStore } from "./store/MusicStore";

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatTime = (time: number) => {
    //takes in seconds and returns a formatted time string in the format "hh:mm:ss"
    const [h, m, s] = [
        Math.floor(time / 3600),
        Math.floor((time % 3600) / 60),
        Math.floor(time % 60)
    ];
    return h === 0 ?
        `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` :
        `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const fetchSongById = async (id: string) => {
    const song = await db.songs.get(id);
    if (song) return song;
    return null;
};
export const deleteSong = async (id: string) => {
    const songIndex = get(musicStore).songs.findIndex(song => song.id === id);
    if (songIndex !== -1) {
        await db.songs.delete(id);
        musicStore.update(store => ({
            ...store,
            songs: [...store.songs.slice(0, songIndex), ...store.songs.slice(songIndex + 1)],
        }));
    }
};

export const createBlobUrl = (audioData: ArrayBuffer) => {
    //we convert the audio data to a blob url
    return URL.createObjectURL(new Blob([audioData], { type: "audio/mpeg" }));
};