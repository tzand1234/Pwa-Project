<script>
    import { onMount } from "svelte";
    import { notifications } from "../notification/notifications.js";
    import { api } from "../../assets/utils.js";

    export let workoutId;
    let workout = null;
    let reviews = [];

    const fetchWorkoutDetails = async () => {
        try {
            workout = await api(`/workouts/${workoutId}`, null, "GET");
            reviews = await api(`/workouts/${workoutId}/reviews`, null, "GET");
        } catch (error) {
            console.error("Error fetching workout details:", error);
            notifications.error("Failed to fetch workout details", 3000);
        }
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

    async function handlePictureUpload(event) {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        try {
            const blobUrl = URL.createObjectURL(file);
            profile.avatarUrl = blobUrl;
            await drawProfile();
            notifications.success(
                "Profile picture updated successfully!",
                3000,
            );
        } catch (error) {
            console.error("Error updating profile picture", error);
            notifications.error("Failed to update profile picture.", 3000);
        }
    }

    onMount(() => {
        fetchWorkoutDetails();
    });
</script>

<div class="workout-detail">
    {#if workout}
        <h2>{workout.exercise}</h2>
        <p>{workout.description}</p>
        {#if workout.imageUrl}
            <canvas id="profileCanvas" width="100" height="100"></canvas>
        {/if}

        <h3>Reviews</h3>
        {#if reviews.length > 0}
            <ul>
                {#each reviews as review}
                    <li>
                        <p>{review.review}</p>
                        <small>Rating: {review.rating}/5</small>
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No reviews yet.</p>
        {/if}
    {:else}
        <p>Loading workout details...</p>
    {/if}
</div>

<style>
    .workout-detail {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid var(--color-medium);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin: 0 auto;
        color: var(--color-white);
    }

    .workout-detail h2 {
        margin-bottom: 20px;
    }

    .workout-detail p {
        color: var(--color-dark);
    }

    .workout-detail h3 {
        color: var(--color-secondary);
        margin-top: 20px;
    }

    .workout-detail ul {
        list-style: none;
        padding: 0;
    }

    .workout-detail li {
        margin-bottom: 10px;
        border-bottom: 1px solid var(--color-medium);
        padding-bottom: 10px;
    }

    .workout-detail small {
        color: var(--color-gray);
    }
</style>
