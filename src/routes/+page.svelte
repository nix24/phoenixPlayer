<script lang="ts">
    //home page
    import type { Song } from "$lib/types";
    import * as mm from "music-metadata-browser";
    import { onMount } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import SongList from "$lib/components/SongList.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { db } from "$lib/db";
    import Icon from "@iconify/svelte";
    //dummy data using placeholder img from placeholder website

    let filteredSongs: Song[] = [];

    musicStore.filteredSongs.subscribe((value) => {
        filteredSongs = value;
    });
    console.log("filteredSongs", filteredSongs);

    onMount(async () => {
        await musicStore.loadSongs();
    });

    async function handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        if (files) {
            const audioFiles = Array.from(files).filter(
                (file) => file.type === "audio/mpeg",
            );
            processFiles(audioFiles);
        }
    }

    async function processFiles(files: File[]) {
        const newSongs = files.map(async (file) => {
            try {
                const { common, format } = await mm.parseBlob(file);
                const buffer = await file.arrayBuffer();

                //check for exisitng files
                console.log("common", common.title);
                const exisitngFile = await db?.songs
                    .where("title")
                    .equals(String(common.title))
                    .and((song) => song.artist === common.artist)
                    .first();

                if (exisitngFile) {
                    console.log(
                        `File ${file.name} already exists in the database`,
                    );
                    return null;
                }

                return {
                    id: uuidv4(),
                    coverArt: common.picture?.[0]?.data?.toString("base64"),
                    title: common.title || "",
                    artist: common.artist || "",
                    album: common.album || "",
                    year: common.year || "",
                    track: common.track?.no || "",
                    duration: format.duration || 0,
                    size: file.size || 0,
                    audioUrl: buffer,
                };
            } catch (error) {
                console.error(`Failed to parse file ${file.name}:`, error);
                return null;
            }
        });

        const validSongs = (await Promise.all(newSongs)).filter(
            (song): song is Song => song !== null,
        );
        if (validSongs.length > 0) await musicStore.addSongs(validSongs);
    }

    const handleSongSelected = (event: CustomEvent<Song>) => {
        musicStore.update((store) => ({
            ...store,
            currentSong: event.detail,
            isPlaying: true,
        }));
    };
</script>

<!-- <pre>{JSON.stringify(filteredSongs, null, 2)}</pre> -->
<main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Songs</h1>
    <div class="relative m-4" role="region" aria-live="polite">
        <div class="max-w-xs mx-auto">
            <SearchBar />
        </div>
    </div>

    <div class="divider" />

    {#if filteredSongs.length > 0}
        <SongList songs={filteredSongs} on:songSelected={handleSongSelected} />
    {:else}
        <p>no files. try uploading from a directory!</p>
    {/if}

    <div class="fixed bottom-4 right-4 flex flex-col space-y-2">
        <div
            class="relative inline-flex items-center btn btn-primary tooltip tooltip-left"
            data-tip="Upload from Directory"
        >
            <Icon icon="mdi:folder-upload" class="text-2xl cursor-pointer" />
            <input
                type="file"
                accept="audio/*"
                {...{ webkitdirectory: true }}
                {...{ mozdirectory: true }}
                on:change={handleFileUpload}
                multiple
                class="file-input file-input-bordered absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
        <div
            class="relative inline-flex items-center btn btn-secondary tooltip tooltip-left"
            data-tip="Upload individual Files"
        >
            <Icon icon="mdi:file-upload" class="text-2xl cursor-pointer" />
            <input
                type="file"
                accept="audio/*"
                on:change={handleFileUpload}
                class="file-input file-input-bordered absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    </div>
</main>
