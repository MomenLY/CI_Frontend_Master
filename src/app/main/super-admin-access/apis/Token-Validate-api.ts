import axios from "app/store/axiosService";

export const TokenValidateAPI = async (tokenData) => {

    try {
        const response = await axios.request({
            url: `/users/tokenVerify`,
            method: "post",
            data: {
                tokenData
            }
        });
        return response?.data
    } catch (error) {
        throw error;
    }
};
