import axios from 'app/store/axiosService';

export const AddExpoAPI = async (data) => {
    const token = localStorage.getItem("jwt_access_token");
    const { expName, expStartDate, expEndDate, expType, expDescription, expLayoutId, expRegistrationStartDate, expRegistrationEndDate } = data;
    const response = await axios.request({
        url: `/expo/bulk-create`,
        method: 'post',
        data:{
            expos:[{
                expName,
                expStartDate,
                expEndDate,
                expDescription,
                expType,
                expLayoutId,
                expRegistrationStartDate,
                expRegistrationEndDate    
            }]
        } 
    });
    return response?.data
};

