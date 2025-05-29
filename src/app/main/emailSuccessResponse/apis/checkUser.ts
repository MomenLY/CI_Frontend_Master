import axios from 'app/store/axiosService';

export const CheckUser = async (userToken: any) => {

    const response = await axios.request({
        url: `/users/checkUser`,
        method: 'post',
        data: {
            userToken: userToken
        }
    });
    return response?.data?.data;
};
