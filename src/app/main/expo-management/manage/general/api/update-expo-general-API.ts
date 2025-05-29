import axios from "app/store/axiosService";
import { getExpo } from "../../hall-management/apis/ExpoIdFinder";

export const updateExpoGeneralSettings = async (data, expoID) => {
  const expoDetails = await getExpo(expoID);
  const formattedData = {
    id: expoDetails?.data?.expo?.id,
    expStartDate: expoDetails?.data?.expo?.expStartDate,
    expEndDate: expoDetails?.data?.expo?.expEndDate,
    expDescription: expoDetails?.data?.expo?.expDescription,
    expType: data?.expType,
    expExpoMode: data?.expExpoMode,
    expVenue: data?.expVenue,
    expAddress: data?.expAddress,
    expIsPaid: data?.expIsPaid,
    expPrice: data?.expIsPaid ? data?.expPrice : 0,
    expCode: data?.expCode,
    expImage: data?.expImage,
    expBanerImage: data?.expBanerImage,
    expTermsConditionIsEnabled: data?.expTermsConditionIsEnabled,
    expTermsAndConditions: data?.expTermsAndConditions || "",
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
