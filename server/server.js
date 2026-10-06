import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";

const app = express();

const PORT = 5000;

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const dataFile = path.join(
  __dirname,
  "recipes.json"
);

const MEALDB =
  "https://www.themealdb.com/api/json/v1/1";

app.use(cors());

app.use(express.json());

function readCustomRecipes() {
  try {
    return JSON.parse(
      fs.readFileSync(
        dataFile,
        "utf8"
      )
    );
  } catch {
    return [];
  }
}

function writeCustomRecipes(
  recipes
) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(
      recipes,
      null,
      2
    )
  );
}

app.get(
  "/api/categories",
  async (_req, res) => {
    try {
      const response =
        await axios.get(
          `${MEALDB}/list.php?c=list`
        );

      res.json(
        response.data.meals || []
      );
    } catch {
      res.status(502).json({
        message:
          "Could not load categories from TheMealDB.",
      });
    }
  }
);

app.get(
  "/api/recipes",
  async (req, res) => {
    try {
      const category =
        req.query.category;

      let meals = [];

      if (category) {
        const response =
          await axios.get(
            `${MEALDB}/filter.php?c=${encodeURIComponent(
              category
            )}`
          );

        meals =
          response.data.meals || [];
      } else {
        // TheMealDB's search endpoint gives
        // a useful selection for the home page.
        const searches = [
          "chicken",
          "pasta",
          "beef",
        ];

        const responses =
          await Promise.all(
            searches.map(
              (term) =>
                axios.get(
                  `${MEALDB}/search.php?s=${term}`
                )
            )
          );

        const unique =
          new Map();

        responses.forEach(
          (response) => {
            (
              response.data
                .meals || []
            ).forEach(
              (meal) =>
                unique.set(
                  meal.idMeal,
                  meal
                )
            );
          }
        );

        meals = [
          ...unique.values(),
        ];
      }

      const custom =
        readCustomRecipes().map(
          (recipe) => ({
            id: recipe.id,
            name: recipe.name,
            category:
              recipe.category,
            cuisine:
              recipe.cuisine,
            image:
              recipe.image,
            ingredients:
              recipe.ingredients,
            instructions:
              recipe.instructions,
            youtube:
              recipe.youtube,
          })
        );

      if (category) {
        res.json([
          ...meals,
          ...custom.filter(
            (recipe) =>
              recipe.category ===
              category
          ),
        ]);
      } else {
        res.json([
          ...custom,
          ...meals,
        ]);
      }
    } catch {
      res.status(502).json({
        message:
          "Could not load recipes from TheMealDB. Check your internet connection.",
      });
    }
  }
);

app.get(
  "/api/recipes/:id",
  async (req, res) => {
    const custom =
      readCustomRecipes().find(
        (recipe) =>
          String(recipe.id) ===
          String(req.params.id)
      );

    if (custom) {
      return res.json(custom);
    }

    try {
      const response =
        await axios.get(
          `${MEALDB}/lookup.php?i=${encodeURIComponent(
            req.params.id
          )}`
        );

      const meal =
        response.data.meals?.[0];

      if (!meal) {
        return res.status(404).json({
          message:
            "Recipe not found.",
        });
      }

      res.json(meal);
    } catch {
      res.status(502).json({
        message:
          "Could not load this recipe from TheMealDB.",
      });
    }
  }
);

app.post(
  "/api/recipes",
  (req, res) => {
    const {
      name,
      category,
      cuisine,
      image,
      ingredients,
      instructions,
      youtube,
    } = req.body;

    if (
      !name?.trim() ||
      !Array.isArray(
        ingredients
      ) ||
      !ingredients.length ||
      !instructions?.trim()
    ) {
      return res.status(400).json({
        message:
          "Name, ingredients, and instructions are required.",
      });
    }

    const recipes =
      readCustomRecipes();

    const recipe = {
      id: `custom-${Date.now()}`,

      name: name.trim(),

      category:
        category || "Other",

      cuisine:
        cuisine || "",

      image:
        image || "",

      ingredients,

      instructions:
        instructions.trim(),

      youtube:
        youtube || "",
    };

    recipes.unshift(recipe);

    writeCustomRecipes(
      recipes
    );

    res.status(201).json(
      recipe
    );
  }
);

/* ---------------- DELETE CUSTOM RECIPE ---------------- */

app.delete(
  "/api/recipes/:id",
  (req, res) => {
    try {
      const recipes =
        readCustomRecipes();

      const recipeIndex =
        recipes.findIndex(
          (recipe) =>
            String(recipe.id) ===
            String(req.params.id)
        );

      if (recipeIndex === -1) {
        return res.status(404).json({
          message:
            "Custom recipe not found.",
        });
      }

      const deletedRecipe =
        recipes.splice(
          recipeIndex,
          1
        )[0];

      writeCustomRecipes(
        recipes
      );

      res.json({
        message:
          "Recipe deleted successfully.",
        recipe:
          deletedRecipe,
      });
    } catch {
      res.status(500).json({
        message:
          "Could not delete the recipe.",
      });
    }
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `Recipe Explorer API running at http://localhost:${PORT}`
    );
  }
);