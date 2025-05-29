import axios from "app/store/axiosService";

export const getOrderDetails = async (orderId) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    try {
        const response = await axios.request({
            url: `/order/orderId?orderId=${orderId}`,
            method: "get",
        });
        return response?.data?.data;
    } catch (error) {
        throw error;
    }
};
