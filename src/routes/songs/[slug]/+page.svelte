<script lang="ts">
    import { musicStore } from "$lib/store/MusicStore";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import MusicPlayerWs from "$lib/components/MusicPlayerWS.svelte";
    import { createBlobUrl } from "$lib/util";
    import placeholder from "$lib/images/placeholder.png";

    export let data: PageData;

    onMount(async () => {
        if ($musicStore.songs.size === 0) {
            await musicStore.initializeStore();
        }

        if (data.props?.song) {
            musicStore.setCurrentSong(data.props.song.id as string);
        }
    });

    $: currentSong = $musicStore.globalQueue?.currentSongId
        ? $musicStore.songs.get($musicStore.globalQueue.currentSongId)
        : null;

    $: audioSrc = currentSong?.audioUrl
        ? createBlobUrl(currentSong.audioUrl)
        : "";

    $: imageSrc = currentSong?.coverArt
        ? `data:image/jpg;base64,${currentSong.coverArt}`
        : placeholder;
</script>

<div class="flex flex-col items-center w-full">
    <MusicPlayerWs {audioSrc} {imageSrc} />
</div>
