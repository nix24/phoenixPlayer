<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    export let text: string;
    export let containerWidth: number;
    let textEl: HTMLSpanElement;
    let animationId: number;
    let offset = 0;

    function animate() {
        offset -= 1; // Move text to the left
        if (-offset >= textEl.scrollWidth) {
            offset = containerWidth; // Reset offset to start from the right again
        }
        textEl.style.transform = `translateX(${offset}px)`;

        animationId = requestAnimationFrame(animate);
    }

    onMount(() => {
        if (textEl.scrollWidth > containerWidth) {
            animationId = requestAnimationFrame(animate);
        }
    });

    onDestroy(() => {
        if (animationId) cancelAnimationFrame(animationId);
    });

    // Handle page visibility change
    function handleVisibilityChange() {
        if (document.visibilityState === "hidden") {
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            if (textEl.scrollWidth > containerWidth) {
                animationId = requestAnimationFrame(animate);
            }
        }
    }

    // Listen for visibility change events
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up event listener on component destroy
    onDestroy(() => {
        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );
    });
</script>

<div style="overflow: hidden; white-space: nowrap; width: {containerWidth}px;">
    <span bind:this={textEl}>{text}</span>
</div>

<style>
    span {
        display: inline-block;
        will-change: transform;
    }
</style>
