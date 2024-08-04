<script lang="ts">
    import { musicStore } from "$lib/store/MusicStore";
    import { debounce } from "$lib/util";

    // biome-ignore lint/style/useConst: <explanation>
    let searchQuery = "";

    const handleSearch = debounce(() => {
        console.log("searching for", searchQuery);
        musicStore.setSearchQuery(searchQuery);
    }, 500);

    // Subscribe to the store to update the search results
    $: {
        if ($musicStore) {
            // This will trigger a re-render of components that depend on the filtered songs
            $musicStore.searchQuery = searchQuery;
        }
    }
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
