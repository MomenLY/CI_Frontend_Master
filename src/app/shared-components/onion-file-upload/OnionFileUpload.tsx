import React, { useRef, useEffect, useState, DependencyList } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { generateId, getOnePendingFileIdFromFileQueue } from './utils/helper';
import { Box } from '@mui/system';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectOnionProgressOptions, showProgress, removeFiles } from './utils/onion-progress/OnionProgressSlice';
import axiosClient from 'app/store/axiosService';

//for cropping functioanlity
import ReactCrop, { PixelCrop, convertToPixelCrop, type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { canvasPreview, centerAspectCrop, isImageFile, sanitizeFilename, useDebounceEffect } from './onion-image-cropper/cropper-helper';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Slider from '@mui/material/Slider';
import { CDN_INVALIDATE_API, DEFAULT_ASPECT_RATIO, MAX_ROTATE, MAX_SCALE, MIN_ROTATE, MIN_SCALE, SIGNED_URL_GEN_API } from './onion-image-cropper/cropper-configs';
import { DATATYPES } from '../onion-custom-field-form/store/dataTypes';
import { useTranslation } from 'react-i18next';
//End of intializing cropping functioanlity

type ButtonPropsColorOverrides = 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'

interface OnionFileUploadProps {
    loader?: boolean;
    accept?: string;
    maxFileSize?: Number;
    multiple?: boolean;
    autoUpload?: boolean;
    beginUpload?: boolean;
    reUpload?: string[];
    targetUrl?: string;
    id: string;
    buttonLabel?: string;
    buttonColor?: ButtonPropsColorOverrides;
    onProgress?: (result: { progress: number, file: File, id: string }) => void;
    onFileUploadComplete?: (result: { status: string; message: string; data: any; id: string }) => void;
    onSelect?: (state: FileSelection) => void;
    onSelectingDefectiveFiles?: ({ }) => void;
    onAllUploadComplete?: () => void;
    cropper?: boolean;
    aspectRatio?: number;
    uploadPath: string;
    buttonClass?: string;
    buttonContent?: any;
    onCropCancel?: (id: string) => void;
    fileName?: string;
}

interface FileSelection {
    identifier: string;
    files: { [key: string]: { id: string; file: File } };
}

const OnionFileUpload: React.FC<OnionFileUploadProps> = ({
    id,
    buttonLabel = "Browse File",
    buttonColor = "primary",
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
    cropper,
    aspectRatio,
    uploadPath,
    buttonClass = "mx-4 rounded-[10px] font-medium uppercase",
    buttonContent,
    onCropCancel,
    fileName,
}) => {
    const _accept = accept.replace(/\s+/g, '')
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

    //State and function definitions that required for crop functioanlity
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState<number | undefined>(aspectRatio || DEFAULT_ASPECT_RATIO)
    const [currentFileId, setCurrentFileId] = useState(null);
    const { t } = useTranslation();

    const onFileSelectedForCrop = (fileId) => {
        if (fileId) {
            setCurrentFileId(fileId);
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
            });
            reader.readAsDataURL(selectedFiles[fileId]['file'])
        }
    }

    const onImageLoadedForCrop = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
        if (aspectRatio === undefined) {
            setAspect(undefined);
        }
    }

    const uploadCroppedFile = async () => {
        const image = imgRef.current
        const previewCanvas = previewCanvasRef.current
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist')
        }

        // This will size relative to the uploaded image
        // size. If you want to size according to what they
        // are looking at on screen, remove scaleX + scaleY
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        )
        const ctx = offscreen.getContext('2d')
        if (!ctx) {
            throw new Error('No 2d context')
        }

        ctx.drawImage(
            previewCanvas,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height,
            0,
            0,
            offscreen.width,
            offscreen.height,
        )
        // You might want { type: "image/jpeg", quality: <0 to 1> } to
        // reduce image size
        const blob = await offscreen.convertToBlob({
            type: selectedFiles[currentFileId]['file']['type'],
        })
        const croppedFileOutput = new File([blob], selectedFiles[currentFileId]['file']['name'], {
            type: blob.type,
        });
        const newSelectedFiles: { [key: string]: { id: string; file: File } } = {};
        const _currentFileId = currentFileId;
        newSelectedFiles[_currentFileId] = { id: _currentFileId, file: croppedFileOutput };
        setCurrentFileId(null);
        setSelectedFiles(newSelectedFiles);
        setImgSrc("");
        setCrop(undefined);
        setCompletedCrop(null);
        imgRef.current = null;
        previewCanvasRef.current = null;
        setScale(1);
        setRotate(0);
        setAspect(aspectRatio || DEFAULT_ASPECT_RATIO);
        if (autoUpload) {
            setLaunchUpload(true);
        }
    }

    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )

    const resetCropSelection = () => {
        setAspect(aspectRatio)
        if (imgRef.current) {
            const { width, height } = imgRef.current
            const newCrop = centerAspectCrop(width, height, (aspectRatio || DEFAULT_ASPECT_RATIO))
            setCrop(newCrop)
            // Updates the preview
            setCompletedCrop(convertToPixelCrop(newCrop, width, height))
            setRotate(0);
            setScale(1);
        }
    }
    //End of State and function definitions that required for crop functioanlity

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

    useEffect(() => {
        if (Object.keys(selectedFiles).length > 0) {
            if (onSelect) {
                onSelect({
                    identifier: id,
                    files: selectedFiles,
                });
            }
            if (multiple === false && cropper === true && currentFileId) {
                if (isImageFile(selectedFiles[currentFileId]['file']['type'])) {
                    onFileSelectedForCrop(currentFileId);
                } else {
                    if (autoUpload) {
                        setLaunchUpload(true);
                    }
                }
            }
        }
    }, [selectedFiles]);

    const uploadFiles = async (file: File, fileId: string, cancelToken: any) => {
        setBrowse(false);
        let S3fileKey = uploadPath + "/" + file.name
        S3fileKey = S3fileKey.replace(new RegExp('//', 'g'), '/');

        try {
            const signedUrl = await axiosClient.get('/' + SIGNED_URL_GEN_API + '?key=' + S3fileKey);

            const response = await axios.put(signedUrl.data.data, file, {
                cancelToken,
                headers: {
                    'Authorization': undefined,
                    'Content-Type': file.type,
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
            if (cropper === true && multiple === false) {
                setImgSrc("");
                setCrop(undefined);
                setCompletedCrop(null);
                imgRef.current = null;
                previewCanvasRef.current = null;
                setScale(1);
                setRotate(0);
                setAspect(aspectRatio || DEFAULT_ASPECT_RATIO);
            }
            if (onFileUploadComplete) {
                // if the file Name is not empty, invalidate the CDN
                if (fileName) {
                    await axiosClient.get('/' + CDN_INVALIDATE_API + '?filePath=' + "/" + S3fileKey);
                }
                onFileUploadComplete({
                    status: STATUS.SUCCESS,
                    message: 'Files uploaded successfully',
                    data: { data: S3fileKey.split("/").pop(), uploadPath: S3fileKey },
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


    const FILETYPES = {};
    DATATYPES.map((DATATYPE) => {
        FILETYPES[DATATYPE.fileValue] = DATATYPE.fileType;
        FILETYPES[DATATYPE.fileType] = DATATYPE.fileType;
    })

    const isFileFreeFromDefects = (file: any) => {
        const defects = [];
        //check file size if size rule is given
        if (Number(maxFileSize) > 0) {
            const MB = 1024 * 1024;
            const fileSizeMB = file.size / MB;
            if (Number(fileSizeMB.toFixed(2)) > Number(maxFileSize)) {
                defects.push(t('max_file_size_exceeded'));
            }
        }
        const fileTypeDefinitions = [];
        const allowedTypes = _accept.split(',');
        if (!allowedTypes.includes('any')) {
            if (allowedTypes.length) {
                allowedTypes.map((fType) => {
                    if (typeof FILETYPES[fType] !== "undefined") {
                        fileTypeDefinitions.push(FILETYPES[fType]);
                    }
                });
                if (!fileTypeDefinitions.includes(file.type)) {
                    defects.push(t('invalid_file_format'));
                }
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
            let lastFileId = null;
            let fileCount = 0;
            Array.from(files).forEach((file: any) => {
                const fileId = generateId();
                let uniqueFilename = "";
                let fileNameParts = file.name.split(".");
                let fileExtension = fileNameParts.pop();
                if (fileName) {
                    fileCount++;
                    uniqueFilename = sanitizeFilename(fileName + "-" + fileCount + "." + fileExtension);
                } else {
                    fileNameParts = fileNameParts.join('.');
                    uniqueFilename = sanitizeFilename(fileNameParts + fileId + "." + fileExtension);
                }
                file = new File([file], uniqueFilename, { type: file.type });

                lastFileId = fileId;
                fileDefects = isFileFreeFromDefects(file);
                if (fileDefects.length === 0) {
                    _fileQueue[fileId] = { "name": file.name, "progress": 0, "id": fileId, "status": STATUS.PENDING };
                    newSelectedFiles[fileId] = { id: fileId, file: file };
                } else {
                    fileDefectsQueue[fileId] = { name: file.name, defects: fileDefects, identifier: id };
                }
            });
            if (Object.keys(fileDefectsQueue).length > 0) {
                setDefectiveFiles((prevFileDefects: any) => ({ ...prevFileDefects, ...fileDefectsQueue }));
            }

            if (multiple) {
                setFileQueue((prevQueue: any) => ({ ...prevQueue, ..._fileQueue }));
                setSelectedFiles((prevFiles: any) => ({ ...prevFiles, ...newSelectedFiles }));
            } else {
                if (cropper === true) {
                    setCurrentFileId(lastFileId);
                }
                setFileQueue(_fileQueue);
                setSelectedFiles(newSelectedFiles);
            }
            if ((autoUpload === true && cropper === false) || (autoUpload === true && multiple === true)) {
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

    const onScaleSliderChange = (_: Event, newScaleValue: number | number[]) => {
        setScale(newScaleValue as number);
    };

    const onRotateSliderChange = (_: Event, newRotateValue: number | number[]) => {
        setRotate(Math.min(180, Math.max(-180, Number(newRotateValue))))
    };

    const closeCropper = () => {
        if (onCropCancel) {
            onCropCancel(id);
        }
        setImgSrc("");
        setCrop(undefined);
        setCompletedCrop(null);
        imgRef.current = null;
        previewCanvasRef.current = null;
        setScale(1);
        setRotate(0);
        setAspect(aspectRatio || DEFAULT_ASPECT_RATIO);
    }

    return (
        <>
            <Box>
                <Button
                    variant="contained"
                    className="mx-4 rounded-[10px] font-medium uppercase"
                    color={buttonColor}
                    component="label" disabled={!browse}>
                    {buttonContent ? buttonContent : buttonLabel}
                    <VisuallyHiddenInput
                        type="file"
                        name={id}
                        {...(_accept && { _accept })}
                        multiple={multiple}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </Button>
            </Box>


            <>
                {imgSrc && <Dialog
                    fullScreen={false}
                    open={imgSrc && true}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        CROP IMAGE
                    </DialogTitle>
                    <DialogContent>

                        <Box>
                            <div className="cropper-container">
                                <div className="Crop-Controls flex item-center justify-between my-20">
                                    <Box className="w-full me-32">
                                        <label htmlFor="scale-input">Scale: </label>
                                        <Slider
                                            step={.1}
                                            value={scale}
                                            valueLabelDisplay="auto"
                                            min={MIN_SCALE}
                                            max={MAX_SCALE}
                                            onChange={onScaleSliderChange}
                                        />
                                    </Box>
                                    <Box className="w-full">
                                        <label htmlFor="rotate-input">Rotate: </label>
                                        <Slider
                                            step={1}
                                            value={rotate}
                                            valueLabelDisplay="auto"
                                            min={MIN_ROTATE}
                                            max={MAX_ROTATE}
                                            onChange={onRotateSliderChange}
                                        />
                                    </Box>
                                    <div>
                                    </div>
                                </div>
                                {!!imgSrc && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={aspect}
                                    >
                                        <img
                                            ref={imgRef}
                                            alt="Crop me"
                                            src={imgSrc}
                                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                            onLoad={onImageLoadedForCrop}
                                        />
                                    </ReactCrop>
                                )}
                                {!!completedCrop && (
                                    <>
                                        <div>
                                            <canvas
                                                ref={previewCanvasRef}
                                                style={{
                                                    display: "none"
                                                }}
                                            />
                                        </div>

                                    </>
                                )}
                            </div>
                        </Box>

                    </DialogContent>
                    <DialogActions style={{ justifyContent: "center" }}>
                        <Button
                            onClick={closeCropper}
                            className="mx-4 rounded-[10px] font-medium uppercase "
                            variant="contained"
                            color={"error"}
                            disabled={!browse}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={resetCropSelection}
                            className="mx-4 rounded-[10px] font-medium uppercase "
                            variant="contained"
                            color={"secondary"}
                            disabled={!browse}
                        >
                            Reset
                        </Button>
                        <Button
                            className="mx-4 rounded-[10px] font-medium uppercase "
                            variant="contained"
                            color={buttonColor}
                            onClick={uploadCroppedFile}
                            disabled={!browse}
                        >
                            Crop
                        </Button>
                    </DialogActions>
                </Dialog>}
            </>
        </>

    );
};

export default OnionFileUpload;
