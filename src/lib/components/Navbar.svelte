<script lang="ts">
    import { fade } from "svelte/transition";
    import { setupViewTransition } from "sveltekit-view-transition";

    let drawerOpen = false;

    const { transition } = setupViewTransition();
</script>

<div class="sticky top-0 z-50">
    <div class="drawer">
        <input
            id="my-drawer-3"
            type="checkbox"
            class="drawer-toggle"
            bind:checked={drawerOpen}
        />
        <div class="drawer-content flex flex-col">
            <!-- Navbar -->
            <div class="navbar bg-base-300">
                <div class="flex-none lg:hidden">
                    <label
                        for="my-drawer-3"
                        aria-label="open sidebar"
                        class="btn btn-square btn-ghost"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="inline-block w-6 h-6 stroke-current"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path></svg
                        >
                    </label>
                </div>
                <a href="/" data-sveltekit-preload-data class="flex-1 px-2 mx-2"
                    >Phoenix Player <span
                        class="font-mono text-sm px-2 text-warning">Alpha</span
                    ></a
                >
                <div class="flex-none hidden lg:block">
                    <ul class="menu menu-horizontal">
                        <!-- Navbar menu content here -->
                        <li>
                            <a href="/artists">Artists</a>
                        </li>
                        <li><a href="/albums">Albums</a></li>
                        <li><a href="/playlists">Playlists</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="drawer-side">
            <label
                for="my-drawer-3"
                aria-label="close sidebar"
                class="drawer-overlay"
            ></label>
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <ul
                on:click={() => (drawerOpen = !drawerOpen)}
                on:keydown={() => (drawerOpen = !drawerOpen)}
                class="menu p-4 w-80 min-h-full bg-base-200"
            >
                <!-- Sidebar content here -->
                <li>
                    <a href="/artists">Artists</a>
                </li>
                <li><a href="/albums">Albums</a></li>
                <li><a href="/playlists">Playlists</a></li>
            </ul>
        </div>
    </div>
</div>
<!-- Page content here -->
<main
    use:transition={{
        name: "page",
        classes: ({ navigation }) => {
            if (navigation.to?.url.pathname.includes("/songs/")) {
                return ["slide-up"];
            } else if (navigation.from?.url.pathname.includes("/songs/")) {
                return ["fade"];
            }
            return [];
        },
    }}
>
    <slot />
</main>

<style>
    :global(.slide-up::view-transition-old(page)),
    :global(.slide-up::view-transition-new(page)) {
        animation: 500ms cubic-bezier(0.4, 0, 0.2, 1) both slide-up;
    }

    @keyframes slide-up {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }

    @keyframes slide-down {
        from {
            transform: translateY(-100%);
        }
        to {
            transform: translateY(0);
        }
    }
</style>
