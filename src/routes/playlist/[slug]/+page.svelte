<script lang="ts">
    import SongList from "$lib/components/SongList.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
    console.log("data", data);

    const playlist = data.playlist;
    const playlistSongs = data.playlistSongs || [];

    console.log("playlistSongs", playlistSongs);
</script>

<div class="container">
    {#if playlist && playlistSongs}
        <h1 class="text-2xl font-bold">{playlist?.name}</h1>

        <p>{playlistSongs?.length || 0} songs</p>

        <div class="divider" />

        {#if playlistSongs}
            <SongList songs={playlistSongs} isPlaylistView={true} />
        {/if}
    {:else}
        <div class="loading loading-ring"></div>
    {/if}
</div>
