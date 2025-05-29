import { useEffect, useState } from 'react';

interface BillboardFile {
    billboardResources: string; // Adjust type based on your actual resource
    billboardLink: string;
    billboardDuration: number;
    billboardOrder: number;
}

interface Data {
    files: {
        [key: string]: BillboardFile;
    };
}

const useCircularPlayback = (data: Data) => {
    if (data === undefined || data === null) return;
    const sortedFileKeys = Object.keys(data.files).sort((a, b) => {
        return data.files[a].billboardOrder - data.files[b].billboardOrder;
    });
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        if (sortedFileKeys.length === 0) return;

        const currentFile = data.files[sortedFileKeys[currentIndex]];
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % sortedFileKeys.length); 
        }, currentFile.billboardDuration * 1000); 
        return () => clearTimeout(timer);
    }, [currentIndex, data, sortedFileKeys]);

    return {
        currentFile: data.files[sortedFileKeys[currentIndex]],
        currentIndex,
        totalFiles: sortedFileKeys.length,
    };
};

export default useCircularPlayback;