import axios from "app/store/axiosService";

export const getSignupAPI = ({data}) => {

  return axios.request({
    url: `/users`,
    method: "post",
    data:data
  });
};