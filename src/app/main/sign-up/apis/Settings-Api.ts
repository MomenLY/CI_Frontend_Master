import axios from 'app/store/axiosService';

export const SettingsApi = async ({ settingsKey }) => {

    try {
        const response = await axios.get(`/settings/single?key=${settingsKey}`, {});
        const data = await response?.data?.data?.settings
        if (data) {
            return data;
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
};
