<script lang="ts">
    import { format_time } from "../../../wasm_utils/pkg";
    import Icon from "@iconify/svelte";
    import { onMount, onDestroy } from "svelte";
    import WaveSurfer from "wavesurfer.js";
    import { musicStore } from "$lib/store/MusicStore";
    import SlideText from "./SlideText.svelte";
    import placeholder from "$lib/images/placeholder.png";
    import AudioMotionAnalyzer from "audiomotion-analyzer";

    export let audioSrc: string;
    export let imageSrc: string;

    let wavesurfer: WaveSurfer;
    let audioMotion: AudioMotionAnalyzer;
    let audioCtx: AudioContext;
    let audioElement: HTMLAudioElement;
    let mediaElementSource: MediaElementAudioSourceNode | null = null;

    let isPlaying = false;
    let isLoaded = false;
    $: titleContainerW = 0;

    let currentTime = 0;
    let duration = 0;

    let waveformContainer: HTMLDivElement;
    let visualizerContainer: HTMLDivElement;

    onMount(async () => {
        audioCtx = new window.AudioContext();
        audioElement = new Audio(audioSrc);

        wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: "violet",
            progressColor: "purple",
            barWidth: 5,
            barRadius: 3,
            height: 40,
            backend: "MediaElement",
            media: audioElement,
        });

        wavesurfer.on("ready", () => {
            isLoaded = true;
            duration = wavesurfer.getDuration();
            if (audioMotion) audioMotion.destroy();
            setupAudioMotion();
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

    function setupAudioMotion() {
        if (!mediaElementSource) {
            mediaElementSource =
                audioCtx.createMediaElementSource(audioElement);
        }
        const gainNode = audioCtx.createGain();

        mediaElementSource.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        audioMotion = new AudioMotionAnalyzer(visualizerContainer, {
            audioCtx: audioCtx,
            source: gainNode,
            height: 200,
            width: 1000,
            useCanvas: true,
            mode: 2, // You can adjust this mode as needed
            smoothing: 0.5,
            gradient: "rainbow",
            showBgColor: true,
            showScaleX: false,
            showScaleY: true,
            showPeaks: true,
            ledBars: true,
            connectSpeakers: false,
            maxFPS: 60,
            overlay: true,
            bgAlpha: 0,
        });

        wavesurfer.setVolume(0.5);
    }

    function togglePlay() {
        if (!isLoaded) return;
        wavesurfer.playPause();
    }

    $: if (audioSrc && wavesurfer) {
        // Reload the audio if the source changes
        isLoaded = false;
        wavesurfer.load(audioSrc);
    }

    onDestroy(() => {
        if (wavesurfer) wavesurfer.destroy();
        if (audioMotion) audioMotion.destroy();
        if (audioCtx) audioCtx.close();
        if (mediaElementSource) {
            mediaElementSource.disconnect();
            mediaElementSource = null;
        }
    });
</script>

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
            <h3
                class="text-4xl font-bold mb-1 text-center overflow-hidden"
                bind:clientWidth={titleContainerW}
            >
                {#if titleContainerW >= 85}
                    <SlideText
                        text={$musicStore.currentSong?.title || ""}
                        containerWidth={titleContainerW}
                    />
                {:else}
                    {$musicStore.currentSong?.title}
                {/if}
            </h3>
            <p class="mb-6 text-lg font-semibold">
                {$musicStore.currentSong?.artist}
            </p>

            <!-- AudioMotion Visualizer -->
            <div bind:this={visualizerContainer} class="mb-4"></div>

            <!-- Waveform -->
            <div
                bind:this={waveformContainer}
                class="w-full h-12 mb-4 cursor-pointer"
            ></div>

            <!-- Time Display -->
            <div class="w-full flex justify-between text-sm mb-4 font-semibold">
                <span>{format_time(currentTime)}</span>
                <span>{format_time(duration)}</span>
            </div>

            <!-- Playback Controls -->
            <div class="flex items-center justify-center gap-8 mb-6">
                <button class="">
                    <Icon icon="mdi:skip-previous" width="36" height="36" />
                </button>
                <button
                    class="bg-secondary rounded-full p-3"
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
