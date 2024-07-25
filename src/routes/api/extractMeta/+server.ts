import { json, type RequestHandler } from "@sveltejs/kit";
import * as mm from 'music-metadata-browser';

const chunkStore: { [key: string]: Uint8Array[] } = {};

/**
 * Handles the POST request to extract metadata from a file.
 *
 * @param {Request} request - The request object containing the form data.
 * @returns {Promise<Response>} A promise that resolves to the response containing the extracted metadata or an error message.
 */
export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    const formData = await request.formData();
    const chunk = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const chunkIndex = Number.parseInt(formData.get("chunkIndex") as string);
    const totalChunks = Number.parseInt(formData.get("totalChunks") as string);

    if (!chunk || !fileName || Number.isNaN(chunkIndex) || Number.isNaN(totalChunks)) {
        console.error("Invalid request data", { chunk, fileName, chunkIndex, totalChunks });
        return new Response("Invalid request data", { status: 400 });
    }

    console.log(`Processing chunk ${chunkIndex + 1} of ${totalChunks} for file ${fileName}`);

    try {
        const arrayBuffer = await chunk.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        if (!chunkStore[fileName]) {
            chunkStore[fileName] = [];
        }
        chunkStore[fileName][chunkIndex] = uint8Array;

        if (chunkStore[fileName].length === totalChunks) {
            console.log(`All chunks received for ${fileName}, processing file...`);
            const completeFile = new Blob(chunkStore[fileName], { type: chunk.type });
            const fileArrayBuffer = await completeFile.arrayBuffer();

            const { common, format } = await mm.parseBuffer(new Uint8Array(fileArrayBuffer));

            delete chunkStore[fileName];

            return json({
                title: common.title ?? '',
                artist: common.artist ?? '',
                album: common.album ?? '',
                year: common.year ?? 0,
                track: common.track?.no ?? 0,
                duration: format.duration ?? 0,
                coverArt: common.picture?.[0]?.data?.toString('base64') ?? null,
            });
        }
        console.log(`Chunk ${chunkIndex + 1} of ${totalChunks} received for ${fileName}`);
        return json({ status: 'chunk received' });

    } catch (error) {
        console.error('Error processing file:', error);
        return json({ error: 'Failed to process file' }, { status: 500 });
    }
};