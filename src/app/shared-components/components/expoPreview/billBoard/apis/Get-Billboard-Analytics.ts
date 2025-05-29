import axios from 'app/store/axiosService';

export const GetBillboardAnalytics = async (data: any) => {
    const response = await axios.request({
        url: `/billboard-analytics`,
        method: 'post',
        data:data
    });
    return response?.data?.data;
}