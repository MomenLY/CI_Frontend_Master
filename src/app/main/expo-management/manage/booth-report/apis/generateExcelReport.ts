import axios from "app/store/axiosService";

export const generateExcelReport = async (keyword, epExpoId) => {  
  const response = await axios.request({
    url: `/excel/booth?expoId=${epExpoId}&keyword=${keyword}`,
    method: "post",
    responseType: 'blob',
  });
  return response;
};