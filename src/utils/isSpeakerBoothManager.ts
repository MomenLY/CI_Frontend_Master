export const isSpeaker = (speakers: any, userID: string) => {
    const isSpeakerValid = speakers.some((speaker: any) => {
        return (speaker._id === userID);
    });
    return isSpeakerValid;
}

export const isBoothManager = (booth: any, userID: string, boothId: string, fromLobby = false, boothManagers) => {
    let isBoothManagerValid = false;
    if (fromLobby) {
        isBoothManagerValid = boothManagers.some((boothManager) => boothManager === userID)
    } else {
        const boothManagerById = booth.boothManager;
        isBoothManagerValid = boothManagerById['id'] === userID;
    }
    return isBoothManagerValid;
}

export const isOrganiser = (userRoleID: string, tenantId: string, userTenantId: string): boolean => {
    let isOrganiser: boolean = false;

    if (tenantId === import.meta.env.VITE_DEFAULT_TENANT_ID && userRoleID === import.meta.env.VITE_ORGANISER_ROLE_ID) {
        isOrganiser = true;
    } else if (userRoleID === import.meta.env.VITE_ORGANISER_ROLE_ID && tenantId === userTenantId) {
        isOrganiser = true;
    }

    return isOrganiser;
};
