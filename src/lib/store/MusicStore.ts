import { writable } from "svelte/store";
import type { Song } from "$lib/types";


function createMusicStore() {
    const { subscribe, set, update } = writable<{
        songs: Song[];
        filteredSongs: Song[];
        currentSong: Song | null;
        isPlaying: boolean;
    }>({
        songs: [],
        filteredSongs: [],
        currentSong: null,
        isPlaying: false
    });
    function filterSongs(songs: Song[], query: string) {
        const normalizedQuery = query.toLowerCase().trim();
        return songs.filter(song => {
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();

            return title.includes(normalizedQuery) || artist.includes(normalizedQuery);
        });
    }
    return {
        subscribe,
        set,
        update,
        filterSongs: (query: string) => update(store => {
            console.log("Filtering with query: ", query);
            const filtered = filterSongs(store.songs, query);
            console.log("Filtered songs: ", filtered);
            return { ...store, filteredSongs: filtered };
        })
    }
}

export const musicStore = createMusicStore();
