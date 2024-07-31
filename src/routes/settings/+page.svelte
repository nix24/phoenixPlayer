<script lang="ts">
    import { add } from "$lib/wasmPkg";

    let addResult = 0;
    function testAdd() {
        addResult = add(1, 2);
    }
</script>

<div class="container">
    <h1>Settings</h1>
    <nav>
        <ul>
            <li><a href="/settings/convertYoutube">YouTube to MP3</a></li>
            <!-- Add more settings options as needed -->
        </ul>
    </nav>
    <div class="wasm-test">
        <h2>WebAssembly Test</h2>
        <button on:click={testAdd}>Test WASM</button>
        <p>Result: {addResult}</p>
    </div>
</div>
