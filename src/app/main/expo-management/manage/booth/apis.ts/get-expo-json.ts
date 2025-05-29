import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import axios from 'app/store/axiosService';
import LocalCache from 'src/utils/localCache';

export const getExpoJson = async (expoId: string) => {
    try {
      const response = await axios.request({
        url: `/generate-expo-json/${expoId}`,
        method: 'get',
      });
  
      const responseData = response?.data?.data;
      if (responseData?.success === false) {
        throw new Error('No json found');
      }
      
      return responseData;
    } catch (error) {
      throw error;
    }
  };
