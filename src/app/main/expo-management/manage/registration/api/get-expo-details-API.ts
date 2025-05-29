import axios from "app/store/axiosService";
import { getExpo } from "../../hall-management/apis/ExpoIdFinder";

export const getExpoById = async (expoID) => {
  try {
    const response = await axios.request({
      url: `/expo/${expoID}`,
      method: "get",
    });
    return response?.data;
  } catch (error) {
    console.error(error);
  }
};
