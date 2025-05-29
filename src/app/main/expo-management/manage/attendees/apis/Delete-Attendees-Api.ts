import axios from 'app/store/axiosService';

export const AttendeeDeleteAPI = async (ids: string, expoId: string) => {
    const response = await axios.request({
        url: `/participant/bulk-delete`,
        method: 'delete',
        data: {
            ids: [ids]
        }
    });
    return response?.data;
};
