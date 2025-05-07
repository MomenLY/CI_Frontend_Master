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
    return response?.data?.data?.users;
  } catch (error) {
    throw error;
  }
}

