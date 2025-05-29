import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import axios from "app/store/axiosService";
import { useParams } from "react-router";
import LocalCache from "src/utils/localCache";

export const getBoothReportAPI = async ({pagination = null,
  keyword = "",
  sorting = null,
  expoDetail,
  routeParams
 }) => {
  // const routeParams = useParams();
    let expoDetails = await LocalCache.getItem(
        cacheIndex.expoDetails + "_" + routeParams.id,
        getSingleExpoAPI.bind(this, routeParams.id)
    );
    // setExpoDetails(expoDetails);
 let expoCode = expoDetails?.data?.expo?.expCode;
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
    if(routeParams.id){
 
      
      const response = await axios.request({
        url: `/booth-analytics?expoId=${routeParams.id}&${getPayloads.join("&")}`,
        method: "get",
      });
      return response?.data?.data;
    }
   
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};