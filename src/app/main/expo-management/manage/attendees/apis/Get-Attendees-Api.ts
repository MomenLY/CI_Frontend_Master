import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import axios from "app/store/axiosService";

export const getAttendeeDetailsAPI = async ({pagination = null,
  keyword = "",
  sorting = null,
  expoId,
 }) => {

  
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`keyword=${keyword}`);
  if (!pagination || pagination.pageIndex < 0) {
    getPayloads.push(`page=1`);
  } else {
    getPayloads.push(`page=${pagination.pageIndex + 1}`);
    getPayloads.push(`limit=${pagination.pageSize}`);
  }
  if (sorting && sorting.length > 0) {
    getPayloads.push(
      `sortColumn=${sorting[0].id === "Name" ? "firstName" : sorting[0].id === "Email" ? "email" : sorting[0].id}`
    );
    getPayloads.push(`sortOrder=${sorting[0].desc === false ? "asc" : "desc"}`);
  }
  try {
    if(expoId){
      const response = await axios.request({
        url: `/participant?epExpoId=${expoId}&${getPayloads.join("&")}`,
        method: "get",
      });
      return response?.data?.data;
    }
   
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};