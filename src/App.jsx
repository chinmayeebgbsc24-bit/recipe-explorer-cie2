import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { createRecipe, getCategories, getRecipe, getRecipes } from "./api";

const FAVORITES_KEY = "recipe-explorer-favorites";

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">🍲 Recipe Explorer</Link>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/recipes">Recipes</NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
        <NavLink to="/create-recipe">Create Recipe</NavLink>
      </nav>
    </header>
  );
}

function RecipeCard({ recipe, isFavorite, onToggleFavorite }) {
  return (
    <article className="recipe-card">
      <Link to={`/recipe/${recipe.idMeal || recipe.id}`} className="card-image-link">
        <img
          src={recipe.strMealThumb || recipe.image || "https://placehold.co/600x400?text=Recipe"}
          alt={recipe.strMeal || recipe.name}
          className="recipe-image"
        />
      </Link>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{recipe.strMeal || recipe.name}</h3>
          <button
            className={`heart-button ${isFavorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(recipe)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>
        <p className="muted">{recipe.strCategory || recipe.category || "Custom recipe"}{recipe.strArea || recipe.cuisine ? ` · ${recipe.strArea || recipe.cuisine}` : ""}</p>
        <Link className="text-link" to={`/recipe/${recipe.idMeal || recipe.id}`}>View recipe →</Link>
      </div>
    </article>
  );
}

function RecipeGrid({ recipes, favorites, onToggleFavorite }) {
  if (!recipes.length) return <p className="empty-state">No recipes found. Try another category or add your own recipe.</p>;
  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => {
        const id = String(recipe.idMeal || recipe.id);
        return (
          <RecipeCard
            key={id}
            recipe={recipe}
            isFavorite={favorites.some((item) => String(item.idMeal || item.id) === id)}
            onToggleFavorite={onToggleFavorite}
          />
        );
      })}
    </div>
  );
}

function Home({ recipes, favorites, onToggleFavorite }) {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">FIND YOUR NEXT FAVOURITE</span>
          <h1>Good food starts<br />with a little inspiration.</h1>
          <p>Explore recipes from around the world, save the ones you love, and add your own kitchen creations.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/recipes">Explore recipes</Link>
            <Link className="button secondary" to="/create-recipe">Add a recipe</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">🥗</div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">START HERE</span><h2>Recipes to explore</h2></div>
          <Link className="text-link" to="/recipes">See all recipes →</Link>
        </div>
        <RecipeGrid recipes={recipes.slice(0, 6)} favorites={favorites} onToggleFavorite={onToggleFavorite} />
      </section>
    </>
  );
}

function Recipes({ categories, favorites, onToggleFavorite }) {
  const [category, setCategory] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getRecipes(category)
      .then(setRecipes)
      .catch(() => setError("Could not load recipes. Make sure the Express server is running and you have internet access."))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="section page-section">
      <div className="section-heading">
        <div><span className="eyebrow">THE RECIPE COLLECTION</span><h1>Explore recipes</h1></div>
        <label className="filter-label">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item.strCategory} value={item.strCategory}>{item.strCategory}</option>)}
          </select>
        </label>
      </div>
      {loading ? <p className="notice">Loading delicious ideas…</p> : error ? <p className="error">{error}</p> :
        <RecipeGrid recipes={recipes} favorites={favorites} onToggleFavorite={onToggleFavorite} />}
    </section>
  );
}

function RecipeDetails({ favorites, onToggleFavorite, customRecipes }) {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const custom = customRecipes.find((item) => String(item.id) === String(id));
    if (custom) {
      setRecipe(custom);
      setLoading(false);
      return;
    }
    setLoading(true);
    getRecipe(id)
      .then(setRecipe)
      .catch(() => setError("This recipe could not be loaded. Please go back and choose another recipe."))
      .finally(() => setLoading(false));
  }, [id, customRecipes]);

  if (loading) return <p className="notice page-section">Loading recipe…</p>;
  if (error || !recipe) return <p className="error page-section">{error || "Recipe not found."}</p>;

  const isCustom = Boolean(recipe.name);
  const title = recipe.strMeal || recipe.name;
  const image = recipe.strMealThumb || recipe.image;
  const category = recipe.strCategory || recipe.category || "Custom recipe";
  const cuisine = recipe.strArea || recipe.cuisine || "";
  const ingredients = isCustom ? recipe.ingredients : Object.keys(recipe)
    .filter((key) => key.startsWith("strIngredient") && recipe[key]?.trim())
    .map((key) => `${recipe[key]} — ${recipe[`strMeasure${key.replace("strIngredient", "")}`] || ""}`.trim());
  const instructions = recipe.strInstructions || recipe.instructions;
  const video = recipe.strYoutube || recipe.youtube;

  return (
    <section className="section detail-layout page-section">
      <img className="detail-image" src={image || "https://placehold.co/800x600?text=Recipe"} alt={title} />
      <div className="detail-content">
        <span className="eyebrow">{category}{cuisine ? ` · ${cuisine}` : ""}</span>
        <h1>{title}</h1>
        <button className="button secondary favorite-detail" onClick={() => onToggleFavorite(recipe)}>
          {favorites.some((item) => String(item.idMeal || item.id) === String(recipe.idMeal || recipe.id)) ? "♥ Saved to favorites" : "♡ Add to favorites"}
        </button>
        <h2>Ingredients</h2>
        <ul className="ingredients-list">{(ingredients || []).map((ingredient, index) => <li key={index}>{ingredient}</li>)}</ul>
        <h2>Instructions</h2>
        <p className="instructions">{instructions || "No instructions were added."}</p>
        {video && <a className="button primary video-button" href={video} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>}
      </div>
    </section>
  );
}

function Favorites({ favorites, onToggleFavorite }) {
  return (
    <section className="section page-section">
      <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
      <h1>Favourite recipes</h1>
      <p className="muted">Favorites are saved in this browser using localStorage.</p>
      <RecipeGrid recipes={favorites} favorites={favorites} onToggleFavorite={onToggleFavorite} />
    </section>
  );
}

function CreateRecipe({ onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", category: "Other", cuisine: "", image: "", ingredients: "", instructions: "", youtube: ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const recipe = await createRecipe({
        ...form,
        ingredients: form.ingredients.split("\n").map((item) => item.trim()).filter(Boolean)
      });
      onCreated(recipe);
      navigate(`/recipe/${recipe.id}`);
    } catch {
      setError("Could not save your recipe. Check that the Express server is running.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section page-section form-page">
      <span className="eyebrow">FROM YOUR KITCHEN</span>
      <h1>Create a recipe</h1>
      <p className="muted">Add your own recipe. It will be saved by the local Express server in <code>server/recipes.json</code>.</p>
      <form className="recipe-form" onSubmit={submit}>
        <label>Recipe name *<input name="name" value={form.name} onChange={update} required placeholder="e.g. Creamy tomato pasta" /></label>
        <div className="form-row">
          <label>Category
            <select name="category" value={form.category} onChange={update}>
              {["Other", "Breakfast", "Starter", "Side", "Vegetarian", "Vegan", "Dessert", "Pasta", "Seafood", "Chicken", "Beef"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>Cuisine<input name="cuisine" value={form.cuisine} onChange={update} placeholder="e.g. Italian" /></label>
        </div>
        <label>Image URL<input name="image" type="url" value={form.image} onChange={update} placeholder="https://..." /></label>
        <label>Ingredients * <span className="field-help">Put one ingredient on each line.</span>
          <textarea name="ingredients" value={form.ingredients} onChange={update} required rows="5" placeholder={"200 g pasta\n2 tomatoes\n1 tbsp olive oil"} />
        </label>
        <label>Instructions *<textarea name="instructions" value={form.instructions} onChange={update} required rows="6" placeholder="Write the steps to make your recipe…" /></label>
        <label>YouTube video link<input name="youtube" type="url" value={form.youtube} onChange={update} placeholder="https://youtube.com/..." /></label>
        {error && <p className="error">{error}</p>}
        <button className="button primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save recipe"}</button>
      </form>
    </section>
  );
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [homeRecipes, setHomeRecipes] = useState([]);
  const [favorites, setFavorites] = useState(readFavorites);
  const [customRecipes, setCustomRecipes] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getRecipes().then(setHomeRecipes).catch(() => {});
  }, []);

  useEffect(() => saveFavorites(favorites), [favorites]);

  function toggleFavorite(recipe) {
    const id = String(recipe.idMeal || recipe.id);
    const exists = favorites.some((item) => String(item.idMeal || item.id) === id);
    setFavorites(exists
      ? favorites.filter((item) => String(item.idMeal || item.id) !== id)
      : [...favorites, recipe]);
  }

  function rememberCreatedRecipe(recipe) {
    setCustomRecipes((current) => [recipe, ...current.filter((item) => item.id !== recipe.id)]);
    setHomeRecipes((current) => [recipe, ...current.filter((item) => item.id !== recipe.id)]);
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home recipes={homeRecipes} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/recipes" element={<Recipes categories={categories} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/recipe/:id" element={<RecipeDetails favorites={favorites} onToggleFavorite={toggleFavorite} customRecipes={customRecipes} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/create-recipe" element={<CreateRecipe onCreated={rememberCreatedRecipe} />} />
          <Route path="*" element={<section className="section page-section"><h1>Page not found</h1><Link className="text-link" to="/">Return home →</Link></section>} />
        </Routes>
      </main>
      <footer>Made with care, curiosity, and a little seasoning. <span>Recipe Explorer</span></footer>
    </div>
  );
}