import axios from "app/store/axiosService";


export const getUserDetailsAPIWithSearch = async ({ pagination, keyword, sorting }) => {
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`search=${keyword}`);
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortBy=${sorting[0].id}`);
    getPayloads.push(`orderBy=${(sorting[0].desc === false ? "asc" : "desc")}`);
  }
  try {
    const response = await axios.request({
      url: `/role/users?${getPayloads.join('&')}`,
      method: "get",
    });
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
}
