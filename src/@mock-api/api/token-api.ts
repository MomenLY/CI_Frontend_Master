import { getUserDetailsByIdAPI } from 'src/app/main/settings/general-settings/profile-settings/apis/UserAPI';
export const getUserAPI = async () => {
	return await getUserDetailsByIdAPI({ id: 0 });
};