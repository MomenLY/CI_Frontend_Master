import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import axios from "app/store/axiosService";

export const getAttendeeCountAPI = async (expoId) => {


    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }

    try {
        if (expoId) {
            const response = await axios.request({
                url: `participant/get-all-counts/${expoId}`,
                method: "get",
            });
            return response?.data?.data;
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};