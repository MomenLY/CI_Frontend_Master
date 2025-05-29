import axios from "app/store/axiosService";

export const getExpoLists = async ({ pagination, keyword, sorting, status }) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    
    const getPayloads = [];

    // Add keyword filters
    if (keyword) {
        getPayloads.push(`keyword=${keyword}`);
    }

    // Add pagination
    if (!pagination || pagination.pageIndex < 0) {
        getPayloads.push(`page=1`);
    } else {
        getPayloads.push(`page=${pagination.pageIndex + 1}`);
        getPayloads.push(`limit=${pagination.pageSize}`);
    }

    // Add sorting
    if (sorting && sorting.length > 0) {
        getPayloads.push(`sortColumn=${sorting[0].id === 'name' ? 'createdAt' : sorting[0].id}`);
        getPayloads.push(`sortOrder=${(sorting[0].desc === false ? "asc" : "desc")}`);
    }

    try { 
        const response = await axios.request({
            url: `/expo?status=${status}&${getPayloads.join('&')}`,
            method: "get",
        });
        return response?.data?.data;
    } catch (error) {
        throw error;
    }
};
