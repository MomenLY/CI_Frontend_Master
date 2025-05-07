const generateId = (): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 5);
    return `${timestamp}-${randomString}`;
};

const getOnePendingFileIdFromFileQueue = (items: any) => {
    for (const key in items) {
        if (items.hasOwnProperty(key) && items[key]["status"] === "pending") {
            return items[key]["id"];
        }
    }
    return null;
}

function getStatusColor(status: string) {
    switch (status) {
        case 'done':
            return 'green';
        case 'error':
            return 'red';
        default:
            return 'black';
    }
}

export { generateId, getOnePendingFileIdFromFileQueue, getStatusColor }