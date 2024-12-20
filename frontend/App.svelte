<script>
    import Nav from "./components/nav/Nav.svelte";
    import Search from "./components/nav/Search.svelte";
    import Login from "./components/login/Login.svelte";
    import { onDestroy, onMount } from 'svelte';
    import { User, api, componentStore } from "./assets/utils.js";
    import { blur } from "svelte/transition";
    import Toast from './components/notification/Toast.svelte';
    import { notifications } from "./components/notification/notifications";
    import { navOptions } from "./components/nav/NavOptions.svelte"; // Import navOptions

    let searchVisible = false;
    let selectedNavOption;
    let selectedIndex;
    let user;
    let timeoutId;

    function toggleSearch() {
        searchVisible = !searchVisible;
    }

    const unUser = User.subscribe(v => user = v);

    const fetchUserInfo = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const username = JSON.parse(userData).username;
                const userProfile = await api(`/users/${username}`, null, 'GET');
                const workouts = await api(`/users/${userProfile.id}/workouts`, null, 'GET');
                console.log(userProfile);
                console.log(workouts);
                localStorage.setItem('userProfile', JSON.stringify({ ...userProfile, workouts }));
            } else {
                throw new Error('User data not found in localStorage');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            notifications.warning('Failed to fetch user data', 3000);
        }
    };

    // Set a timeout to unsubscribe after 10 minutes
    timeoutId = setTimeout(() => {
        User.signout();
        notifications.warning("You have been inactive for 10 minutes. Log back in", 3000);
    }, 600000);

    onDestroy(() => {
        clearTimeout(timeoutId);
        unUser();
    });

    componentStore.subscribe(store => {
        selectedIndex = store.selectedIndex;
        selectedNavOption = store.navOptions[selectedIndex];
    });

    onMount(() => {
        fetchUserInfo();
        componentStore.setNavOptions(navOptions); // Set navOptions in the store
    });

    $: loggedIn = !!user;
</script>

<div class="app">
    {#if loggedIn}
        <header class="app-header" transition:blur={{ amount: 30 }}>
            <Nav {toggleSearch} />
            {#if searchVisible}
                <Search {toggleSearch} />
            {/if}
        </header>

        <div class:overlay={searchVisible}></div>

        {#if selectedNavOption}
            <svelte:component this={selectedNavOption.component} />
        {/if}

    {:else}
        <Login />
    {/if}

    <Toast />
</div>


<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #00000096;
        z-index: 900;
    }
</style>