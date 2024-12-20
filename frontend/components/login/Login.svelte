<script>
    import Form from "./Form.svelte";
    import { api, User} from "../../assets/utils.js";
    import { notifications } from "../notification/notifications";
    import { fade } from "svelte/transition";

    let currentForm = "login";
    let username = "";
    let email = "";
    let password = "";
    let loading = false;

    const handleLogin = async () => {
        loading = true;
        try {
            await handleSubmit();
        } catch (error) {
            console.error(error.message);
        } finally {
            loading = false;
        }
    };

    const switchForm = (form) => {
        currentForm = form;
    };

    const handleSubmit = async () => {
        switch (currentForm) {
            case "login":
                await apiLogin();
                break;
            case "register":
                await apiRegister();
                switchForm("login");
                break;
            case "reset-password":
                await apiResetPassword();
                switchForm("login");
                break;
        }
    };

    const apiLogin = async () => {
        const response = await api("/users/login", { username, password }, "POST");
        notifications.success(`Login successful! Welcome, ${username}`, 3000);
        User.signin(username);
    };

    const apiRegister = async () => {
        const response = await api("/users/register", { username, email, password }, "POST");
        notifications.success("Registration successful! Please log in.", 3000);
    };
    const apiResetPassword = async () => {
        const response = await api("/users/reset-password", { username, email, password }, "POST");
        notifications.success("Password reset successful. You can now log in.", 3000);
    };
</script>

<Form
    {currentForm}
    bind:username={username}
    bind:email={email}
    bind:password={password}
    submit={handleLogin}
    {loading}
/>

<div class="links" transition:fade={{ delay: 150, duration: 200 }}>
    {#if currentForm !== "login"}
        <p>
            If you already have an account,
            <button on:click={() => switchForm("login")}>Login here</button>.
        </p>
    {/if}
    {#if currentForm !== "register"}
        <p>
            If you don't have an account,
            <button on:click={() => switchForm("register")}>Register here</button>.
        </p>
    {/if}
    {#if currentForm !== "reset-password"}
        <p>
            <button on:click={() => switchForm("reset-password")}>Forgot Password?</button>
        </p>
    {/if}
</div>

<style>
    .links {
        text-align: center;
        margin-top: 20px;
        font-size: 0.9rem;
    }

    .links p {
        margin: 10px 0;
    }

    .links button {
        background: none;
        border: none;
        color: var(--color-olive);
        cursor: pointer;
        padding: 0;
        font-size: 0.9rem;
        text-decoration: underline;
    }

    .links button:hover {
        color: var(--color-green);
    }
</style>
