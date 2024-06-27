<script lang="ts">
    import { formatTime } from "$lib/util";
    import Icon from "@iconify/svelte";
    import { onMount, onDestroy } from "svelte";
    import WaveSurfer from "wavesurfer.js";
    import { musicStore } from "$lib/store/MusicStore";
    import placeholder from "$lib/images/placeholder.png";
    import { goto } from "$app/navigation";

    export let audioSrc: string;
    export let imageSrc: string;

    let wavesurfer: WaveSurfer;
    let isPlaying = false;
    let isLoaded = false;
    let currentTime = 0;
    let duration = 0;

    let waveformContainer: HTMLDivElement;

    onMount(async () => {
        wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: "violet",
            progressColor: "purple",
            barWidth: 2,
            barRadius: 3,
            height: 50,
            url: audioSrc,
        });

        wavesurfer.on("ready", () => {
            isLoaded = true;
            duration = wavesurfer.getDuration();
            wavesurfer.setVolume(volume);
        });

        wavesurfer.on("play", () => {
            isPlaying = true;
        });
        wavesurfer.on("pause", () => {
            isPlaying = false;
        });
        wavesurfer.on("timeupdate", (time) => {
            currentTime = time;
        });

        try {
            await wavesurfer.load(audioSrc);
        } catch (error) {
            console.error("Error loading audio:", error);
        }
    });

    function togglePlay() {
        if (!isLoaded) return;

        wavesurfer.playPause();
    }

    function seek(event: MouseEvent) {
        if (!isLoaded) return;

        const rect = waveformContainer.getBoundingClientRect();
        const seekPos = (event.clientX - rect.left) / rect.width;
        wavesurfer.seekTo(seekPos);
    }

    $: if (audioSrc && wavesurfer) {
        isLoaded = false;
        wavesurfer.load(audioSrc);
    }

    onDestroy(() => {
        if (wavesurfer) {
            wavesurfer.destroy();
        }
    });

    const goBack = () => goto("/");
</script>

<!-- 
<div class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-base-100 to-base-300 shadow-lg p-6 z-50">
    <div class="max-w-screen-xl mx-auto">
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
            Waveform and playback controls 
            <div class="flex flex-col items-center w-full md:w-2/3">
                 svelte-ignore a11y-click-events-have-key-events 
                svelte-ignore a11y-no-static-element-interactions 
                <div
                    bind:this={waveformContainer}
                    class="w-full h-16 cursor-pointer"
                    on:click={seek}
                ></div>
                <div class="flex items-center gap-4 mt-2">
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
                    <span class="text-xs"
                        >{formatTime(currentTime)} / {formatTime(
                            duration,
                        )}</span
                    >
                </div>
            </div>

            Volume control -
            <div class="flex items-center gap-2 w-full md:w-1/3 justify-end">
                <Icon icon="mdi:volume-high" class="text-xl" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    bind:value={volume}
                    on:input={setVolume}
                    class="range range-xs range-primary"
                />
            </div>
        </div>
    </div>
</div> -->

<div class="w-full sticky bottom-0 left-0 right-0 bg-base-300 p-6 z-30">
    <div class="max-w-screen-xl mx-auto text-base-content">
        <div class="flex flex-col items-center">
            <!-- Header -->
            <div class="w-full flex justify-between items-center mb-4">
                <a href="/" data-sveltekit-preload-data>
                    <Icon icon="mdi:arrow-left" width="24" height="24" />
                </a>
                <h2 class="text-lg font-semibold">Now Playing</h2>
                <button class="">
                    <Icon icon="mdi:playlist-music" width="24" height="24" />
                </button>
            </div>
            <!-- Album Art -->
            <div class="p-8 sm:px-12 overflow-hidden mb-6">
                <div class="h-auto">
                    {#if imageSrc}
                        <img
                            src={imageSrc}
                            alt={$musicStore.currentSong?.title}
                            class="object-scale-down sm:w-[65%] md:w-[50%] h-full rounded-2xl m-auto"
                            data-tip={$musicStore.currentSong?.title}
                        />
                    {:else}
                        <img
                            src={placeholder}
                            alt="Cover Art"
                            class="object-scale-down sm:w-[65%] md:w-[50%] h-full rounded-2xl m-auto"
                        />
                    {/if}
                </div>
            </div>

            <!-- Song Info -->
            <h3 class=" text-xl font-bold mb-1">
                {$musicStore.currentSong?.title}
            </h3>
            <p class="mb-6">{$musicStore.currentSong?.artist}</p>

            <!-- Waveform -->
            <div
                bind:this={waveformContainer}
                class="w-full h-12 mb-4 cursor-pointer"
                on:click={seek}
            ></div>

            <!-- Time Display -->
            <div class="w-full flex justify-between text-sm mb-4 font-semibold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            <!-- Playback Controls -->
            <div class="flex items-center justify-center gap-8 mb-6">
                <button class="">
                    <Icon icon="mdi:skip-previous" width="36" height="36" />
                </button>
                <button
                    class=" bg-secondary rounded-full p-3"
                    on:click={togglePlay}
                >
                    <Icon
                        icon={isPlaying ? "mdi:pause" : "mdi:play"}
                        width="35"
                        height="35"
                    />
                </button>
                <button class="">
                    <Icon icon="mdi:skip-next" width="36" height="36" />
                </button>
            </div>

            <!-- Additional Controls -->
            <div class="w-full flex justify-between items-center">
                <button class="">
                    <Icon icon="mdi:shuffle" width="24" height="24" />
                </button>
                <button class="">
                    <Icon icon="mdi:repeat" width="24" height="24" />
                </button>
                <button class="">
                    <Icon icon="mdi:share-variant" width="24" height="24" />
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Volume Slider (positioned outside the main container for side placement) -->
