import { derived, get, writable, type Readable } from "svelte/store";
import type { Song } from "$lib/types";
import { db } from "$lib/db";
import { search_songs } from "$lib/wasmPkg";


function createMusicStore() {
    const { subscribe, set, update } = writable<{
        songs: Song[];
        currentSong: Song | null;
        currentIndex: number;
        isPlaying: boolean;
        searchQuery: string;
    }>({
        songs: [],
        currentSong: null,
        currentIndex: -1,
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
    //helper function for gettingSongIdx using offset
    function getAdjacentSong(offset: number): { song: Song | null; index: number } {
        const store = get({ subscribe });
        if (store.songs.length === 0) {
            return { song: null, index: -1 };
        }
        const newIndex = (store.currentIndex + offset + store.songs.length) % store.songs.length;
        return {
            song: store.songs[newIndex],
            index: newIndex
        };
    }

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
                currentIndex: -1,
                isPlaying: false,
                searchQuery: ""
            })
        },

        setCurrentSong: (song: Song, index: number) => {
            update(store => ({
                ...store,
                currentSong: song,
                currentIndex: index,
                isPlaying: true
            }))
        },

        getNextSong: () => getAdjacentSong(1),

        getPreviousSong: () => getAdjacentSong(-1),
    }
}

type MusicStore = ReturnType<typeof createMusicStore>;

export const musicStore: MusicStore = createMusicStore();
