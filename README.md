# Recipe Explorer — Beginner-Friendly Version

A small five-page React project with an Express backend and TheMealDB API.

## Features

- Home page with a selection of recipes
- Recipes page with category filtering
- Recipe details page with ingredients, instructions, and YouTube link (when available)
- Favorites page (saved in browser `localStorage`)
- Create Recipe page (saved in `server/recipes.json`)
- React Router for navigation, Axios for API requests, Express for the backend

## Requirements

Install **Node.js LTS** first: https://nodejs.org/

## Run the project on Windows

1. Extract the ZIP file.
2. Open the extracted `recipe-explorer-simple` folder.
3. Click the folder address bar in File Explorer, type `cmd`, and press Enter.
4. In the terminal, run:

   ```bash
   npm install
   ```

5. When that finishes, run:

   ```bash
   npm run dev
   ```

6. Open this address in your browser:

   http://localhost:5173

Keep the terminal open while using the app. Press `Ctrl + C` in the terminal to stop the servers.

## Pages

- `/` — Home
- `/recipes` — browse and filter recipes by category
- `/recipe/:id` — recipe details
- `/favorites` — saved favourites
- `/create-recipe` — add a custom recipe with a YouTube link

## Where data is saved

- Favorites: browser `localStorage`. They stay in the same browser on the same computer.
- Custom recipes: `server/recipes.json`. This is a simple local project storage file, not a production database.
- Online recipes: fetched from TheMealDB through the Express API.

## Notes

- Internet access is needed to fetch TheMealDB recipes and load remote recipe images.
- If the page opens but recipes do not load, check that both servers are running in the terminal and that your internet connection is available.
- The create-recipe form accepts an image URL, not a file upload.
