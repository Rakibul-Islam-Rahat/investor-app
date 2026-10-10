export const env = {
  apiUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",
  // Mock mode runs the UI end-to-end without a backend. Set VITE_USE_MOCK=false when the API is ready.
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
};
