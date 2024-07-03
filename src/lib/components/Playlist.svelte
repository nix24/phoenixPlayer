<script lang="ts">
    import { musicStore } from "$lib/store/MusicStore";
    import { playlistStore } from "$lib/store/PlaylistStore";
    import type { PlayList } from "$lib/types";
    import Icon from "@iconify/svelte";
    import { v4 as uuidv4 } from "uuid";
    import placeholder from "$lib/images/placeholder.png";
    import { goto } from "$app/navigation";

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
    function getPlaylistThumbnail(playlist: PlayList): string {
        if (playlist.songs.length > 0) {
            const firstSongId = playlist.songs[0];
            const song = $musicStore.songs.find((s) => s.id === firstSongId);
            return song?.coverArt
                ? `data:image/jpg;base64,${song.coverArt}`
                : placeholder;
        }
        return placeholder;
    }
</script>

<div class="container flex flex-col space-y-4 mb-[-10rem]">
    <h2 class="text-xl font-bold">Playlists</h2>
    <button class="btn btn-primary max-w-40" on:click={handleCreatePlaylist}>
        Create Playlist
        <Icon icon="mdi:playlist-plus" width="24" height="24" />
    </button>

    <div class="carousel rounded-box h-96">
        {#each playlists as playlist (playlist.id)}
            <div
                class="carousel-item h-48 relative w-1/2 mx-2 hover:cursor-pointer hover:scale-105 transition"
                on:click={() => goto(`/playlist/${playlist.id}`)}
                on:keydown={(e) => {
                    if (e.key === "Enter") {
                        goto(`/playlist/${playlist.id}`);
                    }
                }}
                aria-label={playlist.name}
                tabindex="0"
                role="button"
            >
                <img
                    src={getPlaylistThumbnail(playlist)}
                    alt={playlist.name}
                    class="w-full h-full object-cover rounded-lg"
                />
                <div
                    class=" flex justify-between absolute bottom-0 left-0 right-0 bg-base-300 bg-opacity-70 text-base-content p-2 rounded-b-lg"
                >
                    <p class="text-lg font-semibold">{playlist.name}</p>
                    <p class="text-lg font-mono">
                        {playlist.songs.length} song(s)
                    </p>
                </div>
                <button
                    class="btn btn-circle btn-sm absolute top-2 right-2"
                    on:click={() => handleDeletePlaylist(playlist.id)}
                >
                    <Icon icon="mdi:delete" />
                </button>
            </div>
        {/each}
    </div>
</div>
