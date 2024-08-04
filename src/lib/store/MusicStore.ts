import { derived, get, writable, type Readable } from "svelte/store";
import type { GlobalQueue, PlayList, Song } from "$lib/types";
import { db } from "$lib/db";
import { search_songs } from "$lib/wasmPkg";

interface MusicStoreState {
    songs: Map<string, Song>;
    playlist: PlayList | null;
    globalQueue: GlobalQueue | null;
    isPlaying: boolean;
    searchQuery: string;
    filteredSongs: Song[];
}
function createMusicStore() {
    const { subscribe, set, update } = writable<MusicStoreState>({
        songs: new Map<string, Song>(),
        playlist: null,
        globalQueue: null,
        isPlaying: false,
        searchQuery: "",
        filteredSongs: []
    });

    const filteredSongs = derived({ subscribe }, ($store) => {
        const query = $store.searchQuery.toLowerCase();
        return Array.from($store.songs.values()).filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.album.toLowerCase().includes(query)
        );
    });


    return {
        subscribe,
        set,
        update,
        initializeStore: async () => {
            const songs = await db?.songs.toArray();
            const globalQueue = await db?.globalQueue.toCollection().first();

            set({
                songs: new Map(songs?.map(song => [song.id || '', song])),
                globalQueue: globalQueue || {
                    firstSongId: null,
                    lastSongId: null,
                    currentSongId: null,
                    totalSongs: 0,
                },
                playlist: null,
                isPlaying: false,
                searchQuery: "",
                filteredSongs: []
            });
        },
        addSong: async (song: Omit<Song, "id" | "prevId" | "nextId">) => {
            return db?.transaction("rw", db.songs, db.globalQueue, async () => {
                const newSong: Song = {
                    ...song,
                    prevId: null,
                    nextId: null
                }
                const id = await db?.songs.add(newSong);
                newSong.id = id;

                let queue = await db?.globalQueue.toCollection().first();
                if (!queue) {
                    queue = {
                        firstSongId: id ?? null,
                        lastSongId: id ?? null,
                        currentSongId: id ?? null,
                        totalSongs: 1
                    }
                    await db?.globalQueue.add(queue);
                } else {
                    if (queue.lastSongId) {
                        const lastSong = await db?.songs.get(queue.lastSongId);
                        if (lastSong) {
                            lastSong.nextId = id ?? null;
                            lastSong.prevId = lastSong.id ?? null;

                            await db?.songs.put(lastSong);
                        }
                    }

                    queue.lastSongId = id ?? null;
                    if (!queue.firstSongId) queue.firstSongId = id ?? null;
                    if (!queue.currentSongId) queue.currentSongId = id ?? null;
                    queue.totalSongs++;
                    await db?.globalQueue.put(queue);
                }

                update(store => {
                    store.songs.set(id || '', newSong);
                    return store;
                });

                return id;
            })
        },
        removeSong: async (id: string) => {
            return db?.transaction('rw', db.songs, db.globalQueue, async () => {
                const song = await db?.songs.get(id);
                if (!song) return;

                const queue = await db?.globalQueue.toCollection().first();
                if (!queue) return;

                if (song.prevId) {
                    const prevSong = await db?.songs.get(song.prevId);
                    if (prevSong) {
                        prevSong.nextId = song.nextId;
                        await db?.songs.put(prevSong);
                    }
                }

                if (song.nextId) {
                    const nextSong = await db?.songs.get(song.nextId);
                    if (nextSong) {
                        nextSong.prevId = song.prevId;
                        await db?.songs.put(nextSong);
                    }
                }

                if (queue.firstSongId === id) queue.firstSongId = song.nextId;
                if (queue.lastSongId === id) queue.lastSongId = song.prevId;
                if (queue.currentSongId === id) queue.currentSongId = song.nextId || song.prevId;
                queue.totalSongs--;

                await db?.globalQueue.put(queue);
                await db?.songs.delete(id);

                update(store => {
                    store.songs.delete(id);
                    store.globalQueue = queue;
                    return store;
                });
            });
        },
        getNextSong: () => {
            const state = get(musicStore);
            if (!state.globalQueue?.currentSongId || state.songs.size === 0) return { song: null };

            const songIds = Array.from(state.songs.keys());
            const currentIndex = songIds.indexOf(state.globalQueue.currentSongId);
            const nextIndex = (currentIndex + 1) % songIds.length;
            const nextSongId = songIds[nextIndex];

            return { song: state.songs.get(nextSongId) || null };
        },

        getPreviousSong: () => {
            const state = get(musicStore);
            if (!state.globalQueue?.currentSongId || state.songs.size === 0) return { song: null };

            const songIds = Array.from(state.songs.keys());
            const currentIndex = songIds.indexOf(state.globalQueue.currentSongId);
            const prevIndex = (currentIndex - 1 + songIds.length) % songIds.length;
            const prevSongId = songIds[prevIndex];

            return { song: state.songs.get(prevSongId) || null };
        },

        setCurrentSong: (songId: string) => {
            update(state => ({
                ...state,
                globalQueue: {
                    ...state.globalQueue,
                    currentSongId: songId,
                }
            }));
        },

        setIsPlaying: (isPlaying: boolean) => {
            update(state => ({ ...state, isPlaying }));
        },

        getCurrentSong: () => {
            const store = get({ subscribe });
            return store.globalQueue?.currentSongId
                ? store.songs.get(store.globalQueue.currentSongId) || null
                : null;
        },
        getAllSongs: () => {
            const store = get({ subscribe });
            return Array.from(store.songs.values());
        },

        searchSongs: (query: string) => {
            const store = get({ subscribe });
            const lowercaseQuery = query.toLowerCase();
            return Array.from(store.songs.values()).filter(song =>
                song.title.toLowerCase().includes(lowercaseQuery) ||
                song.artist.toLowerCase().includes(lowercaseQuery) ||
                song.album.toLowerCase().includes(lowercaseQuery)
            );
        },

        setSearchQuery: (query: string) => update(store => ({ ...store, searchQuery: query })),

        getFilteredSongs: () => get(filteredSongs)

    }
}


type MusicStore = ReturnType<typeof createMusicStore>;

export const musicStore: MusicStore = createMusicStore();
musicStore.initializeStore();

/**
 *  const filteredSongs: Readable<Song[]> = derived({ subscribe },
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
        console.log(newIndex);
        return {
            song: store.songs[newIndex],
            index: newIndex
        };
    }

 *  setSearchQuery: (query: string) => update(store => ({
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
 */