import { derived, writable, type Readable } from "svelte/store";
import type { Song } from "$lib/types";
import { db } from "$lib/db";
import { search_songs } from "../../../wasm_utils/pkg/wasm_utils";


function createMusicStore() {
    const { subscribe, set, update } = writable<{
        songs: Song[];
        currentSong: Song | null;
        isPlaying: boolean;
        searchQuery: string;
    }>({
        songs: [],
        currentSong: null,
        isPlaying: false,
        searchQuery: ""
    });

    const filteredSongs: Readable<Song[]> = derived({ subscribe },
        ($store) => {
            const query = $store.searchQuery.toLowerCase().trim();
            if (query === "") return $store.songs;
            return search_songs($store.songs, query) as Song[];
        }
    )
    return {
        subscribe,
        set,
        update,
        filteredSongs,
        setSearchQuery: (query: string) => update(store => ({
            ...store,
            searchQuery: query
        })),

        addSongs: async (newSongs: Song[]) => {
            await db?.songs.bulkAdd(newSongs);
            update(store => ({
                ...store,
                songs: [...store.songs, ...newSongs],
            }))
        },
        deleteSong: async (id: string) => {
            await db?.songs.delete(id);
            update(store => ({
                ...store,
                songs: store.songs.filter(song => song.id !== id),
            }))
        },
        loadSongs: async () => {
            const dbSongs = await db?.songs.toArray();
            set({
                songs: dbSongs || [],
                currentSong: null,
                isPlaying: false,
                searchQuery: ""
            })
        }
    }
}

type MusicStore = ReturnType<typeof createMusicStore>;

export const musicStore: MusicStore = createMusicStore();
