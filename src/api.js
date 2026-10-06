import axios from "axios";

const API = "http://localhost:5000/api";

export async function getCategories() {
  const response = await axios.get(`${API}/categories`);
  return response.data;
}

export async function getRecipes(category = "") {
  const url = category
    ? `${API}/recipes?category=${encodeURIComponent(category)}`
    : `${API}/recipes`;
  const response = await axios.get(url);
  return response.data;
}

export async function getRecipe(id) {
  const response = await axios.get(`${API}/recipes/${id}`);
  return response.data;
}

export async function createRecipe(recipe) {
  const response = await axios.post(`${API}/recipes`, recipe);
  return response.data;
}