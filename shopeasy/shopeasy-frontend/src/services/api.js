import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => API.post("/auth/login", credentials).then((response) => response.data),
  register: (details) => API.post("/auth/register", details).then((response) => response.data),
};

export const productApi = {
  list: () => API.get("/products").then((response) => response.data),
  get: (id) => API.get(`/products/${id}`).then((response) => response.data),
  create: (product) => API.post("/products", product).then((response) => response.data),
};

export const orderApi = {
  place: (order) => API.post("/orders", order).then((response) => response.data),
  mine: () => API.get("/orders/my-orders").then((response) => response.data),
  get: (id) => API.get(`/orders/${id}`).then((response) => response.data),
  cancel: (id) => API.put(`/orders/${id}/cancel`).then((response) => response.data),
  all: () => API.get("/orders/admin/all").then((response) => response.data),
  getAdmin: (id) => API.get(`/orders/admin/${id}`).then((response) => response.data),
  updateStatus: (id, status) => API.put(`/orders/admin/${id}/status`, { status }).then((response) => response.data),
};

export function getErrorMessage(error, fallback) {
  return error.response?.data?.detail
    || error.response?.data?.message
    || error.response?.data?.error
    || fallback;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default API;
