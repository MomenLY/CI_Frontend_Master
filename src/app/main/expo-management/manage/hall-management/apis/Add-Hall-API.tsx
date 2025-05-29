import axios from "app/store/axiosService";
import { getExpo } from "./ExpoIdFinder";

export const AddHallAPI = async (data, id ) => {
  const { hallName, description } = data;
  const expoID = await getExpo(id);

  return axios.request({
    url: `/hall/bulk-create`,
    method: "post",
    data: {
      halls: [
        {
          hallExpoId: expoID?.data?.expo.id,
          hallName,
          hallDescription: description,
        },
      ],
    },
  });
};