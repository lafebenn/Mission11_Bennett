/** Set VITE_API_BASE_URL when building for production (Azure backend URL, no trailing slash). */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5039';
