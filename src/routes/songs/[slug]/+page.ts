import { fetchSongById } from '$lib/util.js';

export async function load({ params }) {

    try {
        const id = params.slug;
        const song = await fetchSongById(id);

        if (song) return { props: { song } };

        return { status: 404, error: new Error('Song not found') };
    } catch (error) {
        console.error("Error info: ", error);
        return { status: 500, error: new Error('Failed to load song') };
    }

}
