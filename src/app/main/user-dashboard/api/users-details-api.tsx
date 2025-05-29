import axios from 'app/store/axiosService';
import { defaultUserImageUrl, userImageUrl } from 'src/utils/urlHelper';

export const getUsers = async (id) => {
    const response = await axios.request({
		url:    `/participant/?epExpoId=`+id,
		method: 'get',
		headers: {
			'x-role-id': localStorage.getItem("userRoleId"),
		}
	}); 
	let participants = response?.data?.data?.data;
	const users = participants.map(participant => ({
		epUserId:participant.epUserId,
		name: participant.epUserDetails.name,//participant.epUserDetails.name,
		imageSrc: defaultUserImageUrl('default.webp'),//userImageUrl(participant.epUserId+".webp") 
		email: participant.epUserDetails.email
	}));
	return users;
}

export const checkUsers = async (userId, expoId) => {
    const response = await axios.request({
		url:    `/participant/?epUserId=`+userId+`&epExpoId=`+expoId,
		method: 'get',
		headers: {
			'x-role-id': localStorage.getItem("userRoleId"),
		}
	});    
	return response?.data?.data;
}

export const checkUsersCount = async (expoId) => {
    const response = await axios.request({
		url:    `/participant/?&epExpoId=`+expoId,
		method: 'get',
		headers: {
			'x-role-id': localStorage.getItem("userRoleId"),
		}
	});    
	return response?.data?.data;
}

export const checkUsersPaymentStatus = async (orderId) => {
    const response = await axios.request({
		url: `/stripe/check-payment-status?orderId=`+orderId,
		method: 'get',
	}); 
	return response?.data;
}