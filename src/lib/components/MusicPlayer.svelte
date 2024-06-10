<script lang="ts">
    //music player component
    import { musicStore } from "$lib/store/MusicStore";
    import { formatTime } from "$lib/util";
    import { onDestroy } from "svelte";
    import * as Tone from "tone";
    import placeholder from "$lib/images/placeholder.png";
    import Icon from "@iconify/svelte";

    let player: Tone.Player;
    let currentTime = 0;

    musicStore.subscribe(({ currentSong, isPlaying: storeIsPlaying }) => {
        if (currentSong) {
            if (player) {
                player.stop();
                player.dispose();
            }
            player = new Tone.Player(currentSong.audioUrl).toDestination();
            player.sync().start();
        }
    });

    const seek = (time: number) => {
        player.seek(time);
        currentTime = time;
        requestAnimationFrame(seek);
    };

    onDestroy(() => {
        if (player) {
            player.stop();
            player.dispose();
        }
    });
</script>

<div class=" bg-base-100 z-50 p-4">
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
            src={$musicStore.currentSong?.audioUrl}
            controls
            class="w-full mt-4 rounded-lg"
        />
    </div>
</div>
