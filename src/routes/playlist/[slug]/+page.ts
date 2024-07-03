import { playlistStore } from "$lib/store/PlaylistStore";
import { get } from "svelte/store";
import type { PageLoad } from "./$types";
import { musicStore } from "$lib/store/MusicStore";

export const load: PageLoad = async ({ params }) => {
    try {
        const playlistId = params.slug;
        const playlists = get(playlistStore);
        const playlist = playlists.find(p => p.id === playlistId);

        console.log(playlist?.name);
        console.log(playlist?.songs);
        if (!playlist) {
            return {
                status: 404,
                error: new Error('Playlist not found')
            };
        }

        //find the songs in the store that match the song ids in the playlist

        const allSongs = get(musicStore).songs;
        const playlistSongs = playlist.songs
            .map(songId => allSongs.find(s => s.id === songId))
            .filter((song): song is NonNullable<typeof song> => song !== undefined);

        console.log('Playlist songs in +page.ts:', playlistSongs);
        return {
            playlist,
            playlistSongs
        };
    } catch (error) {
        console.error("Error loading playlist:", error);
        return {
            status: 500,
            error: new Error('Failed to load playlist')
        };
    }
};