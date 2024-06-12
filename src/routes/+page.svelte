<script lang="ts">
    //home page
    import type { Song } from "$lib/types";
    import * as mm from "music-metadata-browser";
    import { dummyDataArray } from "$lib/dummydata";
    import { createEventDispatcher, onMount } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import SongList from "$lib/components/SongList.svelte";
    import SearchResults from "$lib/components/SearchResults.svelte";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import { v4 as uuidv4 } from "uuid";
    import { db } from "$lib/db";
    import Icon from "@iconify/svelte";
    let files = null as FileList | null;
    //dummy data using placeholder img from placeholder website
    let metadata: Song[] = [];
    let filterMetadata: Song[] = [];
    const dispatch = createEventDispatcher();
    let listShown = false;
    let selectedIndex = -1;
    let songs: Song[] = [];

    onMount(async () => {
        songs = await db.songs.toArray();
        musicStore.update((store) => {
            if (store.songs.length === 0) {
                return {
                    songs: songs,
                    currentSong: null,
                    isPlaying: false,
                };
            }
            return store;
        });
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click is outside of the list
            if (event.target) {
                if (!(event.target as HTMLElement).closest(".absolute")) {
                    listShown = false;
                }
            } else {
                console.log("event.target is null");
            }
        };

        // Listen for click events on the window
        window.addEventListener("click", handleClickOutside);

        // Cleanup the event listener when the component is unmounted
        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    });

    const handleSelect = (index: number) => {
        selectedIndex = index;
        dispatch("songSelected", filterMetadata[index]);
        listShown = false;
    };

    //add the dummy data to the files
    files = {
        length: metadata.length,
        item: (index: number) => metadata[index],
    } as unknown as FileList;

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

        await db.songs.clear();
        await db.songs.bulkPut(metadata);

        musicStore.set({
            songs: metadata,
            currentSong: null,
            isPlaying: false,
        });
    };

    const handleSearch = (e: CustomEvent<string>) => {
        const target = e.detail;
        console.log(`You searched for ${target}`);
        //filter the metadata array based on the search
        //if search is empty, return the original array
        listShown = target !== "";

        filterMetadata = metadata.filter((song) => {
            const titleMatch =
                song.title?.toLowerCase().includes(target.toLowerCase()) ||
                false;
            const artistMatch =
                song.artist?.toLowerCase().includes(target.toLowerCase()) ||
                false;
            const albumMatch =
                song.album?.toLowerCase().includes(target.toLowerCase()) ||
                false;

            return titleMatch || artistMatch || albumMatch;
        });
    };

    const handleSongSelected = (event: CustomEvent<Song>) => {
        const selectedSong = event.detail;
        selectedIndex = metadata.findIndex(
            (song) => song.id === selectedSong.id,
        );

        dispatch("songSelected", selectedSong);
    };
</script>

<main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Songs</h1>

    <div class="relative inline-flex items-center">
        <Icon icon="mdi:upload" class="text-2xl cursor-pointer" />
        <input
            type="file"
            accept="audio/*"
            webkitdirectory
            mozdirectory
            on:change={handleDirectoryUpload}
            multiple
            class="file-input file-input-bordered absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>

    <div class="relative m-4" role="region" aria-live="polite">
        <div class="max-w-xs mx-auto">
            <SearchBar on:search={handleSearch} />
        </div>
        <SearchResults
            {listShown}
            {filterMetadata}
            {selectedIndex}
            on:songSelected
        />
    </div>

    <div class="divider" />

    {#if files}
        <SongList {songs} {files} on:songSelected={handleSongSelected} />
    {:else}
        <p>no files. try uploading from a directory!</p>
    {/if}
</main>
