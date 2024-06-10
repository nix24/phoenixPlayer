<script lang="ts">
    import type { Song } from "$lib/types";
    import { createEventDispatcher } from "svelte";

    export let listShown = false;
    // biome-ignore lint/style/useConst: <explanation>
    export let filterMetadata: Song[] = [];
    export let selectedIndex = -1;

    const dispatch = createEventDispatcher();

    const handleSelect = (index: number) => {
        selectedIndex = index;
        dispatch("songSelected", filterMetadata[index]);
        listShown = false;
    };

    const handleKeyDown = (e: KeyboardEvent, index: number) => {
        if (e.key === "Enter" || e.key === " ") {
            handleSelect(index);
        } else if (e.key === "Escape") {
            listShown = false;
        }
    };
</script>

{#if listShown && filterMetadata.length > 0}
    <div
        class="absolute w-full border border-accent bg-base-100 shadow-xl rounded-md mt-2 z-10"
        role="listbox"
    >
        <ul class="p-2 text-base-content">
            {#each filterMetadata as song, index (index)}
                <li
                    class="p-2 rounded-md hover:bg-base-200 cursor-pointer"
                    role="option"
                    aria-selected={selectedIndex === index}
                    on:click={() => handleSelect(index)}
                    on:keydown={(e) => handleKeyDown(e, index)}
                >
                    <p class="font-semibold">{song.title}</p>
                    <p class="text-sm opacity-75">{song.artist}</p>
                </li>
            {/each}
        </ul>
    </div>
{/if}
