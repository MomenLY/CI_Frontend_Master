import axios from 'app/store/axiosService';


export const RoleSelectorAPI = async () => {

  const token = localStorage.getItem('jwt_access_token');

  if (!token) {
    return false;
  }
  try {
    const response = await axios.request({
      url: `/role`,
      method: "get",
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
};
