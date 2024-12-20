# Vite + Svelte + Express

This is a template for using Vite, Svelte (not SvelteKit), hot module replacement (HMR) and (backend) Express, all served through a HTTP server running on a single port. This makes it easier to expose your development environment on a public address using something like `ngrok`.

How to use:

- Start the server using `npm start`. Defaults to listening on `0.0.0.0:3000`, but this can be overridden by the `HOST` and `PORT` environment variables.
- The backend entry point is in `backend/index.js`. It provides an example route to get you started. The server automatically restarts when any changes are made in `backend/`.
- The `frontend/` directory contains an empty Svelte project.
