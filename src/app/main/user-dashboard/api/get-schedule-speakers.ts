import axios from 'app/store/axiosService';


export const scheduleSpeakers = async (scheduleId: string): Promise<any> => {
    try {
      const { data } = await axios.get(`/schedule/get-speakers/${scheduleId}`);
      return data?.data;
    } catch (error) {
      console.error(`Error fetching schedule speakers data`, error);
      throw error;
    }
};
  