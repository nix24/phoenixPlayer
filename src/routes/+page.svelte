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

    let isVisible = false;
    let isMobile = false;

    function toggleVisibility() {
        isVisible = !isVisible;
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target as Element;
        if (isVisible && !target.closest(".upload-buttons")) {
            isVisible = false;
        }
    }

    onMount(() => {
        isMobile = window.innerWidth <= 768; // Adjust this breakpoint as needed
        window.addEventListener("resize", () => {
            isMobile = window.innerWidth <= 768;
        });
    });
    // -----------------------------------
    let filteredSongs: Song[] = [];

    musicStore.filteredSongs.subscribe((value) => {
        filteredSongs = value;
    });

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
        const chunkSize = 3 * 1024 * 1024; // 3MB chunks

        const uploadChunk = async (file: File, start: number) => {
            const chunk = file.slice(start, start + chunkSize);
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("fileName", file.name);
            formData.append(
                "chunkIndex",
                Math.floor(start / chunkSize).toString(),
            );
            formData.append(
                "totalChunks",
                Math.ceil(file.size / chunkSize).toString(),
            );

            const response = await fetch("/api/extractMeta", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload chunk");
            }

            const result = await response.json();

            if (start + chunkSize < file.size) {
                return uploadChunk(file, start + chunkSize);
            }

            return result;
        };

        const newSongs = await Promise.all(
            files.map(async (file) => {
                try {
                    const metadata = await uploadChunk(file, 0);

                    // Check for existing song
                    const existingSong = await db?.songs
                        .where("title")
                        .equals(metadata.title || "")
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
<svelte:window on:click={handleClickOutside} />

<main class="p-4">
    <p class="text-center">
        Disclaimer: This app is still in early stages of development. Feel free
        to check out the code on <a
            class="text-info font-semibold hover:text-primary transition"
            href="https://github.com/nix24/phoenixPlayer">github!</a
        >
    </p>
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

    <div class="fixed bottom-4 right-4 flex flex-col space-y-2 upload-buttons">
        {#if !isMobile || isVisible}
            <div
                class="relative inline-flex items-center btn btn-primary tooltip tooltip-left transform transition-transform duration-300 ease-in-out {isVisible
                    ? 'translate-y-0'
                    : 'translate-y-16'}"
                data-tip="Upload from Directory"
                class:hidden={isMobile && !isVisible}
            >
                <Icon
                    icon="mdi:folder-upload"
                    class="text-2xl cursor-pointer"
                />
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
                class="relative inline-flex items-center btn btn-secondary tooltip tooltip-left transform transition-transform duration-300 ease-in-out {isVisible
                    ? 'translate-y-0'
                    : 'translate-y-16'}"
                data-tip="Upload individual Files"
                class:hidden={isMobile && !isVisible}
            >
                <Icon icon="mdi:file-upload" class="text-2xl cursor-pointer" />
                <input
                    type="file"
                    accept="audio/*"
                    on:change={handleFileUpload}
                    class="file-input file-input-bordered absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        {/if}
        {#if isMobile}
            <button class="btn btn-circle btn-md" on:click={toggleVisibility}>
                <Icon icon="mdi:arrow-up" class="text-2xl font-bold" />
            </button>
        {/if}
    </div>
</main>

<style>
    .upload-buttons {
        z-index: 50;
    }
</style>
