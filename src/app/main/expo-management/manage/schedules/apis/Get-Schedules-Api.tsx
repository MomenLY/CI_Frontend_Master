import axios from "app/store/axiosService";

export const getScheduleDetailsAPI = async ({pagination, keyword, sorting, expoId}) => {
  const token = localStorage.getItem('jwt_access_token');
  
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`keyword=${keyword}`);
  if (!pagination || pagination.pageIndex <= 0) {
    getPayloads.push(`page=1`);
  } else {
    getPayloads.push(`page=${pagination.pageIndex + 1}`);
    getPayloads.push(`limit=${pagination.pageSize}`);
  }
  if (sorting && sorting.length > 0) {
    getPayloads.push(
      `sortColumn=${sorting[0].id === "name" ? "firstName" : sorting[0].id}`
    );
    getPayloads.push(`sortOrder=${sorting[0].desc === false ? "ASC" : "DESC"}`);
  }
  try {
    const response = await axios.request({
      url: `/schedule?schExpoId=${expoId}&${getPayloads.join('&')}`,
      method: "get",
    });
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
};  
