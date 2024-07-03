<script lang="ts">
    import { playlistStore } from "$lib/store/PlaylistStore";
    import type { PlayList } from "$lib/types";
    import Icon from "@iconify/svelte";
    import { v4 as uuidv4 } from "uuid";

    export let playlists: PlayList[];

    function handleCreatePlaylist() {
        const name = prompt("Enter playlist name");
        if (name) {
            playlistStore.addPlaylist({
                id: uuidv4(),
                name,
                songs: [],
            });
        }
    }

    function handleDeletePlaylist(id: string) {
        const confirmation = confirm(
            "Are you sure you want to delete this playlist?",
        );
        if (confirmation) {
            playlistStore.deletePlaylist(id);
        }
    }
</script>

<div class="container">
    <h2>Playlists</h2>
    <button class="btn btn-primary" on:click={handleCreatePlaylist}>
        Create Playlist
        <Icon icon="mdi:playlist-plus" width="24" height="24" />
    </button>

    <ul class="space-y-2">
        {#each playlists as playlist}
            <li
                class="flex justify-between items-center p-2 bg-base-200 rounded"
            >
                <span>{playlist.name} ({playlist.songs.length} songs)</span>
                <button
                    class="btn btn-sm btn-circle"
                    on:click={() => handleDeletePlaylist(playlist.id)}
                >
                    <Icon icon="mdi:delete" />
                </button>
            </li>
        {/each}
    </ul>
</div>
