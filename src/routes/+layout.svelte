<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import "../app.css";
    import Navbar from "$lib/components/Navbar.svelte";
    import { initDb } from "$lib/db";

    let isWasmLoaded = false;

    onMount(async () => {
        if (browser) {
            const wasm = await import("../../wasm_utils/pkg");
            await wasm.default();
            isWasmLoaded = true;
        }
        await initDb();
    });
</script>

{#if browser}
    {#if isWasmLoaded}
        <Navbar>
            <slot />
        </Navbar>
    {:else}
        <div>Loading WASM...</div>
    {/if}
{:else}
    <Navbar>
        <slot />
    </Navbar>
{/if}
