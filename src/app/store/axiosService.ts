import axios from "axios";

//use VITE for naming env file
let baseUrl = import.meta.env.VITE_DB_URL;

const axiosClient = axios.create({
  baseURL: baseUrl, // Base URL for API requests
  timeout: 5000, // Request timeout in milliseconds
  headers: {
    "Content-Type": "application/json", // Set default content type
    "x-tenant-id": 'dell',
    // "context":'admin'
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // You can modify request config here, such as adding tokens or headers\
    let token = localStorage.getItem("jwt_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    let tenantId = localStorage.getItem("tenant_id");
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }
    return config;
  },
  (error) => {
    // Handle request error
    // console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // You can modify response data here
    return response;
  },
  (error) => {
    // Handle response error
    // console.error("Response Interceptor Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
