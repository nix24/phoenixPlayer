import { writable } from "svelte/store";
import type { Song } from "$lib/types";

export const musicStore = writable<{
    songs: Song[];
    currentSong: Song | null;
    isPlaying: boolean;
}>({
    songs: [],
    currentSong: null,
    isPlaying: false
})
