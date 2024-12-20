<script>
    import { onMount } from 'svelte';
    import { api } from '../../assets/utils';
    import { notifications } from '../notification/notifications';

    let workouts = [];

    const fetchWorkouts = async () => {
        try {
            const response = await api('/workouts', "", 'GET');
            workouts = response;
        } catch (error) {
            console.error('Error fetching workouts:', error);
            notifications.error('Failed to fetch workouts', 3000);
        }
    };

    onMount(() => {
        fetchWorkouts();
    });


    $: console.log(workouts);



    function viewDetails(workoutId) {
        // Navigate to workout detail page
        window.location.href = `/workout/${workoutId}`;
    }
</script>

<div class="workout-list">
    <h2>All Workouts</h2>
    {#if workouts.length > 0}
        <ul>
            {#each workouts as workout}
                <li>
                    <a href={null} on:click={() => viewDetails(workout.id)}>
                        {workout.exercise} - {workout.description}
                    </a>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No workouts available.</p>
    {/if}
</div>

<style>
    .workout-list {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid var(--color-medium);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin: 0 auto;
    }

    .workout-list h2 {
        color: var(--color-primary);
        margin-bottom: 20px;
    }

    .workout-list ul {
        list-style: none;
        padding: 0;
    }

    .workout-list li {
        margin-bottom: 10px;
    }

    .workout-list a {
        text-decoration: none;
        color: var(--color-secondary);
        font-weight: bold;
        transition: color 0.3s ease;
    }

    .workout-list a:hover {
        color: var(--color-green);
    }

    .workout-list p {
        color: var(--color-olive);
    }
</style>
