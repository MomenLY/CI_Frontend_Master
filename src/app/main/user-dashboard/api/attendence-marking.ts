import axios from "app/store/axiosService";

export const markAttendance = async (data) => {
    try {
      const response = await axios.request({
        url: `/participant/join-mark-attendance`,
        method: "post",
        data: data,
      });
      return response?.data;
    } catch (error) {
      throw error;
    }
  };