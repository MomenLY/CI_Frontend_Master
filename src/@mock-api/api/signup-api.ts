import axios from "app/store/axiosService";

let headers =(import.meta.env.VITE_DEFAULT_TENANT_ID) ? {'x-tenant-id':import.meta.env.VITE_DEFAULT_TENANT_ID} : {};
export const getSignupAPI = ({data, customHeaders = headers }) => {

  return axios.request({
    url: `/users`,
    method: "post",
    data:data,
    headers: {
      ...customHeaders,
    }
  });
};