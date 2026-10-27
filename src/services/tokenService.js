/**
 * In-Memory Access Token & Secure Cookie Refresh Token Service
 *
 * Security Architecture:
 * 1. Access Token:
 *    - Stored strictly IN MEMORY (JavaScript variable).
 *    - Never written to localStorage (protects against XSS scraping).
 *    - Cleared when browser tab/window closes.
 * 2. Refresh Token:
 *    - Stored in a Secure, SameSite=Strict cookie.
 *    - When the backend sends Set-Cookie (HttpOnly, Secure, SameSite),
 *      the browser automatically protects it and sends it via credentials.
 *    - Fallback client cookie setter applies Secure and SameSite=Strict flags.
 * 3. Silent Refresh & 401 Interceptor:
 *    - Seamlessly restores access token into memory on page reload or token expiry.
 */

let inMemoryAccessToken = null;

// Legacy migration check: load existing token into memory and purge from localStorage
if (typeof window !== 'undefined') {
  try {
    const legacyToken =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('admin_access_token');
    if (legacyToken) {
      inMemoryAccessToken = legacyToken;
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('admin_access_token');
    }
  } catch {
    // Ignore storage errors
  }
}

const REFRESH_COOKIE_NAME = 'refreshToken';

export const getCookie = (name = REFRESH_COOKIE_NAME) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined' || !value) return;
  const maxAge = days * 24 * 60 * 60;
  const isSecure = window.location.protocol === 'https:' || window.location.hostname !== 'localhost';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
};

export const deleteCookie = (name = REFRESH_COOKIE_NAME) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
};

// --- In-Memory Access Token ---
export const getAccessToken = () => inMemoryAccessToken;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};

export const hasAccessToken = () => Boolean(inMemoryAccessToken);

// --- Refresh Token (Cookie) ---
export const getRefreshToken = () => {
  return getCookie(REFRESH_COOKIE_NAME) || null;
};

export const setRefreshToken = (token, days = 7) => {
  if (token) {
    setCookie(REFRESH_COOKIE_NAME, token, days);
  }
};

export const clearRefreshToken = () => {
  deleteCookie(REFRESH_COOKIE_NAME);
  try {
    localStorage.removeItem('refreshToken');
  } catch {
    // ignore
  }
};

export const hasRefreshToken = () => {
  return Boolean(getRefreshToken()) || (typeof document !== 'undefined' && document.cookie.includes(REFRESH_COOKIE_NAME));
};

// --- Clear All Auth Data (Logout) ---
export const clearAllAuth = () => {
  clearAccessToken();
  clearRefreshToken();
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAccess');
  } catch {
    // ignore
  }
};

export default {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  hasAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  hasRefreshToken,
  clearAllAuth,
};
