import axios from "app/store/axiosService";
import { cacheIndex } from "./cacheIndex";

export const getRoles = async () => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  try {
    const response = await axios.request({
      url: `/role`,
      method: "get",
    });
    return response?.data?.data?.items;
  } catch (error) {
    throw error;
  }
};

export const getRoleModules = async (roleType) => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  try {
    const response = await axios.request({
      url: `/role/modules`,
      method: "get",
      params: { roleType }
    });
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
}

export const getSettings = async () => {
  try {
    const response = await axios.get('/layout', {});
    const data = await response?.data?.data;
    if (data) {
      return data;
    } else {
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return error;
  }
};

export const getUserSession = async () => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  const roleId = localStorage.getItem(cacheIndex.userRoleId);
  try {
    const response = await axios.request({
      url: `/users/session`,
      method: "get",
      ... ((roleId !== null) ? { params: { roleId: roleId } } : {})
    });
    let _return = response?.data?.data?.users;
    // _return['roleId'] = roleId;
    return _return;
  } catch (error) {
    return error;
  }
}

export const getCountries = async () => {
  try {
    const response = await axios.request({
      url: window.location.origin + `/assets/countries.json`,
      method: 'get'
    });
    return response?.data?.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};


export const getLocales = async (backendBaseUrl: string, lng: string, ns: string) => {
  try {
    const url = new URL(`/locales/${ns}/${lng}.json`, backendBaseUrl || window.location.origin).toString();
    return await fetch(url).then(res => res.json());
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axios.request({
      url: `/users/profile`,
      method: "get",
    });
    return response?.data;
  } catch (error) {
    return error;
  }
}


export const getSingleExpoAPI = async (id) => {
  try {
    const response = await axios.request({
      url: `/expo/${id}`,
      method: 'get'
    });
    return response?.data;
  } catch (error) {
    throw error;
  }
};

