import axios from "app/store/axiosService";
import { getExpo } from "./ExpoIdFinder";

export const getHallDetailsAPIWithSearch = async ({
  pagination,
  keyword,
  sorting,
  expoId
}) => {
  
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  var expoID;
  if (expoID === null || expoID === undefined) {
    expoID = await getExpo(expoId);
  }

  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`keyword=${keyword}`);
  getPayloads.push(`expoId=${expoID?.data?.expo?.id}`);
  let currentSortOrder;
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortColumn=${sorting[0]?.id}`);
    if (sorting[0]?.desc === false) {
      currentSortOrder = "ASC";
    } else if (sorting[0]?.desc === true) {
      currentSortOrder = "DESC";
    }
    // } else {
    //   // If desc is undefined or null, use the opposite of the last sort order
    //   currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    // }

    getPayloads.push(`sortOrder=${currentSortOrder}`);
    // getPayloads.push(`sortOrder=${sorting[0]?.desc === false   ? "ASC" : "DESC"}`);
  }else{

    
    currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
    getPayloads.push(`sortOrder=${currentSortOrder}`);
  }

  
  try {
    const response = await axios.request({
      url: `/hall?${getPayloads.join("&")}`,
      method: "get",
    });

    return response?.data?.data;
  } catch (error) {
    throw error;
  }
};
