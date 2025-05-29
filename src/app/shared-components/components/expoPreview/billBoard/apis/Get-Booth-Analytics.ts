import axios from 'app/store/axiosService';

export const GetBoothAnalytics = async (data: any) => {
    const response = await axios.request({
        url: `/booth-analytics`,
        method: 'post',
        data:data
    });
    return response?.data?.data;
}