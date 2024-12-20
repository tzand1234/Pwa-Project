<script>
    import { api, componentStore } from "../../assets/utils.js";
    import { navOptions } from "../nav/NavOptions.svelte";
    import { notifications } from "../notification/notifications.js";
  
    let exercise = "";
    let description = "";
    let date = "";
    let imageUrl = "";
  
    const addWorkout = async () => {
      try {
        const userData = localStorage.getItem("userProfile");
        if (userData) {
          const user = JSON.parse(userData);
  
          // Collect form data
          const newWorkout = { userId: user.id, exercise, description, date, imageUrl };
  
          // Send API request to add workout
          const response = await fetch("/workouts", newWorkout, "POST");
  
          // Check for successful response
          if (response.ok) {
            notifications.success("Workout added successfully!", 3000);
            componentStore.changeComponent(navOptions.findIndex(option => option.page === "Workouts"));
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to add workout: ${response.status} ${response.statusText} - ${errorText}`);
          }
        } else {
          throw new Error("User data not found in localStorage");
        }
      } catch (error) {
        console.error("Error adding workout:", error);
        notifications.error("Failed to add workout", 3000);
      }
    };
  
    const handlePictureUpload = async (event) => {
      const file = event.target.files[0];
  
      if (!file) {
        return;
      }
  
      try {
        const formData = new FormData();
        formData.append("file", file);
  
        // Replace this URL with your actual API endpoint for file uploads
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload image: ${response.status} ${response.statusText} - ${errorText}`);
        }
  
        const data = await response.json();
        imageUrl = data.url; // Assuming the response contains the URL of the uploaded image
  
        notifications.success("Image uploaded successfully!", 3000);
      } catch (error) {
        console.error("Error uploading image:", error);
        notifications.error("Failed to upload image", 3000);
      }
    };
  </script>
  
  <div class="add-workout">
    <h2>Add New Workout</h2>
    <form on:submit|preventDefault={addWorkout}>
      <label for="exercise">Exercise:</label>
      <input type="text" id="exercise" bind:value={exercise} required />
  
      <label for="description">Description:</label>
      <textarea id="description" bind:value={description} required></textarea>
  
      <label for="date">Date:</label>
      <input type="date" id="date" bind:value={date} required />
  
      <label for="imageUrl">Image URL:</label>
      <input type="file" class="share-button" on:change={handlePictureUpload} accept="image/*" id="imageUrl" />
  
      <button type="submit">Add Workout</button>
    </form>
  </div>
  
<style>
    .add-workout {
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

    .add-workout form {
        display: flex;
        flex-direction: column;
    }

    h2,
    .add-workout label {
        margin-bottom: 5px;
    }

    .add-workout input,
    .add-workout textarea {
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid var(--color-medium);
        border-radius: 5px;
    }

    .add-workout button {
        background-color: var(--color-olive);
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
        margin-bottom: 10px;
        transition: background-color 0.3s ease;
    }

    .add-workout button:hover {
        background-color: var(--color-primary);
    }
</style>
