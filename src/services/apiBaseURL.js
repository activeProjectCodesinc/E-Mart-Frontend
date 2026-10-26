export const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api/v1'
    : 'https://jacob-aftermost-shaina.ngrok-free.dev/api/v1');

export default baseURL;
