<script>
    import "../app.css";
    import { setupViewTransition } from "sveltekit-view-transition";
    import Navbar from "$lib/components/Navbar.svelte";
    import { initDb } from "$lib/db";

    initDb();
</script>

<Navbar>
    <slot />
</Navbar>

<style>
</style>
