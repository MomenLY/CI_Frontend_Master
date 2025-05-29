import axios from 'app/store/axiosService';


export const checkExpoRegistrationStatus = async (expoCode: string): Promise<any> => {
    try {
      const { data } = await axios.get(`/participant/check-registration/${expoCode}`);
      return data?.data;
    } catch (error) {
      console.error(`Error fetching registration status for expoCode: ${expoCode}`, error);
      throw error;
    }
};
  