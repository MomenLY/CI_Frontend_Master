import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import axios from 'app/store/axiosService';
import LocalCache from 'src/utils/localCache';

export const getBillboardList = async (expoId) => {
    try {
        const response = await axios.request({
            url: `/generate-expo-json/${expoId}`,
            method: 'get'
        });
        return response?.data?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
}


export const bulkUpdateBillboard = async (billboardData) => {

    try {
        const response = await axios.patch('/billboard/bulk-update', billboardData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error in bulk update:', error);
        throw error;
    }
};

export const updateBillboardById= async (billboardData) => {

    try {
        const response = await axios.patch('/billboard', billboardData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error in bulk update:', error);
        throw error;
    }
};

export const deleteBillboardById= async (billboardId) => {

    try {
        const response = await axios.delete(`/billboard/${billboardId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error in bulk update:', error);
        throw error;
    }
};

export const createBillbaordDetails= async (billboardData) => {

    try {
        const response = await axios.post('/billboard', billboardData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error in bulk update:', error);
        throw error;
    }
};