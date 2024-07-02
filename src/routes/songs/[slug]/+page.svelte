<script script lang="ts">
    // /songs/[slug] page
    import { musicStore } from "$lib/store/MusicStore";
    import type { Song } from "$lib/types.js";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { db } from "$lib/db";
    import { goto } from "$app/navigation";
    import Icon from "@iconify/svelte";
    import MusicPlayerWs from "$lib/components/MusicPlayerWS.svelte";
    import { createBlobUrl } from "$lib/util";
    import placeholder from "$lib/images/placeholder.png";

    export let data: PageData;

    onMount(async () => {
        if (!$musicStore.songs.length) {
            //if empty, fetch from db
            const dbSongs = await db?.songs.toArray();
            musicStore.update((store) => ({
                ...store,
                songs: dbSongs as Song[],
            }));
        }

        if (data.props?.song) {
            musicStore.update((store) => ({
                ...store,
                currentSong: data.props.song as Song,
            }));
        }
    });

    $: audioSrc = $musicStore.currentSong?.audioUrl
        ? createBlobUrl($musicStore.currentSong.audioUrl)
        : "";

    $: imageSrc = $musicStore.currentSong?.coverArt
        ? `data:image/jpg;base64,${$musicStore.currentSong?.coverArt}`
        : placeholder;
</script>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<div class="">
    <div class="flex flex-col items-center w-full">
        <MusicPlayerWs {audioSrc} {imageSrc} />
    </div>
</div>
