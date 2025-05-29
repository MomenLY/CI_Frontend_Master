import { useQuery } from 'react-query';
import axios from 'axios';

const fetchUserData = async () => {
  const { data } = await axios.get('/auth/user');
  return data;
};

export const useUserData = () => {
  return useQuery('userData', fetchUserData);
};
