<script lang="ts">
    //song list component
    import type { Song } from "$lib/types";
    import { deleteSong, formatBytes, formatTime } from "$lib/util";
    import placeholder from "$lib/images/placeholder.png";
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";

    export let songs: Song[];
    $: {
        console.log("songs recieved: ", songs);
    }
    const dispatch = createEventDispatcher();

    const handleSongClick = (song: Song) => {
        musicStore.update((store) => ({
            ...store,
            currentSong: song,
            isPlaying: true,
        }));
        dispatch("songSelected", song);
    };

    const openModal = (index: number, event: Event) => {
        event.stopPropagation();

        const modal = document.getElementById(`songInfo${index}`);
        if (modal instanceof HTMLDialogElement) modal.showModal();
    };

    const handleDeleteSong = async (id: string, event: Event) => {
        event.stopPropagation();
        await deleteSong(id);
        songs = songs.filter((song) => song.id !== id);
    };
</script>

<ul
    class="text-center items-center justify-center space-y-4 p-4 max-w-xl mx-auto lg:mx-0"
>
    {#each songs as song, index (song.id)}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
            class="grid border border-primary bg-opacity-20 backdrop-filter glass bg-primary backdrop-blur-lg rounded-md shadow-md p-4 hover:bg-opacity-30"
            on:click={() => handleSongClick(song)}
            on:keydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleSongClick(song);
                }
            }}
        >
            <div class="flex items-center space-x-4">
                {#if song?.coverArt}
                    <img
                        src={`data:image/jpg;base64,${song?.coverArt}`}
                        alt="Cover Art"
                        class="max-w-16 h-auto rounded-md"
                        data-tip={song?.title}
                    />
                {:else}
                    <img
                        src={placeholder}
                        alt="Cover Art"
                        class="max-w-16 h-auto rounded-md"
                    />
                {/if}
                <a
                    href={`/songs/${song?.id}`}
                    class="flex-grow text-base-content tooltip hover:text-accent transition"
                    data-tip={song?.title}
                    data-sveltekit-preload-data
                >
                    <h3 class="text-lg font-semibold">
                        {song?.title.length > 20
                            ? `${song?.title.slice(0, 20)}...`
                            : song?.title || "No Title Provided"}
                    </h3>
                    <p class="text-sm opacity-75">
                        {song?.artist}
                    </p>
                </a>
                <div
                    class="flex flex-col items-center space-y-2 text-base-content text-sm"
                >
                    <div class="flex space-x-2">
                        <button
                            type="button"
                            class="btn btn-xs btn-circle"
                            on:click={(event) => openModal(index, event)}
                        >
                            <Icon
                                class="text-2xl"
                                icon="mdi:information-outline"
                            />
                        </button>
                        <button
                            class="btn btn-xs btn-error btn-circle"
                            on:click={(event) =>
                                handleDeleteSong(song?.id, event)}
                        >
                            <Icon icon="streamline:delete-1-solid" />
                        </button>
                    </div>
                    <p class="font-light opacity-75">
                        {formatTime(song?.duration)}
                    </p>

                    <dialog
                        id={`songInfo${index}`}
                        class="modal bg-base-100 rounded-lg text-base-content"
                    >
                        <div class="modal-box w-full max-w-xs">
                            <h3 class="font-bold text-lg mb-4">
                                {song?.title}
                            </h3>
                            <hr class="divide-y-2 py-1" />
                            <div class="flex flex-col gap-2">
                                {#each ["id", "artist", "album", "year", "track"] as field}
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <p class="font-semibold">
                                            {field.charAt(0).toUpperCase() +
                                                field.slice(1)}:
                                        </p>
                                        <p>{song[field]}</p>
                                    </div>
                                {/each}
                                <div class="flex justify-between items-center">
                                    <p class="font-semibold">Duration:</p>
                                    <p>{formatTime(song?.duration)}</p>
                                </div>
                                <div class="flex justify-between items-center">
                                    <p class="font-semibold">Size:</p>
                                    <p>{formatBytes(song?.size)}</p>
                                </div>
                            </div>
                            <div class="modal-action mt-4">
                                <form method="dialog">
                                    <button class="btn btn-primary"
                                        >Close</button
                                    >
                                </form>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </li>
    {/each}
</ul>

<style>
</style>
