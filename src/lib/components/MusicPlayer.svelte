<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import { createBlobUrl, formatTime } from "$lib/util";
    import * as Tone from "tone";
    import placeholder from "$lib/images/placeholder.png";
    import Icon from "@iconify/svelte";

    let player: Tone.Player | null = null;
    let currentTime = 0;
    let duration = 0;
    let isPlaying = false;
    let volume = 1;
    let isLoaded = false;

    onMount(() => {
        initPlayer();
    });

    async function initPlayer() {
        if ($musicStore.currentSong) {
            if (player) {
                player.stop();
                player.dispose();
            }
            player = new Tone.Player({
                url: createBlobUrl($musicStore.currentSong.audioUrl),
                onload: () => {
                    isLoaded = true;
                    duration = player!.buffer.duration;
                    isPlaying = $musicStore.isPlaying;
                    player!.volume.value = volume;
                },
            }).toDestination();

            await Tone.loaded();
            updatePlaybackState();
        }
    }

    function updatePlaybackState() {
        if (!player || !isLoaded) return;

        if (isPlaying) {
            player.start();
            requestAnimationFrame(updateTime);
        } else {
            player.stop();
        }
    }

    function updateTime() {
        if (player && player.state === "started") {
            currentTime = player.now();
            if (currentTime >= duration) {
                isPlaying = false;
                currentTime = 0;
                player.stop();
            } else {
                requestAnimationFrame(updateTime);
            }
        }
    }

    function togglePlay() {
        if (!player || !isLoaded) return;

        isPlaying = !isPlaying;
        updatePlaybackState();
        musicStore.update((store) => ({
            ...store,
            isPlaying,
        }));
    }

    function seek(event: MouseEvent) {
        if (!player || !isLoaded) return;

        const bounds = (
            event.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const percent = (event.clientX - bounds.left) / bounds.width;
        currentTime = percent * duration;
        player.seek(currentTime);
    }

    function adjustVolume(event: Event) {
        volume = Number.parseFloat((event.target as HTMLInputElement).value);
        if (player) player.volume.value = volume;
    }

    musicStore.subscribe(({ currentSong, isPlaying: storeIsPlaying }) => {
        if (currentSong) {
            initPlayer();
            isPlaying = storeIsPlaying;
        }
    });

    onDestroy(() => {
        if (player) {
            player.stop();
            player.dispose();
        }
    });
</script>

<!-- <div class=" bg-base-100 z-50 p-4">
    <div class="bg-base-200 rounded-lg p-4 shadow-lg">
        <div class="flex items-center justify-between">
            {#if $musicStore.currentSong?.coverArt}
                <img
                    src={`data:image/jpg;base64,${$musicStore.currentSong?.coverArt}`}
                    alt="Cover Art"
                    class="h-24 w-24 rounded-lg object-cover"
                    data-tip={$musicStore.currentSong?.title}
                />
            {:else}
                <img
                    src={placeholder}
                    alt="Cover Art"
                    class="h-24 w-24 rounded-lg object-cover"
                />
            {/if}
            <div class="flex flex-col">
                <h3 class="text-lg font-semibold">
                    {$musicStore.currentSong?.title}
                </h3>
                <p class="text-sm opacity-75">
                    {$musicStore.currentSong?.artist}
                </p>
            </div>
        </div>
        <audio
            src={createBlobUrl($musicStore.currentSong?.audioUrl)}
            controls
            class="w-full mt-4 rounded-lg"
        />
    </div>
</div> -->

<div class="fixed bottom-0 left-0 right-0 bg-base-200 shadow-lg p-4 z-50">
    <div class="max-w-screen-xl mx-auto">
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
            <!-- Album art and song info -->
            <div class="flex items-center gap-4 w-full md:w-1/3">
                <img
                    src={$musicStore.currentSong?.coverArt
                        ? `data:image/jpg;base64,${$musicStore.currentSong.coverArt}`
                        : placeholder}
                    alt="Cover Art"
                    class="h-16 w-16 rounded-lg object-cover shadow-md"
                />
                <div class="flex flex-col">
                    <h3 class="text-lg font-semibold truncate">
                        {$musicStore.currentSong?.title || "No song selected"}
                    </h3>
                    <p class="text-sm opacity-75 truncate">
                        {$musicStore.currentSong?.artist || "Unknown artist"}
                    </p>
                </div>
            </div>

            <!-- Playback controls and progress bar -->
            <div class="flex flex-col items-center w-full md:w-1/3">
                <div class="flex items-center gap-4 mb-2">
                    <button
                        class="text-2xl hover:text-primary transition-colors"
                    >
                        <Icon icon="mdi:skip-previous" />
                    </button>
                    <button
                        class="text-4xl hover:text-primary transition-colors"
                        on:click={togglePlay}
                    >
                        <Icon
                            icon={isPlaying
                                ? "mdi:pause-circle"
                                : "mdi:play-circle"}
                        />
                    </button>
                    <button
                        class="text-2xl hover:text-primary transition-colors"
                    >
                        <Icon icon="mdi:skip-next" />
                    </button>
                </div>
                <div class="w-full flex items-center gap-2">
                    <span class="text-xs">{formatTime(currentTime)}</span>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="flex-grow h-2 bg-base-300 rounded-full cursor-pointer"
                        on:click={seek}
                    >
                        <div
                            class="h-full bg-primary rounded-full"
                            style="width: {(currentTime / duration) * 100}%"
                        ></div>
                    </div>
                    <span class="text-xs">{formatTime(duration)}</span>
                </div>
            </div>

            <!-- Volume control -->
            <div class="flex items-center gap-2 w-full md:w-1/3 justify-end">
                <Icon icon="mdi:volume-high" class="text-xl" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    bind:value={volume}
                    on:input={adjustVolume}
                    class="range range-xs range-primary"
                />
            </div>
        </div>
    </div>
</div>
