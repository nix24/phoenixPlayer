<script lang="ts">
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher();

    let searchQuery = "";

    const handleSearch = () => {
        dispatcher("search", searchQuery);
    };

    const handleInput = (e: Event) => {
        searchQuery = (e.target as HTMLInputElement).value;
    };
</script>

<div class="form-control">
    <div class="relative">
        <input
            type="text"
            placeholder="Search the library..."
            class="input input-bordered w-full"
            on:input={handleInput}
            on:keydown={(e) => {
                if (e.key === "Enter") handleSearch();
            }}
        />

        <button
            type="button"
            on:click={handleSearch}
            class="absolute left-72 top-4"
        >
            <Icon icon="mdi:magnify" class="text-xl z-10" />
        </button>
    </div>
</div>
