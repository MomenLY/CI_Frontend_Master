import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import axios from "axios";
import jwtDecode, { JwtPayload } from "jwt-decode";
import LocalCache from "src/utils/localCache";
import { tenantPrefix } from "src/utils/tenantHelper";


//use VITE for naming env file
let baseUrl = "https://" + window.location.host.replace(".enfinlabs.com", "api.enfinlabs.com");
if (location.hostname === "localhost") {
  baseUrl = import.meta.env.VITE_DB_URL;
}
if (location.hostname === "app.congressiinternazionali.it") {
  baseUrl = "https://api.congressiinternazionali.it";
}

export const TENANTS_IDS = {
  "devci.enfinlabs.com": "B7PPQRY",
  "qaci.enfinlabs.com": "ci_tenant_testing",
  "stageci.enfinlabs.com": "ci_tenant",
  "app.congressiinternazionali.it": "ABG5R31",
  "localhost": "ABG5R31"
};
const tenantId = TENANTS_IDS[location.hostname] || 'B7PPQRY'
const axiosClient = axios.create({
  baseURL: baseUrl, // Base URL for API requests
  timeout: 30000, // Request timeout in milliseconds
  maxContentLength: 50 * 1024 * 1024,
  headers: {
    "Content-Type": "application/json", // Set default content type
    "x-tenant-id": tenantId,
    // "x-tenant-id": 'ci_tenant',
    // "context":'admin'
    ...((localStorage.getItem("userRoleId")) && { "x-role-id": localStorage.getItem("userRoleId") })
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Add tokens and headers to the request config
    const token = localStorage.getItem("jwt_access_token");
    config.headers['context'] = '';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      const decode = jwtDecode<JwtPayload>(token);
      if (decode) {
        config.headers['context'] = 'admin';
      }
    }

    let tenantId = localStorage.getItem("tenant_id");
    const regex = new RegExp(`${tenantPrefix}([^/]+)`); // Create a regex with the dynamic prefix
    const isTenantIdPresentInURL = window.location.href.match(regex);
    if (isTenantIdPresentInURL) {
      tenantId = isTenantIdPresentInURL[1];
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get("t");
    if (tenantSlug) {
      tenantId = tenantSlug;
      config.headers['context'] = '';
    }

    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;

      if (config.url.includes('/settings/single')) {
        config.headers['context'] = '';
      }
    } else {
      config.headers['x-tenant-id'] = TENANTS_IDS[location.hostname];
    }

    return config;
  },
  (error) => {
    // Handle request error
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // You can modify response data here
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(cacheIndex.userRoleId);
      localStorage.removeItem("jwt_access_token");
      localStorage.removeItem("userRoleId");
      localStorage.removeItem("authService");
      localStorage.removeItem("tenant_id");
      if (cacheIndex.userProfile) {
        await LocalCache.deleteItem(cacheIndex.userProfile);
      }
      if (cacheIndex.settings) {
        await LocalCache.deleteItem(cacheIndex.settings);
      }
      if (cacheIndex.userData) {
        await LocalCache.deleteItem(cacheIndex.userData);
      }
      window.location.href = "/sign-in";
    }
    // Handle response error
    // console.error("Response Interceptor Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
