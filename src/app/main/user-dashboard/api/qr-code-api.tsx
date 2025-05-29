import axios from "app/store/axiosService";

export const QrCodeAPI = async ({data}: any) => {
  const response = await axios.request({
    url: `/qr-code`,
    method: "post",
    data: {
      payload: data,
    },
  });
  return response?.data;
};
