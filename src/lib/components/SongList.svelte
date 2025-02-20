<script lang="ts">
    import type { Song } from "$lib/types";
    import { format_bytes, format_time } from "$lib/wasmPkg";
    import placeholder from "$lib/images/placeholder.png";
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import { playlistStore } from "$lib/store/PlaylistStore";
    import { page } from "$app/stores";
    import audioBufferToWav from "audiobuffer-to-wav";
    // biome-ignore lint/style/useConst: <explanation>
    export let isPlaylistView = false;
    $: songs = $musicStore ? musicStore.getFilteredSongs() : [];

    const dispatch = createEventDispatcher();
    const playlistId = $page.params.slug;
    // $: {
    //     musicStore.filteredSongs.subscribe((value) => {
    //         songs = value;
    //     });
    // }

    const handleSongClick = (song: Song) => {
        musicStore.setCurrentSong(song.id as string);
        musicStore.setIsPlaying(true);
        dispatch("songSelected", song);
    };

    const handleDeleteSong = async (id: string) => {
        await musicStore.removeSong(id);
    };

    function addToPlaylist(playlistId: string, songId: string) {
        playlistStore.addSongToPlaylist(playlistId, songId);
    }
    function handleRemoveFromPlaylist(event: Event, songId: string) {
        event.stopPropagation();
        if (playlistId) {
            playlistStore.removeSongFromPlaylist(playlistId, songId);
            // songs = songs.filter((song) => song.id !== songId);
        }
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

    //handling exporting songs: mp3 | wav
    async function handleExport(song: Song, format: "mp3" | "wav") {
        try {
            let blob: Blob;
            if (format === "mp3") {
                // Assuming the song.audioUrl is already an ArrayBuffer
                blob = new Blob([song.audioUrl], { type: "audio/mp3" });
            } else {
                // Convert to WAV
                const audioCtx = new AudioContext();

                const arrBuffer = song.audioUrl;
                const audioBuffer = await audioCtx.decodeAudioData(arrBuffer);

                // conversion to wav
                const wavArrBuffer = audioBufferToWav(audioBuffer);
                blob = new Blob([wavArrBuffer], { type: "audio/wav" });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${song.title}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export the song. Please try again.");
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
                        {format_time(song?.duration)}
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
                        on:click={(event) =>
                            handleInfoClick(event, song.id || "")}
                    >
                        <Icon icon="mdi:information-outline" class="mr-2" /> Info
                    </button>
                    {#if !isPlaylistView}
                        <button
                            class="btn btn-outline w-full"
                            on:click={(event) =>
                                handlePlaylistClick(event, song.id || "")}
                        >
                            <Icon icon="mdi:playlist-plus" class="mr-2" /> Add to
                            Playlist
                        </button>
                    {:else}
                        <button
                            class="btn btn-outline btn-error w-full"
                            on:click={(event) =>
                                handleRemoveFromPlaylist(event, song.id || "")}
                        >
                            <Icon icon="mdi:playlist-remove" class="mr-2" /> Remove
                            from Playlist
                        </button>
                    {/if}
                    <button
                        class="btn btn-outline w-full"
                        on:click|stopPropagation={() =>
                            handleExport(song, "mp3")}
                    >
                        <Icon icon="mdi:download" class="mr-2" /> Export MP3
                    </button>
                    <button
                        class="btn btn-outline w-full"
                        on:click|stopPropagation={() =>
                            handleExport(song, "wav")}
                    >
                        <Icon icon="mdi:download" class="mr-2" /> Export WAV
                    </button>
                    <button
                        class="btn btn-outline btn-error w-full"
                        on:click={(event) =>
                            handleDeleteClick(event, song.id || "")}
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
                        <p>{format_time(song?.duration)}</p>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="font-semibold">Size:</p>
                        <p>{format_bytes(song?.size, 2)}</p>
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
                <h3 class="font-bold text-lg mb-4 text-error">
                    Add to Playlist (currently not functional)
                </h3>
                <div class="flex flex-col gap-2">
                    {#each $playlistStore as playlist}
                        <button
                            class="btn btn-outline w-full"
                            on:click={() =>
                                addToPlaylist(playlist.id, song.id || "")}
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
