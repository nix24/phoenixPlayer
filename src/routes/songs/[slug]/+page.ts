import { fetchSongById } from '$lib/util.js';

export async function load({ params }) {

    console.log("params", params);
    console.log("start fetching");

    if (typeof window !== 'undefined') {
        const id = params.slug;
        const song = await fetchSongById(id);
        if (song) return { props: { song } };
    }


    return { status: 404, error: new Error("Song not found") };
}