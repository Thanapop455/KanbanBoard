import axios from "axios";

export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");
export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});
