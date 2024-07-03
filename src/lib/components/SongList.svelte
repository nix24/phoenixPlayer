<script lang="ts">
    import type { Song } from "$lib/types";
    import { formatBytes, formatTime } from "$lib/util";
    import placeholder from "$lib/images/placeholder.png";
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import { playlistStore } from "$lib/store/PlaylistStore";

    export let songs: Song[];

    const dispatch = createEventDispatcher();

    $: {
        musicStore.filteredSongs.subscribe((value) => {
            songs = value;
        });
    }

    const handleSongClick = (song: Song) => {
        musicStore.update((store) => ({
            ...store,
            currentSong: song,
            isPlaying: true,
        }));
        dispatch("songSelected", song);
    };

    const handleDeleteSong = async (id: string) => {
        await musicStore.deleteSong(id);
    };

    function addToPlaylist(playlistId: string, songId: string) {
        playlistStore.addSongToPlaylist(playlistId, songId);
    }

    function openModal(modalId: string) {
        const modal = document.getElementById(modalId);
        if (modal instanceof HTMLDialogElement) modal.showModal();
    }

    function handleInfoClick(event: Event, songId: string) {
        event.stopPropagation();
        openModal(`info-${songId}`);
    }

    function handlePlaylistClick(event: Event, songId: string) {
        event.stopPropagation();
        openModal(`playlist-${songId}`);
    }

    function handleDeleteClick(event: Event, songId: string) {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this song?")) {
            handleDeleteSong(songId);
        }
    }
</script>

<ul
    class="flex flex-col items-center justify-center space-y-4 p-4 max-w-xl mx-auto lg:mx-0"
>
    {#each songs as song (song.id)}
        <button
            class="grid w-96 bg-opacity-20 backdrop-filter glass bg-primary backdrop-blur-lg rounded-md shadow-md p-4 hover:bg-opacity-30"
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
                    <button
                        class="btn btn-sm btn-circle"
                        on:click|stopPropagation={() =>
                            openModal(`modal-${song.id}`)}
                    >
                        <Icon
                            class="font-bold text-lg"
                            icon="mdi:dots-vertical"
                        />
                    </button>
                    <p class="font-light opacity-75">
                        {formatTime(song?.duration)}
                    </p>
                </div>
            </div>
        </button>

        <dialog id={`modal-${song.id}`} class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{song.title}</h3>
                <div class="flex flex-col gap-4">
                    <button
                        class="btn btn-outline w-full"
                        on:click={(event) => handleInfoClick(event, song.id)}
                    >
                        <Icon icon="mdi:information-outline" class="mr-2" /> Info
                    </button>
                    <button
                        class="btn btn-outline w-full"
                        on:click={(event) =>
                            handlePlaylistClick(event, song.id)}
                    >
                        <Icon icon="mdi:playlist-plus" class="mr-2" /> Add to Playlist
                    </button>
                    <button
                        class="btn btn-outline btn-error w-full"
                        on:click={(event) => handleDeleteClick(event, song.id)}
                    >
                        <Icon icon="mdi:delete" class="mr-2" /> Delete
                    </button>
                </div>
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>

        <dialog id={`info-${song.id}`} class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">{song.title}</h3>
                <div class="flex flex-col gap-2">
                    {#each Object.entries(song) as [key, value]}
                        {#if ["id", "artist", "album", "year", "track"].includes(key)}
                            <div class="flex justify-between items-center">
                                <p class="font-semibold">
                                    {key.charAt(0).toUpperCase() +
                                        key.slice(1)}:
                                </p>
                                <p>{value}</p>
                            </div>
                        {/if}
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
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>

        <dialog id={`playlist-${song.id}`} class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg mb-4">Add to Playlist</h3>
                <div class="flex flex-col gap-2">
                    {#each $playlistStore as playlist}
                        <button
                            class="btn btn-outline w-full"
                            on:click={() => addToPlaylist(playlist.id, song.id)}
                        >
                            {playlist.name}
                        </button>
                    {/each}
                </div>
                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    {/each}
</ul>
