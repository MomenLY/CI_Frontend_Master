import axios from "app/store/axiosService";

// export const AddHallAPI = ({ data }) => {
//   const token = localStorage.getItem("jwt_access_token");
//   const { hallName, description } = data;
//   return axios.request({
//     url: `/hall/bulk-create`,
//     method: "post",
//     data: {
//       hallExpoId:'15065117-9fac-4e09-b3a6-d9e3cdeed80d',
//       hallName,
//       description,
//     },
//   });
// };

export const AddHallAPI = ({ data }) => {
  const { hallName, description } = data;
  console.log(description,"descjrijotgi");
  
  return axios.request({
    url: `/hall/bulk-create`,
    method: "post",
    data: {
      halls: [
        {
          hallExpoId: '15065117-9fac-4e09-b3a6-d9e3cdeed80d',
          hallName,
          hallDescription: description,
          hallCreatedBy: '2b72834a-ab5c-4162-a182-d99f892e9ac8',
        }
      ]
    },
  });
};