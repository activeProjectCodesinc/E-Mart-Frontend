import axios from 'axios';
import toast from '@/utils/toast';
import baseURL from './apiBaseURL';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAllAuth,
} from './tokenService';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true, // Enables automatic HttpOnly cookie transmission
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Read access token strictly from in-memory store
    const token = config.headers?.Authorization ? null : getAccessToken();

    if (token && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single active promise to deduplicate simultaneous 401s into exactly ONE refresh request
let activeRefreshPromise = null;

/**
 * Checks whether a request URL belongs to authentication or refresh endpoints
 * to prevent infinite retry loops.
 */
export const isAuthOrRefreshUrl = (url = '') => {
  if (!url) return false;
  return (
    /\/auth\/(login|admin\/login|refresh|admin\/refresh|token\/refresh|logout|admin\/2fa|password)/i.test(url) ||
    url.includes('/auth/login') ||
    url.includes('/auth/admin/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/admin/refresh') ||
    url.includes('/auth/token/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/admin/2fa')
  );
};

/**
 * Performs a single token refresh call.
 * If multiple requests trigger this simultaneously, all of them receive
 * and await the exact same activeRefreshPromise.
 */
export const refreshAccessToken = async () => {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    const endpoints = [
      apiRoutes.auth.refresh || '/auth/refresh',
      '/auth/admin/refresh',
      '/auth/token/refresh',
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          url: `${baseURL}${endpoint}`,
          method: 'POST',
          withCredentials: true,
          data: refreshToken ? { refreshToken } : {},
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        const resData = response.data;
        const newAccessToken =
          resData?.data?.accessToken ||
          resData?.data?.tokens?.accessToken ||
          resData?.accessToken ||
          resData?.tokens?.accessToken;

        const newRefreshToken =
          resData?.data?.refreshToken ||
          resData?.data?.tokens?.refreshToken ||
          resData?.refreshToken ||
          resData?.tokens?.refreshToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          return newAccessToken;
        }
      } catch (err) {
        lastError = err;
        // If refresh token is invalid/expired (401/403), stop trying other endpoints
        if (err.response?.status === 401 || err.response?.status === 403) {
          break;
        }
      }
    }

    throw lastError || new Error('Token refresh failed');
  })().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Protect login and refresh endpoints from infinite retry loops
    // 2. Only intercept 401 errors that haven't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthOrRefreshUrl(originalRequest.url)
    ) {
      // Mark request as retried so it can NEVER enter an infinite loop
      originalRequest._retry = true;

      try {
        // Multiple simultaneous 401s will await the EXACT same in-flight refresh request
        const newAccessToken = await refreshAccessToken();

        // Update authorization header with fresh in-memory access token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Replay original request
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // If refresh fails: clear all auth state and redirect to login page
        clearAllAuth();
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

const handleApiError = (error) => {
  const errorMessage =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.response?.data?.Message ||
    error.response?.data?.detail ||
    error.message ||
    'Something went wrong';

  if (error.response?.status !== 401 && error.response?.status !== 403) {
    toast.error(errorMessage);
  }

  const apiError = new Error(errorMessage);
  apiError.response = error.response;
  apiError.status = error.response?.status;
  apiError.data = error.response?.data;
  throw apiError;
};

export const apiService = async (
  url,
  method = 'GET',
  body = null,
  token = null,
  isMultipart = false,
  params = null
) => {
  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!isMultipart && !(body instanceof FormData) && body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axiosInstance({
      url,
      method,
      data: body,
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const get = (url, params = null, token = null) =>
  apiService(url, 'GET', null, token, false, params);

export const post = (url, body, token = null, isMultipart = false) =>
  apiService(url, 'POST', body, token, isMultipart);

export const put = (url, body, token = null, isMultipart = false) =>
  apiService(url, 'PUT', body, token, isMultipart);

export const patch = (url, body, token = null, isMultipart = false) =>
  apiService(url, 'PATCH', body, token, isMultipart);

export const del = (url, token = null) => apiService(url, 'DELETE', null, token);
export const deleteRequest = del;

export const uploadFile = (url, formData, token = null) => {
  if (!(formData instanceof FormData)) {
    throw new Error('uploadFile requires a FormData object');
  }
  return apiService(url, 'POST', formData, token, true);
};

export const uploadFiles = uploadFile;
export const createWithMultipart = uploadFile;

export const updateWithMultipart = (url, formData, token = null) => {
  if (!(formData instanceof FormData)) {
    throw new Error('updateWithMultipart requires a FormData object');
  }
  return apiService(url, 'PUT', formData, token, true);
};

export const createFormData = (data) => {
  const formData = new FormData();
  if (!data) return formData;

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(key, item);
        } else {
          formData.append(`${key}[${index}]`, item);
        }
      });
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export const apiConfig = {
  defaultTimeout: 30000,
  uploadTimeout: 120000,
  baseURL,
};

export const apiServices = {
  get,
  post,
  put,
  patch,
  del,
  deleteRequest,
  uploadFile,
  uploadFiles,
  createWithMultipart,
  updateWithMultipart,
  createFormData,
  apiService,
  apiConfig,
  refreshAccessToken,
};

export default apiServices;