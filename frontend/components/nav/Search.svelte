<script>
    import { fade } from "svelte/transition";
    import Loading from "../../assets/Loading.svelte";
    export let toggleSearch;
    let search = "";
    let products = [];
    let timeout;
    let searching = false;

    function handle_search() {
        searching = true;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(get_products, 300);
    }

    async function get_products() {
        if (!search.trim()) {
            reset();
            return;
        }

        try {
            const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(search)}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            products = data.products || [];
        } catch (error) {
            handleError();
        } finally {
            searching = false;
        }
    }

    function handleError() {
        alert("Something went wrong.");
        reset();
    }

    function reset() {
        products = [];
        searching = false;
    }

    function clearSearch() {
        search = "";
        reset();
    }

    function handleClick(product) {
        alert(`Clicked on product: ${product.title}`);
    }
</script>

<div class="search-container" transition:fade={{ delay: 150, duration: 200 }}>
    <input
        type="text"
        bind:value={search}
        placeholder="Search..."
        on:input={handle_search}
    />
    {#if searching}
        <Loading />
    {/if}
    {#if search}
        <button class="clear-button" on:click={clearSearch}>Clear</button>
    {/if}
    <button class="close-button" aria-label="Close search" on:click={toggleSearch}>&times;</button>
</div>

{#if search.length > 0}
    <div class="results-container" transition:fade={{ delay: 150, duration: 200 }}>
        {#if !searching && products.length === 0 && search}
            <p>No results found.</p>
        {/if}
        <ul>
            {#each products as product}
                <li>
                    <button type="button" class="product-button" on:click={() => handleClick(product)}>
                        {product.title} ({product.price}€)
                    </button>
                </li>
            {/each}
        </ul>
    </div>
{/if}

<style>
    .search-container {
        position: fixed;
        top: 124px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 800px;
        border: 1px solid var(--color-medium);
        background-color: var(--color-black);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    input[type="text"] {
        width: 80%;
        max-width: 600px;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-right: 0.5rem;
    }

    .clear-button,
    .close-button {
        background-color: var(--color-olive);
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-left: 0.5rem;
    }

    .clear-button:hover,
    .close-button:hover {
        background-color: var(--color-green);
    }

    .close-button {
        font-size: 1.5rem;
        line-height: 1.5rem;
    }

    .results-container {
        position: fixed;
        top: 198px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 800px;
        max-height: 300px;
        margin: 0 auto;
        overflow-y: auto;
        border: 1px solid var(--color-medium);
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        z-index: 1001; /* higher than overlay */
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        color: var(--color-black);
    }

    li {
        border-bottom: 1px solid #ccc;
    }

    .product-button {
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        transition: background-color 0.3s ease;
    }

    .product-button:hover {
        background-color: var(--color-black);
        color: var(--color-olive);
    }

    li:last-child {
        border-bottom: none;
    }

    p {
        text-align: center;
        color: var(--color-black);
    }
</style>
