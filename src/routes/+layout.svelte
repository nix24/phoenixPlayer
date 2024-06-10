<script>
    import "../app.css";
    import { setupViewTransition } from "sveltekit-view-transition";
    import Navbar from "$lib/components/Navbar.svelte";
    setupViewTransition();
</script>

<Navbar>
    <slot />
</Navbar>

<style>
</style>
