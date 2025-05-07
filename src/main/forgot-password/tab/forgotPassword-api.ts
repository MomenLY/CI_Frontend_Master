import axios from "app/store/axiosService";

export const forgotPasswordAPI = async (data:string) => {
  try {
    const response = await axios.post("/users/password/forgot", {email:data});
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
