import axios from "app/store/axiosService";

export const sendBoothManagerNotification = async ( expoCode ) => {
    
    try {
        const response = await axios.request({
            url: `/notify/boothManager?expoCode=${expoCode}`,
            method: "post",
        });
        return response;
    } catch (error) {
        throw error;
    }
};
