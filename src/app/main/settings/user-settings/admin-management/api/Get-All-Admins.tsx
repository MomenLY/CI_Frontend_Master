import axios from "app/store/axiosService";


export const getAdmins = async (keyword?: string, page: number = 1, limit: number = 9) => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }

  try {
    const response = await axios.request({
      url: `users`,
      method: "get",
      params: {
        roleType: 'admin',
        search: keyword,
        page: page,
        limit: limit,
        sortBy: 'createdAt',
        orderBy: 'desc',
      },
    });
 console.log(response.data);
 
    return response?.data;
  } catch (error) {
    throw error;
  }
};

