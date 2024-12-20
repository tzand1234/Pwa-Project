<script context="module">
    // main navigation for the application
    import Profile from '../profile/Profile.svelte';
    import AddWorkout from '../workouts/AddWorkout.svelte';
    import UserWorkouts from '../workouts/UserWorkouts.svelte';
    import Workouts from '../workouts/Workouts.svelte';

    export const navOptions = [
        { page: 'Workouts', component: Workouts, visible: true },
        { page: 'Your Workouts', component: UserWorkouts, visible: true },
        { page: 'Add a Workout', component: AddWorkout, visible: true },
        { page: 'Profile', component: Profile, visible: false },
    ];
</script>