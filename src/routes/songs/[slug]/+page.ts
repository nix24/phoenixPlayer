import { musicStore } from '$lib/store/MusicStore.js';
import { get } from 'svelte/store';

export async function load({ params }) {
    console.log("params", params);
    console.log("start fetching");
    const id = params.slug;
    console.log("id", id);
    const store = get(musicStore);
    const song = store.songs.find((song) => song.id === id);
    console.log("grabbed song:", song);
    if (song) {
        return { props: { song } };
    }
    return { status: 404, error: new Error("Song not found") };
}