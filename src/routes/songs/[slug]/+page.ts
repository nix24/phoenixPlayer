import { error } from '@sveltejs/kit';
import { musicStore } from '$lib/store/MusicStore';
import { get } from 'svelte/store';

export async function load({ params }) {
    try {
        const id = params.slug;

        // Ensure the MusicStore is initialized
        if (get(musicStore).songs.size === 0) {
            await musicStore.initializeStore();
        }

        const song = get(musicStore).songs.get(id);

        if (!song) {
            throw error(404, 'Song not found');
        }

        return { props: { song } };
    } catch (err) {
        console.error("Error loading song:", err);
        throw error(500, 'Failed to load song');
    }
}