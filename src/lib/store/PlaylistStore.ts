import { db } from "$lib/db";
import type { PlayList } from "$lib/types";
import { writable } from "svelte/store";


function createPlaylistStore() {
    const { subscribe, update, set } = writable<PlayList[]>([]);

    return {
        subscribe,
        set,
        addPlaylist: async (playlist: PlayList) => {
            await db?.playlists.add(playlist);
            update((playlists) => [...playlists, playlist]);
        },
        deletePlaylist: async (id: string) => {
            await db?.playlists.delete(id);
            update((playlists) => playlists.filter((playlist) => playlist.id !== id));
        },
        addSongToPlaylist: async (playlistId: string, songId: string) => {
            await db?.playlists.where("id").equals(playlistId).modify(playlist => {
                playlist.songs = [...playlist.songs, songId];
            });

            // Then, update the store
            update(playlists => playlists.map(p =>
                p.id === playlistId ? { ...p, songs: [...p.songs, songId] } : p
            ));
        },
        removeSongFromPlaylist: async (playlistId: string, songId: string) => {
            await db?.playlists.where('id').equals(playlistId).modify(playlist => {
                playlist.songs = playlist.songs.filter(id => id !== songId);
            });

            // Then, update the store
            update(playlists => playlists.map(p =>
                p.id === playlistId ? { ...p, songs: p.songs.filter(id => id !== songId) } : p
            ));
        },
        loadPlaylists: async () => {
            const dbPlaylists = await db?.playlists.toArray();
            set(dbPlaylists || []);
        }
    };

};

export const playlistStore = createPlaylistStore();