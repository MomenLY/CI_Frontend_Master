import axios from "app/store/axiosService";

export const userProfileUpdate = async ({ data }) => {
  // Extracting the first name and last name


  // date format
  const dobDate = new Date(data.formData.dob);
  const standardDate: string = dobDate.toISOString();

  try {
    const response = await axios.request({
      url: `/users/${data.formData._id}`,
      method: "patch",
      data: {
        firstName: data?.formData?.firstName,
        email: data?.formData?.email,
        dateOfBirth: standardDate,
        gender: data?.formData?.gender,
        phoneNumber: data?.formData?.phoneNumber,
        countryCode: data?.formData?.countryCode,
        country: data?.formData?.country,
        address: data?.formData?.address,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUserDetailsByIdAPI = async ({ id }) => {

  try {
    const response = await axios.request({
      url: `/users/profile`,
      method: "get",
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
};
