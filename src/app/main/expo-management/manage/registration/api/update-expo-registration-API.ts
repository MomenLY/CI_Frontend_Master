import axios from "app/store/axiosService";
import { getExpo } from "../../hall-management/apis/ExpoIdFinder";

export const updateExpoRegistrationSettings = async (data, expoID) => {
  const expoDetails = await getExpo(expoID);
  const timeConverter = (localTime) => {
    const date = new Date(localTime);
    const standardDate = date.toISOString();
    return standardDate;
  };

  const formattedData = {
    id: expoDetails?.data?.expo?.id,
    expCode: expoDetails?.data?.expo?.expCode,
    expStartDate: expoDetails?.data?.expo?.expStartDate,
    expEndDate: expoDetails?.data?.expo?.expEndDate,
    expDescription: expoDetails?.data?.expo?.expDescription,
    expIsRegistrationEnabled: data?.expIsRegistrationEnabled,
    expIsSeatsUnlimited: data?.expIsSeatsUnlimited,
    expMinSeats: data?.expMinSeats,
    expMaxSeats: data?.expMaxSeats,
    expRegistrationStartType: data?.expRegistrationStartType,
    expRegistrationStartDate: timeConverter(data?.expRegistrationStartDate),
    expRegistrationStartBefore: data?.expRegistrationStartBefore,
    expRegistrationEndType: data?.expRegistrationEndType,
    expRegistrationEndDate: timeConverter(data?.expRegistrationEndDate),
    expRegistrationEndBefore: data?.expRegistrationEndBefore,
  };

  try {
    const res = await axios.request({
      url: "/expo/bulk-update",
      method: "patch",
      data: {
        expos: [formattedData],
      },
    });

    return res.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
