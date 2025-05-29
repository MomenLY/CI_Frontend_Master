import axios from "app/store/axiosService";

export const generateExcelReport = async (headers, epExpoId, customFieldUrl) => {  
  const response = await axios.request({
    url: `/export/generate?epExpoId=${epExpoId}`,
    method: "post",
    responseType: 'blob',
    data: {
      tableHeaders: headers,
      customFieldUrl
    },
  });
  return response;
};
