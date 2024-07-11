<script lang="ts">
    //home page
    import type { Song } from "$lib/types";
    import { onMount } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import SongList from "$lib/components/SongList.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { db } from "$lib/db";
    import Icon from "@iconify/svelte";
    import { playlistStore } from "$lib/store/PlaylistStore";
    import Playlist from "$lib/components/Playlist.svelte";
    //dummy data using placeholder img from placeholder website

    let filteredSongs: Song[] = [];

    musicStore.filteredSongs.subscribe((value) => {
        filteredSongs = value;
    });
    console.log("filteredSongs", filteredSongs);

    onMount(async () => {
        await musicStore.loadSongs();
        await playlistStore.loadPlaylists();
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
        const newSongs = await Promise.all(
            files.map(async (file) => {
                try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/extractMeta", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Failed to extract metadata");
                    }

                    const metadata = await response.json();

                    // Check for existing song
                    const existingSong = await db?.songs
                        .where("title")
                        .equalsIgnoreCase(metadata.title)
                        .and(
                            (song) =>
                                song.artist.toLowerCase() ===
                                metadata.artist.toLowerCase(),
                        )
                        .first();

                    if (existingSong) return null;

                    return {
                        id: uuidv4(),
                        ...metadata,
                        size: file.size,
                        audioUrl: await file.arrayBuffer(),
                    };
                } catch (error) {
                    console.error("Failed to process file", error);
                    return null;
                }
            }),
        );

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

    <div class="lg:flex lg:space-x-4">
        <div class="relative m-4" role="region" aria-live="polite">
            <div class="max-w-xs mx-auto">
                <SearchBar />
            </div>
        </div>

        <div class="divider" />

        <div class="lg:w-1/3 mt-4 lg:mt-0">
            <Playlist playlists={$playlistStore} />
        </div>

        <div class="divider" />

        {#if filteredSongs.length > 0}
            <SongList
                songs={filteredSongs}
                on:songSelected={handleSongSelected}
            />
        {:else}
            <p>no files. try uploading from a directory!</p>
        {/if}
    </div>

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
