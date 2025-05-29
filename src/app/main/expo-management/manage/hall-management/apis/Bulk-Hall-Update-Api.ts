import axios from "app/store/axiosService";


export const BulkHallUpdateAPI = async (data: any) => {


  try {
    const res = await axios.request({
      url: `/hall/bulk-update`,
      method: "patch",
      data: {
        halls: [
          {
            id: data?.data?.id,
            hallName: data?.data?.hallName,
            hallDescription: data?.data?.hallDescription,
            hallExpoId: data?.data?.hallExpoId,
          },
        ],
      },
    });
    
    return res;
  } catch (e) {
    console.error(e);
  }
};