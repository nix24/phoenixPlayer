<script lang="ts">
    import { add } from "../../../wasm_utils/pkg";

    let addResult = 0;
    function testAdd() {
        addResult = add(1, 2);
    }
</script>

<div>
    <button on:click={testAdd}>Test format_time</button>
    <p>Result: {addResult}</p>
</div>
