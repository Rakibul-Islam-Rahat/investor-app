import axios from "axios";
import { env } from "@/config/env";
import { tokenStore } from "./tokenStore";

export const http = axios.create({ baseURL: env.apiUrl, withCredentials: true, timeout: 15000 });

// Registered once at module load (the old useAxios re-registered on every render).
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) onUnauthorized();
    error.message = error.response?.data?.message ?? error.message;
    return Promise.reject(error);
  }
);
