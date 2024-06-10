<script lang="ts">
    // /songs/[slug] page
    import MusicPlayer from "$lib/components/MusicPlayer.svelte";
    import { musicStore } from "$lib/store/MusicStore";
    import type { Song } from "$lib/types.js";
    import type { PageData } from "./$types";

    export let data: PageData;

    musicStore.set({
        songs: $musicStore.songs,
        currentSong: data.props?.song as Song,
        isPlaying: true,
    });
</script>

<h1>Testing, this is a slug page for specific song</h1>
<pre>{JSON.stringify(data, null, 2)}</pre>

<MusicPlayer />
