import axios from "app/store/axiosService";

export const getHallDetailsAPIWithSearch = async ({
  pagination,
  keyword,
  sorting,
}) => {

  console.log(pagination.pageSize,"pagination...............");
  
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`keyword=${keyword}`);
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortColumn=hallName`);
    getPayloads.push(`sortOrder=${sorting[0].desc === false ? "ASC" : "DESC"}`);
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
