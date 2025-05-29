import axios from "app/store/axiosService";

export const updateStatus = async (id: string, status: string) => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }
  try {
    const response = await axios.request({
      url: `/users/${id}`,
      method: "patch",
      data: {
        status
      }
    });


    return response?.data;
  } catch (error) {
    throw error;
  }
};

export const updateDefaultPassword = async (id: string, password: string,shouldSendEmail:boolean) => {
  const token = localStorage.getItem("jwt_access_token");
  if (!token) {
    return false;
  }

  try {
    const response = await axios.request({
      url: `/users/reset/password`,
      method: "post",
      data: {
        _id: id,
        password: password,
        shouldSendEmail
      }
    });


    return response?.data;
  } catch (error) {
    throw error;
  }
};
