import React, { useRef, useEffect, useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { CircularProgressWithLabel } from './utils/progressBars';
import { generateId, getOnePendingFileIdFromFileQueue, getStatusColor } from './utils/helper';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectOnionProgressOptions, showProgress, removeFiles } from './utils/onion-progress/OnionProgressSlice';


type ButtonPropsColorOverrides = 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'

interface OnionFileUploadProps {
    loader?: boolean;
    accept?: string;
    maxFileSize?: Number;
    multiple?: boolean;
    autoUpload?: boolean;
    beginUpload?: boolean;
    reUpload?: string[];
    targetUrl: string;
    id: string;
    buttonLabel?: string;
    buttonColor?: ButtonPropsColorOverrides;
    onProgress?: (result: { progress: number, file: File, id: string }) => void;
    onFileUploadComplete?: (result: { status: string; message: string; data: any; id: string }) => void;
    onSelect?: (state: FileSelection) => void;
    onSelectingDefectiveFiles?: ({ }) => void;
    onAllUploadComplete?: () => void;
}

interface FileSelection {
    identifier: string;
    files: { [key: string]: { id: string; file: File } };
}

const OnionFileUpload: React.FC<OnionFileUploadProps> = ({
    id,
    buttonLabel = "Browse File",
    buttonColor = "secondary",
    loader = false,
    accept = "",
    maxFileSize = 0,
    multiple = false,
    autoUpload = true,
    beginUpload: startUpload = false,
    reUpload = [],
    targetUrl,
    onProgress,
    onFileUploadComplete,
    onSelect,
    onAllUploadComplete,
    onSelectingDefectiveFiles,
}) => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileQueue, setFileQueue] = useState<{ [key: string]: { name: string; progress: number; id: string; status: string } }>({});
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: { id: string; file: File } }>({});
    const [launchUpload, setLaunchUpload] = useState<boolean>(startUpload);
    const [processQueue, setProcessQueue] = useState<any[]>([]);
    const [maxUploadLimit] = useState<Number>(2);
    const [browse, setBrowse] = useState<boolean>(true);
    const [debug] = useState<boolean>(true);
    const [cancelTokens, setCancelTokens] = useState<{ [key: string]: CancelTokenSource }>({});
    const [defectiveFiles, setDefectiveFiles] = useState<{ [key: string]: { name: string; defects: string[] } }>({});
    const [STATUS] = useState<{ [key: string]: string }>({
        "PENDING": "pending",
        "PROGRESS": "progress",
        "DONE": "done",
        "CANCELLED": "cancelled",
        "ERROR": "error",
        "SUCCESS": "success"
    });
    const options = useAppSelector(selectOnionProgressOptions);

    useEffect(() => {
        if (autoUpload || startUpload) {
            setLaunchUpload(true);
            setBrowse(false);
        }
    }, [autoUpload, startUpload]);

    useEffect(() => {
        if (launchUpload) {
            setLaunchUpload(false);
            if (Number(maxUploadLimit) > Object.keys(processQueue).length) {
                const fileId = getOnePendingFileIdFromFileQueue(fileQueue);
                if (fileId) {
                    consoleLog("sending " + fileId + " to queue");
                    consoleLog('queue size is ' + Number(Number(Object.keys(processQueue).length) + 1));
                    setProcessQueue(prevQueue => {
                        return [...prevQueue, fileId]
                    });
                } else {
                    if (Object.keys(processQueue).length <= 0) {
                        setLaunchUpload(false);
                        setBrowse(true);
                        consoleLog("Uploading completed..");
                        if (onAllUploadComplete) {
                            onAllUploadComplete();
                        }
                    }
                }
            } else {
                consoleLog('Limit is(' + maxUploadLimit + '). Curnt QSize = (' + Object.keys(processQueue).length + ') Waiting for other files to complete.');
            }
        }
    }, [launchUpload]);

    useEffect(() => {
        for (let i = 0; i < processQueue.length; i++) {
            let fileId = processQueue[i];
            if (fileId && fileQueue[fileId]['status'] === STATUS.PENDING) {
                setFileQueue(prevQueue => ({
                    ...prevQueue,
                    [fileId]: {
                        ...prevQueue[fileId],
                        status: STATUS.PROGRESS,
                    },
                }));
                consoleLog("uploading " + fileId + " starts");
                const cancelTokenSource = axios.CancelToken.source();
                setCancelTokens(prevTokens => ({
                    ...prevTokens,
                    [fileId]: cancelTokenSource,
                }));
                uploadFiles(selectedFiles[fileId]['file'], fileId, cancelTokenSource.token);
                consoleLog("Calling next file to queue");
                setLaunchUpload(true);
                break;
            }
        }
    }, [processQueue]);

    useEffect(() => {
        if (onSelectingDefectiveFiles && Object.keys(defectiveFiles).length > 0) {
            onSelectingDefectiveFiles(defectiveFiles)
        }
        dispatch(showProgress({ defectiveFileQueue: defectiveFiles }));
    }, [defectiveFiles]);

    useEffect(() => {
        if (reUpload.length > 0) {
            for (let i = 0; i < reUpload.length; i++) {
                let fileId = reUpload[i];
                if (fileId && (fileQueue[fileId]['status'] === STATUS.ERROR || fileQueue[fileId]['status'] === STATUS.CANCELLED)) {
                    retryFileUpload(fileId);
                }
            }
        }
    }, [reUpload])

    useEffect(() => {
        if (loader && fileQueue) {
            dispatch(showProgress({ fileQueue }));
        }
    }, [fileQueue]);

    useEffect(() => {
        if (options.retryFileUpload.fileId && typeof fileQueue[options.retryFileUpload.fileId] !== 'undefined') {
            retryFileUpload(options.retryFileUpload.fileId);
        }
    }, [options.retryFileUpload.fileId])

    useEffect(() => {
        if (options.removeFile.fileId && typeof fileQueue[options.removeFile.fileId] !== 'undefined') {
            removeFile(options.removeFile.fileId);
            dispatch(removeFiles({ queue: 'fileQueue', key: options.removeFile.fileId }));
        }
    }, [options.removeFile.fileId])

    useEffect(() => {
        if (options.removeDefectiveFile.fileId && typeof defectiveFiles[options.removeDefectiveFile.fileId] !== 'undefined') {
            removeDefectiveFile(options.removeDefectiveFile.fileId);
            dispatch(removeFiles({ queue: 'defectiveFileQueue', key: options.removeDefectiveFile.fileId }));
        }
    }, [options.removeDefectiveFile.fileId])

    const uploadFiles = async (file: File, fileId: string, cancelToken: any) => {
        setBrowse(false);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(targetUrl, formData, {
                cancelToken,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Tenant-Id': 'dell',
                },
                onUploadProgress: (progressEvent: any) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileQueue(prevQueue => ({
                        ...prevQueue,
                        [fileId]: {
                            ...prevQueue[fileId],
                            progress: progress,
                            status: progress >= 100 ? STATUS.DONE : STATUS.PROGRESS,
                        },
                    }));

                    if (onProgress) {
                        onProgress({
                            id,
                            progress,
                            file
                        });
                    }
                },
            });

            setFileQueue(prevQueue => ({
                ...prevQueue,
                [fileId]: {
                    ...prevQueue[fileId],
                    status: STATUS.DONE,
                },
            }));

            setProcessQueue(prevQueue => {
                const updatedQueue = prevQueue.filter(item => item !== fileId);
                return updatedQueue;
            });

            consoleLog("Upload completed for " + fileId);
            consoleLog('Checking unprocessed files');
            setLaunchUpload(true);

            if (onFileUploadComplete) {
                onFileUploadComplete({
                    status: STATUS.SUCCESS,
                    message: 'Files uploaded successfully',
                    data: response.data,
                    id
                });
            }
        } catch (error: any) {

            setFileQueue(prevQueue => ({
                ...prevQueue,
                [fileId]: {
                    ...prevQueue[fileId],
                    status: STATUS.ERROR,
                },
            }));

            setProcessQueue(prevQueue => {
                const updatedQueue = prevQueue.filter(item => item !== fileId);
                return updatedQueue;
            });

            if (onFileUploadComplete) {
                onFileUploadComplete({
                    status: STATUS.ERROR,
                    message: error.message || 'Something went wrong',
                    data: null,
                    id
                });
            }

            consoleLog("Upload terminated for " + fileId);
            consoleLog('Checking unprocessed files');
            setLaunchUpload(true);
        }
    };

    const isFileFreeFromDefects = (file: any) => {
        const defects = [];
        //check file size if size rule is given
        if (Number(maxFileSize) > 0) {
            const MB = 1024 * 1024;
            const fileSizeMB = file.size / MB;
            if (Number(fileSizeMB.toFixed(2)) > Number(maxFileSize)) {
                defects.push("File size limit exceeded.");
            }
        }
        return defects;
    }

    const handleFileSelect = (event: any) => {
        const files = event.target.files;
        if (files) {
            const _fileQueue: { [key: string]: { name: string; progress: number; id: string; status: string } } = {};
            const newSelectedFiles: { [key: string]: { id: string; file: File } } = {};

            let fileDefectsQueue = {}, fileDefects = [];
            Array.from(files).forEach((file: any) => {
                const fileId = generateId();
                fileDefects = isFileFreeFromDefects(file);
                if (fileDefects.length === 0) {
                    _fileQueue[fileId] = { "name": file.name, "progress": 0, "id": fileId, "status": STATUS.PENDING };
                    newSelectedFiles[fileId] = { id: fileId, file: file };
                } else {
                    fileDefectsQueue[fileId] = { name: file.name, defects: fileDefects };
                }
            });
            if (Object.keys(fileDefectsQueue).length > 0) {
                setDefectiveFiles((prevFileDefects: any) => ({ ...prevFileDefects, ...fileDefectsQueue }));
            }

            if (multiple) {
                setFileQueue((prevQueue: any) => ({ ...prevQueue, ..._fileQueue }));
                setSelectedFiles((prevFiles: any) => ({ ...prevFiles, ...newSelectedFiles }));
            } else {
                setFileQueue(_fileQueue);
                setSelectedFiles(newSelectedFiles);
            }
            if (onSelect) {
                onSelect({
                    identifier: id,
                    files,
                });
            }
            if (autoUpload) {
                setLaunchUpload(true);
            }
        }
    };

    const removeFile = (fileId: string) => {
        const cancelTokenSource = cancelTokens[fileId];
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
            setCancelTokens(prevTokens => {
                const newTokens = { ...prevTokens };
                delete newTokens[fileId];
                return newTokens;
            });
            consoleLog('Cancelling upload for file [' + fileId + ']...');
        }
        if (fileQueue[fileId]["status"] === STATUS.PENDING) {
            setFileQueue(prevQueue => {
                const newQueue = { ...prevQueue };
                delete newQueue[fileId];
                return newQueue;
            });

            setSelectedFiles(prevFiles => {
                const newFiles = { ...prevFiles };
                delete newFiles[fileId];
                return newFiles;
            });
        }
    };

    const retryFileUpload = (fileId: string) => {
        setFileQueue(prevQueue => ({
            ...prevQueue,
            [fileId]: {
                ...prevQueue[fileId],
                status: STATUS.PENDING,
            },
        }));
        setLaunchUpload(true);
    }

    const removeDefectiveFile = (fileId: string) => {
        setDefectiveFiles(oldDefectiveFile => {
            const _defectiveFiles = { ...oldDefectiveFile };
            delete _defectiveFiles[fileId];
            return _defectiveFiles;
        });
    }

    const consoleLog = (message: any) => {
        if (debug) {

        }
    }

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <Box>
            <Button component="label" variant="contained" color={buttonColor} disabled={!browse}>
                {buttonLabel}
                <VisuallyHiddenInput
                    type="file"
                    {...(accept && { accept })}
                    multiple={multiple}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
            </Button>
            {/* <table>
                <thead>
                    <tr>
                        <td colSpan={2}>
                            <Button component="label" variant="contained" color={buttonColor} disabled={!browse}>
                                {buttonLabel}
                                <VisuallyHiddenInput
                                    type="file"
                                    {...(accept && { accept })}
                                    multiple={multiple}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {loader && Object.entries(fileQueue).map(([fileId, fileData]) => (
                        <tr key={fileId} style={{ color: getStatusColor(fileData.status), fontSize: 12 }}>
                            <td>
                                {fileData.status === STATUS.PROGRESS && <CircularProgressWithLabel value={fileData.progress} />}
                                {fileData.status === STATUS.PENDING && <CircularProgressWithLabel value={0} />}
                                {fileData.status === STATUS.DONE && <CircularProgressWithLabel value={100} />}
                                {(fileData.status === STATUS.ERROR || fileData.status === STATUS.CANCELLED) && <CircularProgressWithLabel value={fileData.progress} color="secondary" />}
                            </td>
                            <td>
                                {fileData.name}
                            </td>
                            <td>
                                {(fileData.status === STATUS.PENDING || fileData.status === STATUS.PROGRESS) && (
                                    <button
                                        onClick={() => removeFile(fileId)}
                                        style={{
                                            marginLeft: '10px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
                                    </button>
                                )}

                                {(fileData.status === STATUS.ERROR) && (
                                    <button
                                        onClick={() => retryFileUpload(fileId)}
                                        style={{
                                            marginLeft: '10px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <FuseSvgIcon>heroicons-outline:refresh</FuseSvgIcon>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {loader && Object.keys(defectiveFiles).length > 0 && <tr><td colSpan={2}>Defective Files</td></tr>}
                    {loader && Object.keys(defectiveFiles).length > 0 &&
                        Object.entries(defectiveFiles).map(([fileId, _fileDefects]) => (
                            <tr key={fileId} style={{ color: "red", fontSize: 12 }}>
                                <td>{_fileDefects.name}</td>
                                <td>
                                    <button
                                        onClick={() => removeDefectiveFile(fileId)}
                                        style={{
                                            marginLeft: '10px',
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
                                    </button>
                                </td>
                            </tr>))}
                </tbody>
                <tfoot></tfoot>
            </table> */}
        </Box>
    );
};

export default OnionFileUpload;