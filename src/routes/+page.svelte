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
    let files: FileList | null = null;
    //dummy data using placeholder img from placeholder website
    let metadata: Song[] = dummyDataArray;
    let filterMetadata: Song[] = [];
    const dispatch = createEventDispatcher();
    let listShown = false;
    let selectedIndex = -1;

    onMount(() => {
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

    const handleKeyDown = (e: KeyboardEvent, index: number) => {
        if (e.key === "Enter" || e.key === " ") {
            handleSelect(index);
        } else if (e.key === "Escape") {
            listShown = false;
        }
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
        files = {
            length: filesArray.length,
            item: (index: number) => {
                return filesArray[index];
            },
        } as FileList;

        //for each file, get the metadata and then add it to an array

        metadata = (await Promise.all(
            filesArray.map(async (file) => {
                const { common, format } = await mm.parseBlob(file);
                return {
                    id: uuidv4(),
                    coverArt: common.picture?.[0]?.data?.toString("base64"),
                    title: common.title,
                    artist: common.artist,
                    album: common.album,
                    year: common.year,
                    track: common.track.no,
                    duration: format.duration,
                    size: file.size,
                    audioUrl: URL.createObjectURL(file),
                };
            }),
        )) as Song[];

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
        console.log("Song selected", event.detail);
        const selectedSong = event.detail;
        musicStore.set({
            songs: metadata,
            currentSong: selectedSong,
            isPlaying: true,
        });
        console.log("musicStore", musicStore);
    };

    export const fetchSongById = async (id: string) => {
        const index = metadata.findIndex((song) => song.id === id);
        if (index !== -1) {
            return metadata[index];
        }
        return null;
    };

    onMount(() => {
        //set store to the dummy data if the store is empty
        musicStore.update((store) => {
            if (store.songs.length === 0) {
                return {
                    songs: metadata,
                    currentSong: null,
                    isPlaying: false,
                };
            }
            return store;
        });
    });
</script>

<main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Upload Directory</h1>
    <input
        type="file"
        accept="audio/*"
        webkitdirectory
        mozdirectory
        on:change={handleDirectoryUpload}
        multiple
        class="file-input file-input-bordered w-full max-w-xs"
    />

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
        <SongList {files} on:songSelected={handleSongSelected} />
    {/if}
</main>
