<script lang="ts">
    import { musicStore } from "$lib/store/MusicStore";
    import { debounce } from "$lib/util";

    // biome-ignore lint/style/useConst: <explanation>
    let searchQuery = "";

    const handleSearch = debounce(() => {
        musicStore.filterSongs(searchQuery);
    }, 500);
</script>

<div class="form-control">
    <div class="relative">
        <input
            type="text"
            placeholder="Search the library..."
            class="input input-bordered w-full"
            bind:value={searchQuery}
            on:input={handleSearch}
        />
    </div>
</div>
