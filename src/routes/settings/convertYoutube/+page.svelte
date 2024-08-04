<script lang="ts">
    import { musicStore } from "$lib/store/MusicStore";
    import type { Song } from "$lib/types";
    import {
        base64_to_array_buffer,
        format_time,
    } from "$lib/wasmPkg/wasm_utils";
    import { v4 as uuidv4 } from "uuid";
    import { fade, scale } from "svelte/transition";
    import { get } from "svelte/store";

    type YoutubeConvertData = {
        coverArt: string;
        title: string;
        author: string;
        album: string;
        year: string;
        duration: number;
        audioBuffer: string;
        mimeType: string;
    };

    let youtubeUrl = "";
    let results: YoutubeConvertData | null = null;
    let isLoading = false;
    let downloadProgress = 0;
    let addToLibraryDisabled = false;
    let downloadDisabled = false;

    $: isValidUrl =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(
            youtubeUrl,
        );

    async function handleConvert() {
        if (!isValidUrl) return;

        isLoading = true;
        results = null;
        addToLibraryDisabled = false;
        downloadDisabled = false;

        try {
            const response = await fetch("/api/youtubeAudioConvert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: youtubeUrl }),
            });

            if (!response.ok) throw new Error("Conversion failed");

            results = await response.json();
        } catch (error) {
            console.error("Conversion failed: ", error);
            alert("Failed to convert video. Please try again.");
        } finally {
            isLoading = false;
        }
    }

    async function downloadAudio() {
        if (!results) return;

        downloadDisabled = true;

        try {
            const audioData = Uint8Array.from(atob(results.audioBuffer), (c) =>
                c.charCodeAt(0),
            );
            const blob = new Blob([audioData], { type: results.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${results.title}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed: ", error);
            alert("Failed to download audio. Please try again.");
            downloadDisabled = false;
        }
    }

    async function addToLibrary() {
        if (!results) return;

        addToLibraryDisabled = true;

        try {
            const currentState = get(musicStore);
            const lastSongId = currentState.globalQueue?.lastSongId;
            //slicing off the data:image/png;base64 since it will will be duplicated when added to database
            const newSong: Song = {
                id: uuidv4(),
                coverArt: results.coverArt.slice(23),
                title: results.title,
                artist: results.author,
                album: results.album,
                year: Number(results.year) || 0,
                track: 1,
                duration: results.duration,
                size: Math.ceil(results.audioBuffer.length * (3 / 4)),
                audioUrl: base64_to_array_buffer(results.audioBuffer),
                prevId: lastSongId as string,
                nextId: null,
            };

            await musicStore.addSong(newSong);
            alert("Song added to library successfully!");
        } catch (error) {
            console.error("Failed to add to library: ", error);
            alert("Failed to add song to library. Please try again.");
            addToLibraryDisabled = false;
        }
    }
</script>

<div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div
        class="max-w-3xl mx-auto bg-base-100 rounded-lg shadow-xl overflow-hidden"
    >
        <div class="px-4 py-5 sm:p-6 bg-base-300 border-b border-primary">
            <h1
                class="text-3xl font-extrabold text-base-content mb-6 text-center"
            >
                YouTube to MP3 Converter
            </h1>

            <form on:submit|preventDefault={handleConvert} class="space-y-4">
                <div>
                    <label
                        for="youtube-url"
                        class="block text-sm font-medium text-base-content"
                        >YouTube URL</label
                    >
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="url"
                            id="youtube-url"
                            bind:value={youtubeUrl}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                            class="input focus:ring-primary focus:border-primary block w-full pl-3 pr-12 sm:text-sm border-secondary rounded-md"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium btn btn-primary"
                    disabled={!isValidUrl || isLoading}
                >
                    {isLoading ? "Converting..." : "Convert"}
                </button>
            </form>

            {#if results}
                <div class="mt-8 bg-base-100 p-4 rounded-md" transition:scale>
                    <h2 class="text-xl font-semibold mb-2">
                        {results.title}
                    </h2>
                    <p>Artist: {results.author}</p>
                    <p class=" mb-4">
                        Duration: {format_time(results.duration)}
                    </p>
                    <img
                        src={results.coverArt}
                        alt="Cover Art"
                        class="w-32 h-32 object-cover rounded-md shadow-md mb-4"
                    />

                    <div class="flex space-x-4">
                        <button
                            on:click={downloadAudio}
                            disabled={downloadDisabled}
                            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Download MP3
                        </button>
                        <button
                            on:click={addToLibrary}
                            disabled={addToLibraryDisabled}
                            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save to Library
                        </button>
                    </div>

                    {#if downloadProgress > 0}
                        <div class="mt-4 relative pt-1">
                            <div
                                class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200"
                            >
                                <div
                                    style="width:{downloadProgress}%"
                                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                ></div>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

{#if isLoading}
    <div
        class="fixed inset-0 bg-base-300 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center"
        transition:fade
    >
        <div class="p-8 rounded-md bg-base-100 shadow-xl">
            <div
                class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"
            ></div>
            <p class="mt-4 text-center">Converting video...</p>
        </div>
    </div>
{/if}
