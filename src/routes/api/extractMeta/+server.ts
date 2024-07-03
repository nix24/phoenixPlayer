import { db } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";
import * as mm from 'music-metadata';


export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return new Response("No file found", { status: 400 });

    try {
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const { common, format } = await mm.parseBuffer(uint8Array, file.type);

        return json({
            title: common.title || '',
            artist: common.artist || '',
            album: common.album || '',
            year: common.year || 0,
            track: common.track?.no || 0,
            duration: format.duration || 0,
            coverArt: common.picture?.[0]?.data?.toString('base64') || null,
        });
    } catch (error) {
        console.error('Error parsing metadata:', error);
        return json({ error: 'Failed to parse metadata' }, { status: 500 });
    }
}