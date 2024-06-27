<script>
    import "../app.css";
    import Navbar from "$lib/components/Navbar.svelte";
    import { initDb } from "$lib/db";

    initDb();
</script>

<Navbar>
    <slot />
</Navbar>
