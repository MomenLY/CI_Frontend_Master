import axios from "app/store/axiosService";

let headers = import.meta.env.VITE_DEFAULT_TENANT_ID
  ? { "x-tenant-id": import.meta.env.VITE_DEFAULT_TENANT_ID }
  : {};

export const getAllEvents = async (
  keyword?: string,
  currentPage?: number,
  pageSize?: number,
  status?: string
) => {
  const getPayloads = [];
  if (keyword) {
    getPayloads.push(`keyword=${keyword}`);
  }
  if(currentPage){
    getPayloads.push(`page=${currentPage}`);
  }
  if(pageSize){
    getPayloads.push(`limit=${pageSize}`);
  }
  try {
    const response = await axios.request({
      url: `/expo?status=${status}&${getPayloads.join('&')}`,
      method: "get",
      headers: {
        ...headers,
      },
    });
    return response?.data?.data
  } catch (error) {
    throw error;
  }
};


export const getRegisteredEvents = async (
  keyword?: string,
  currentPage?: number,
  pageSize?: number,
  status?: string
) => {
  const getPayloads = [];
  if (keyword) {
    getPayloads.push(`keyword=${keyword}`);
  }
  if(currentPage){
    getPayloads.push(`page=${currentPage}`);
  }
  if(pageSize){
    getPayloads.push(`limit=${pageSize}`);
  }
  try {
    const response = await axios.request({
      url: `/registered-events?${getPayloads.join('&')}`,
      method: "get",
      headers: {
        ...headers,
      },
    });
    return response?.data?.data
  } catch (error) {
    throw error;
  }
}
