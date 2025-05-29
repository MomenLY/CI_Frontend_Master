import axios from 'app/store/axiosService';
import { log } from 'console';
import { defaultUserImageUrl, userImageUrl } from 'src/utils/urlHelper';

export const getQuestions = async () => {
    const response = await axios.request({
        url: `/question-answer`,
        method: 'get',

    });

    let questions = response?.data?.data?.questions;

    return questions;
}

export const askQuestion = async (data) => {
    
    try {
        const response = await axios.request({
            url: `/question-answer/create`,  // Correct API endpoint
            method: 'post',
            data: {
                expoCode: data.expoCode,
                question: data.question,
                userId: data.userId,
                userName: data.userName,
                userImage: data.userImage,
                userEmail: data.userEmail,
                SubId:data.subId
            }
        });

        return response?.data?.data?.question;  // Return response data
    } catch (error) {
        console.error('Error asking question:', error);
        throw error;
    }
};


export const sendAnswer = async (id, answer, adminName,adminImage) => {
    const response = await axios.request({
        url: `/question-answer/submit-answer`,
        method: 'patch',
        data: {
            id: id,                // The ID of the question to which you are responding
            answer: answer,        // The answer text
            adminName: adminName,
            adminImage:adminImage
        }

    });
    
    return response?.data?.data?.data?.question;
}

export const getQuestionByUserId = async (userId, expoId,SubId) => {
    const response = await axios.request({
        url: `/question-answer?userId=${userId}&expoId=${expoId}&SubId=${SubId}`,
        method: 'get',
    });
    return response?.data?.data?.questions;
}


export const getQuestionBySubId = async ( expoId,SubId) => {
    const response = await axios.request({
        url: `/question-answer?expoId=${expoId}&SubId=${SubId}`,
        method: 'get',
    });
    return response?.data?.data?.questions;
}