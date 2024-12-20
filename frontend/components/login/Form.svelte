<script>
    import Loading from "../../assets/Loading.svelte";
    import { fade } from "svelte/transition";


    export let currentForm;
    export let username;
    export let email
    export let password;
    export let submit;
    export let loading;

    const forms = {
        login: { title: "Login", buttonText: "Login" },
        register: { title: "Register", buttonText: "Register" },
        "reset-password": { title: "Reset Password", buttonText: "Reset Password" }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "username") {
            username = value;
        } else if (name === "password") {
            password = value;
        } else if (name === "email") {
            email = value;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        loading = true;

        try {
            await submit();
        } finally {
            loading = false;
        }
    };

    $: formDetails = forms[currentForm];
</script>

<form on:submit={handleSubmit} class="form-container" transition:fade={{ delay: 150, duration: 200 }} >
    <h2>{formDetails.title}</h2>
    {#if !navigator.onLine}
        <div id="offline-status">You are offline. Go back online to login or sign up</div>
    {:else}
        <label for="username">Username:</label>
        <input id="username" type="text" name="username" bind:value={username} placeholder="Username" on:input={handleChange} required />
        
        {#if currentForm === "register" || currentForm === "reset-password"}
            <label for="email">Email:</label>
            <input id="email" type="email" name="email" bind:value={email} placeholder="Email" on:input={handleChange} required />
        {/if}

        
        <label for="password">Password:</label>
        <input id="password" type="password" name="password" bind:value={password} placeholder="Password" on:input={handleChange} required />
        
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : formDetails.buttonText}</button>
        
        {#if loading}
            <Loading />
        {/if}
    {/if}
</form>

<style>
    .form-container {
        max-width: 320px;
        margin: 40px auto;
        padding: 20px;
        border: 1px solid var(--color-medium);
        color: var(--text-primary);
        border-radius: 8px;
        background-color: var(--color-black);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .form-container h2 {
        text-align: center;
        margin-bottom: 20px;
    }

    .form-container label {
        display: block;
        margin-bottom: 5px;
    }

    .form-container input {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    .form-container button[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .form-container button {
        width: 100%;
        padding: 10px;
        font-size: 1rem;
        background-color: var(--color-olive);
        border: none;
        border-radius: 4px;
        color: var(--color-black);
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .form-container button:hover {
        background-color: var(--color-green);
    }
</style>