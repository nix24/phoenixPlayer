<script lang="ts">
    import { add } from "$lib/wasmPkg";

    let addResult = 0;
    function testAdd() {
        addResult = add(1, 2);
    }
</script>

<div class="p-5 flex flex-col space-y-4 max-w-md mx-auto">
    <p class="text-3xl font-bold">tests assembly add function</p>
    <button class="btn btn-primary" on:click={testAdd}>Test wasm</button>
    <p class="text-2xl font-semibold">Result: {addResult}</p>
</div>
