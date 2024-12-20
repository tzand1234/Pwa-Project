<script>
    import { onMount } from 'svelte';
    import { notifications } from '../notification/notifications';

    let workouts = [];

    const fetchUserWorkouts = async () => {
        try {
            const userData = localStorage.getItem('userProfile');
            if (userData) {
                const user = JSON.parse(userData);
                workouts = user.workouts;
            } else {
                throw new Error('User data not found in localStorage');
            }
        } catch (error) {
            console.error('Error fetching user workouts:', error);
            notifications.warning('Failed to fetch user workouts', 3000);
        }
    };

    onMount(() => {
        fetchUserWorkouts();
    });
</script>

<div class="user-workouts">
    <h2>Your Workouts</h2>
    {#if workouts.length > 0}
        <ul>
            {#each workouts as workout}
                <li>
                    <a href={`/workout/${workout.id}`}>{workout.exercise} - {workout.description}</a>
                </li>
            {/each}
        </ul>
    {:else}
        <p>You have no workouts. <a href="/create-workout">Create a workout</a></p>
    {/if}
</div>

<style>
    .user-workouts {
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

    .user-workouts h2 {
        margin-bottom: 20px;
    }

    .user-workouts ul {
        list-style: none;
        padding: 0;
    }

    .user-workouts li {
        margin-bottom: 10px;
    }

    .user-workouts a {
        text-decoration: none;
        color: var(--color-secondary);
        font-weight: bold;
        transition: color 0.3s ease;
    }

    .user-workouts a:hover {
        color: var(--color-green);
    }

    .user-workouts p {
        color: var(--color-olive);
    }
</style>
