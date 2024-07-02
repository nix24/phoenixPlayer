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

    let songs: Song[] = [];
    let filteredSongs: Song[] = [];

    musicStore.subscribe((store) => {
        songs = store.songs;
        filteredSongs = store.filteredSongs;
    });

    onMount(async () => {
        const dbSongs = await db?.songs.toArray();
        musicStore.update((store) => ({
            ...store,
            songs: dbSongs as Song[],
            filteredSongs: dbSongs as Song[],
        }));
    });

    const handleDirectoryUpload = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const filesArray = Array.from(target.files || []).filter(
            (file) => file.type === "audio/mpeg",
        );

        const metadataPromises = filesArray.map(async (file) => {
            try {
                const { common, format } = await mm.parseBlob(file);
                const buffer = await file.arrayBuffer();

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

        const metadata = (await Promise.all(metadataPromises)).filter(Boolean);

        await db?.songs.clear();
        await db?.songs.bulkPut(metadata as Song[]);

        musicStore.set({
            songs: metadata as Song[],
            filteredSongs: metadata as Song[],
            currentSong: null,
            isPlaying: false,
        });
    };

    const handleSongSelected = (event: CustomEvent<Song>) => {
        const selectedSong = event.detail;
        musicStore.update((store) => ({
            ...store,
            currentSong: selectedSong,
            isPlaying: true,
        }));
    };
</script>

<main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Songs</h1>

    <div class="relative inline-flex items-center">
        <Icon icon="mdi:upload" class="text-2xl cursor-pointer" />
        <input
            type="file"
            accept="audio/*"
            {...{ webkitdirectory: true }}
            {...{ mozdirectory: true }}
            on:change={handleDirectoryUpload}
            multiple
            class="file-input file-input-bordered absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>

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
</main>
