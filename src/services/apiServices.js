import axios from 'axios';
import toast from '@/utils/toast';
import baseURL from './apiBaseURL';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      config.headers?.Authorization ||
      localStorage.getItem('admin_access_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken');

    if (token && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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
};

export default apiServices;