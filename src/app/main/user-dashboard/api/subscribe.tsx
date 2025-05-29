import axios from 'app/store/axiosService';

export const subscribe = async (data) => {
    const token = localStorage.getItem("jwt_access_token");
    const { epUserId, epExpoId, epUserDetails, epOrderid } = data;
    const response = await axios.request({
        url: `/participant/bulk-create`,
        method: 'post',
        data:{
            participants:[{
                epUserId,
                epExpoId,
                epUserDetails,
                epOrderid
            }]
        } 
    });
    return response?.data
};

