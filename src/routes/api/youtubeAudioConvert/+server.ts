import type { RequestHandler } from "@sveltejs/kit";
import ytdl from "@distube/ytdl-core";

export const POST: RequestHandler = async ({ request }) => {
    console.log("Starting Youtube to MP3 conversion...");
    const { url } = await request.json();
    console.log("URL received:", url);

    if (!ytdl.validateURL(url)) {
        console.log("Invalid URL detected");
        return new Response("Invalid URL", { status: 400 });
    }

    try {
        console.log("Fetching video info...");
        const info = await ytdl.getInfo(url);

        console.log("Choosing audio format...");
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: "highestaudio", filter: "audioonly" });

        console.log("Downloading audio...");
        //creating buffer
        // const buffer = await new Promise<Buffer>((resolve, reject) => {
        //     const chunks: Buffer[] = [];
        //     ytdl(url, { format: audioFormat })
        //         .on("data", (chunk) => {
        //             console.log("Received audio chunk");
        //             chunks.push(chunk);
        //         })
        //         .on("end", () => {
        //             console.log("Audio download complete");
        //             resolve(Buffer.concat(chunks));
        //         })
        //         .on("data", (chunk) => chunks.push(chunk))
        //         .on("end", () => resolve(Buffer.concat(chunks)))
        //         .on("error", reject);
        // });

        const audioStream = ytdl(url, { format: audioFormat });
        const chunks: Uint8Array[] = [];
        for await (const chunk of audioStream) {
            chunks.push(new Uint8Array(chunk));
        }

        const audioBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            audioBuffer.set(chunk, offset);
            offset += chunk.length;
        }
        // Extract metadata
        // const metadata = await parseBuffer(buffer);

        console.log("Fetching thumbnail...");
        //grabbing usuable thumbnail data using buffer
        const response = await fetch(info.videoDetails.thumbnails[0].url);
        const coverArtRes = await response.arrayBuffer();
        const coverArtBuffer = Buffer.from(coverArtRes).toString("base64");
        const base64 = `data:image/jpeg;base64,${coverArtBuffer}`

        return new Response(JSON.stringify({
            coverArt: base64,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            album: "",
            year: new Date(info.videoDetails.uploadDate).getFullYear(),
            duration: Number.parseInt(info.videoDetails.lengthSeconds),
            audioBuffer: Buffer.from(audioBuffer).toString("base64"),
            mimeType: audioFormat.mimeType
        }), { status: 200 });
    } catch (error) {
        console.log("Error occurred during conversion:", error);
        return new Response(JSON.stringify({ error: `Failed to convert: ${error}` }), { status: 500 });
    }
}
