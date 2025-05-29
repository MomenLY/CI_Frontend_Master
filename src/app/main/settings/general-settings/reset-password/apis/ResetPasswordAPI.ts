import axios from 'app/store/axiosService';

export const ResetPasswordWithExistingPassword = async (id, data) => {
    try {
        const response = await axios.request({
            url: `/users/resetPassword/${id}`,
            method: 'post',
            data: data
        });

        if (response.data.data.success) {
            return { success: true, data: response.data };
        }

    } catch (e) {
        const errorMessage = e.response?.data?.message || "An unexpected error occurred";
        return { success: false, message: errorMessage };
    }
};