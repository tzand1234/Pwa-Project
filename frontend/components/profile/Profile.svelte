<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { componentStore, sliderStore, api } from "../../assets/utils";
    import { navOptions } from "../nav/NavOptions.svelte";
    import { notifications } from "../notification/notifications";

    let profile = {
        name: "",
        username: "",
        bio: "",
        avatarUrl: "../assets/default-profile-picture.jpg", // default image path
        workouts: [],
    };

    let edit = false;

    function loadProfileData() {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
            profile = JSON.parse(storedProfile);
        }
    };

    function handleAddWorkoutClick() {
        sliderStore.closeSlider();
        componentStore.changeComponent(navOptions.findIndex(option => option.page === 'Add a Workout'));
    };

    async function drawProfile() {
        const canvas = document.getElementById("profileCanvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = profile.avatarUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#ddd";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        };
    }

    // Function to handle profile picture upload
    async function handlePictureUpload(event) {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        try {
            const blobUrl = URL.createObjectURL(file);
            profile.avatarUrl = blobUrl;
            await drawProfile();
            notifications.success("Profile picture updated successfully!", 3000);
        } catch (error) {
            console.error("Error updating profile picture", error);
            notifications.error("Failed to update profile picture.", 3000);
        }
    };

    async function shareProfile() {
        const profileText = `Check out my workout profile: ${profile.username}, Bio: ${profile.bio}, Workouts: ${profile.workouts.length}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My Workout Profile",
                    text: profileText,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing", error);
                notifications.error("Failed to share profile.", 3000);
            }
        } else {
            copyToClipboard(profileText);
            notifications.success("Profile information copied to clipboard!", 3000);
        }
    };

    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    };

    async function updateProfile() {
        try {
            console.log(profile);
            const updatedProfile = await api(`/users/${profile.username}`, profile, "PUT");
            localStorage.setItem('userProfile', JSON.stringify(profile));
            edit = false;
            notifications.success("Profile updated successfully!", 3000);
        } catch (error) {
            console.error("Error updating profile", error);
            notifications.error("Failed to update profile.", 3000);
        }
    };

    onMount(() => {
        loadProfileData();
        drawProfile();
    });
</script>

<div class="profile-container" transition:fade={{ delay: 150, duration: 200 }}>
    {#if !edit}
        <h2>Profile</h2>
        <div class="profile">
            <canvas id="profileCanvas" width="100" height="100"></canvas>
            <input
                type="file"
                accept="image/*"
                id="profilePictureInput"
                style="display: none;"
                onchange={handlePictureUpload}
            />
            {#if profile.name}
                <p>Name: {profile.name}</p>
            {:else}
                <p>Name: Not yet added</p>
            {/if}
            {#if profile.bio}
                <p>Bio: {profile.bio}</p>
            {:else}
                <p>Bio: Not yet added</p>
            {/if}
            {#if profile.workouts.length > 0}
                <p>Workouts: {profile.workouts.length}</p>
            {/if}
            <div class="buttons">
                <button class="share-button" on:click={() => edit = true}>Edit Profile</button>
                <button class="share-button" on:click={shareProfile}>Share Profile</button>
            </div>

            {#if profile.workouts.length > 0}
                <h3>Most recent workouts:</h3>
                <ul class="workouts-list">
                    {#each profile.workouts as workout}
                        <li class="workout-item">
                            <a class="workout-link" href={workout.link}>{workout.exercise}</a>
                            <p>{workout.description}</p>
                        </li>
                    {/each}
                </ul>
                <button class="show-all-workouts">Show All Workouts</button>
            {:else}
                <p>No workouts found.</p>
                <button class="add-workout-button" on:click={handleAddWorkoutClick}>Add Workout</button>
            {/if}
        </div>
    {:else}

        <h2>Edit Profile</h2>
        {#if !navigator.onLine}
            <div id="offline-status">You are offline. Go back online to edit your profile</div>
        {:else}
            <label for="username">Name:</label>
            <input type="text" id="username" bind:value={profile.name} />

            <label for="bio">Bio:</label>
            <textarea id="bio" rows="4" bind:value={profile.bio}></textarea>

            <label for="profilePicture">Profile Picture:</label>
            <input type="file" class="share-button" bind:value={profile.avatarUrl} accept="image/*" id="profilePicture" />

            <div class="buttons">
                <button class="share-button" on:click={updateProfile}>Save Changes</button>
                <button class="share-button" on:click={() => edit = false}>Cancel</button>
            </div>
        {/if}
    {/if}
</div>

<style>
    .profile-container {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid var(--color-medium);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin: 0 auto;
        color: var(--color-black);
    }

    p, h3, h2, label {
        color: var(--color-white);
    }

    canvas {
        border: 1px solid #ddd;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    .share-button, .add-workout-button {
        background-color: var(--color-olive);
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
        margin-bottom: 10px;
        transition: background-color 0.3s ease;
    }

    .share-button:hover, .add-workout-button:hover {
        background-color: var(--color-green);
    }

    .workouts-list {
        list-style: none;
        padding: 0;
        width: 100%;
    }

    .workout-item {
        margin: 10px 0;
    }

    .workout-link {
        text-decoration: none;
        color: var(--color-olive);
        font-weight: bold;
        transition: color 0.3s ease;
    }

    .workout-link:hover {
        color: var(--color-green);
    }

    .show-all-workouts {
        background-color: var(--color-olive);
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        font-size: 16px;
    }

    .show-all-workouts:hover {
        background-color: var(--color-green);
    }
</style>
