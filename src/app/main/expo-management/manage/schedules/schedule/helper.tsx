export const getExpoIdFromURL = () => {
    const regex = /\/?expo-management\/expo\/([a-f0-9-]+)\/manage\/schedule/;
    const match = location.pathname.match(regex);
    return match[1] ? match[1] : 0;
}
