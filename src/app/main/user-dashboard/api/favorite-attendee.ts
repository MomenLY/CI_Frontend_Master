const token = localStorage.getItem("jwt_access_token");

export const getFavoriteAttendees = async (attendeeId: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_DB_URL}/users/favorite/${attendeeId}`, {
            method: 'GET',
            headers: {
                'x-tenant-id': import.meta.env.VITE_DEFAULT_TENANT_ID,
                'Authorization': `Bearer ${token}`,
            },
        });

        // Check if the response status is not OK (e.g., 4xx or 5xx status codes)
        if (!response.ok) {
            const errorData = await response.json(); // Parse error response
            throw new Error(errorData?.message || 'An error occurred');
        }

        // Parse the successful response
        const result = await response.json();
        return result?.data;
        
    } catch (error) {
        // Log and rethrow the error with additional information
        console.log('Error fetching data:', error);
        throw error;
    }
};


export async function toggleFavoriteAttendeeStatus(attendeeId: string, type: string) {
    try {
        const response = await fetch(`${import.meta.env.VITE_DB_URL}/users/favorite`, {
            method: 'POST',
            headers: {
                'x-tenant-id': import.meta.env.VITE_DEFAULT_TENANT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json', // Indicates JSON data in the body
            },
            body: JSON.stringify({
                favoriteUserId: attendeeId,
                type
            }), // Convert the body to a JSON string
        });

        // Check if the response status is not OK (e.g., 4xx or 5xx status codes)
        if (!response.ok) {
            const errorData = await response.json(); // Parse error response
            throw new Error(errorData?.message || 'An error occurred');
        }

        // Parse the successful response
        const result = await response.json();
        return result?.data;
        
    } catch (error) {
        // Log and rethrow the error with additional information
        console.log('Error toggling favorite attendee status:', error);
        throw error;
    }
}
