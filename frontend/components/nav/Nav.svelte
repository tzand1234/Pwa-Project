<script>
    import { clickOutside, componentStore, User, sliderStore } from "../../assets/utils.js";
    import { fade } from "svelte/transition";

    let isSliderOpen = false;
    let navOptions = [];
    let selectedIndex;
    export let toggleSearch;

    componentStore.subscribe(store => {
        navOptions = store.navOptions;
        selectedIndex = store.selectedIndex;
    });

    function handleAccountClick() {
        const profileIndex = navOptions.findIndex(option => option.page === 'Profile');
        if (profileIndex !== -1) {
            componentStore.changeComponent(profileIndex);
            sliderStore.closeSlider();
        }
    };

    function handleSearchClick() {
        toggleSearch();
        sliderStore.closeSlider();
    };

    function handleNavLinkClick(index) {
        componentStore.changeComponent(index);
        sliderStore.closeSlider();
    };

    sliderStore.subscribe(store => {
        isSliderOpen = store.isSliderOpen;
    });

</script>

<div class="logo">
    <span class="logo-icon">
        <img alt="Logo" src="./assets/almeria-logo.svg" />
    </span>
    <h1 class="logo-title">Workout</h1>
</div>

<!-- Desktop Navigation Tabs -->
<nav class="app-header-navigation">
    <div class="tabs">
        {#each navOptions as option, i}
            {#if option.visible}
                <a
                    href={null}
                    class:selected={selectedIndex == i}
                    on:click={() => handleNavLinkClick(i)}
                    id={i}>{option.page}</a>
            {/if}
        {/each}
    </div>
</nav>

<!-- Actions Buttons -->
<div class="app-header-actions">
    <div class="app-header-actions-buttons">
        <button class="icon-button large" on:click={toggleSearch}>
            <span class="material-symbols-outlined">search</span>
        </button>
        <button class="icon-button large" on:click={handleAccountClick}>
            <span class="material-symbols-outlined">person</span>
        </button>
        <!-- Slider Toggle Button -->
        <button class="icon-button large mobile" on:click={() => sliderStore.toggleSlider()}>
            <span class="material-symbols-outlined">segment</span>
        </button>
        <button class="icon-button large" on:click={() => User.signout()}>
            <span class="material-symbols-outlined">exit_to_app</span>
        </button>
    </div>
</div>

<!-- Mobile Navigation Slider -->
<div class="app-header-mobile" use:clickOutside>
    <!-- Slider Content -->
    {#if isSliderOpen}
        <div class="slider" transition:fade={{ delay: 150, duration: 200 }} on:click_outside={() => (isSliderOpen = !isSliderOpen)}>
            <button class="close-button" aria-label="Close search" on:click={() => (sliderStore.closeSlider())}>&times;</button>
            {#each navOptions as option, i}
                {#if option.visible}
                    <a
                        href={null}
                        class:selected={selectedIndex == i}
                        on:click={() => handleNavLinkClick(i)}
                        id={i}>{option.page}</a>
                {/if}
            {/each}
            <div class="bottom-icons">
                <button class="icon-button" aria-label="Account" on:click={handleAccountClick}>
                    <span class="material-symbols-outlined">person</span>
                </button>
                <button class="icon-button" aria-label="Search" on:click={handleSearchClick}>
                    <span class="material-symbols-outlined">search</span>
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Global Header Styles */
    .logo {
        display: flex;
        align-items: center;
        color: var(--text-primary);
    }

    .logo-title {
        margin-left: 0.5rem;
    }

    .tabs {
        display: flex;
        gap: 1rem;
        list-style-type: none;
        padding: 0;
        margin: 0;
        border-bottom: 1px solid var(--color-medium);
    }

    .tabs a {
        padding: 1rem;
        text-decoration: none;
        color: var(--text-tertiary);
        transition: color 0.25s ease;
    }

    .tabs a:hover,
    .tabs a:focus {
        color: var(--text-primary);
    }

    .app-header-actions-buttons {
        display: flex;
        gap: 1rem;
    }

    .icon-button {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid var(--color-light-medium);
        background-color: transparent;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.25s ease;
    }

    .icon-button.large {
        width: 42px;
        height: 42px;
        font-size: 1.25em;
    }

    .icon-button:hover,
    .icon-button:focus {
        background-color: var(--color-medium);
        box-shadow:
            0 0 0 4px var(--color-dark),
            0 0 0 5px var (--text-tertiary);
    }

    /* Mobile Specific Styles */
    .icon-button.large.mobile,
    .app-header-mobile {
        display: none;
    }

    .slider {
        position: absolute;
        top: 124px;
        text-align: center;
        left: 0;
        width: 100%;
        background-color: var(--color-black);
        padding: 1rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 999;
    }

    .slider a {
        display: block;
        padding: 1rem;
        text-decoration: none;
        color: var(--text-tertiary);
        transition: color 0.25s ease;
    }

    .slider a:hover,
    .slider a:focus {
        color: var(--text-primary);
    }

    .close-button {
        background-color: var(--color-olive);
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        position: absolute;
        top: 10px;
        right: 10px;
    }

    .bottom-icons {
        position: absolute;
        bottom: 10px;
        left: 10px;
        display: flex;
        gap: 10px;
    }

    /* Media Query for Responsive Design */
    @media (max-width: 1000px) {
        .tabs {
            display: none;
        }

        .app-header-mobile {
            display: contents;
            margin-top: 1rem;
        }

        .icon-button.large.mobile {
            display: contents;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid var(--color-light-medium);
            background-color: transparent;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.25s ease;
        }

        .app-header-actions-buttons > button:nth-child(-n + 2) {
            display: none;
        }

        .icon-button.large.mobile {
            width: 42px;
            height: 42px;
            font-size: 1.25em;
        }
    }
</style>
