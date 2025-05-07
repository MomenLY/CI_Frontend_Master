import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import React, { useState } from 'react'
import { hideProgress, removeFiles, selectOnionProgressOptions, selectOnionProgressState, showProgress } from './OnionProgressSlice';

import { Button, IconButton, LinearProgress, Popover, Snackbar, styled, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';


const Div = styled("div")(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
    '& .FuseMessage-content': {}
}));

type InitialProps = {
    fileQueue: {
        [key: string]: {
            name: string;
            progress: number;
            id: string;
            status: 'pending' | 'uploading' | 'completed' | 'failed';
        }
    },
    defectiveFileQueue: {
        [key: string]: {
            name: string;
            progress: number;
            id: string;
            status: 'defective';
        }
    }
};
function OnionProgress() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectOnionProgressState);
    const options = useAppSelector(selectOnionProgressOptions);
    const [STATUS] = useState<{ [key: string]: string }>({
        "PENDING": "pending",
        "PROGRESS": "progress",
        "DONE": "done",
        "CANCELLED": "cancelled",
        "ERROR": "error",
        "SUCCESS": "success"
    });
    // console.log(options, 'options')

    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const openl = Boolean(anchorEl);

    const handleClose = () => {
        dispatch(hideProgress())
    };
    const [isVisible, setIsVisible] = useState(true);

    const toggleDiv = () => {
        setIsVisible(!isVisible);
    };

    const retryFileUpload = ({fileId}) =>{
        dispatch(showProgress({retryFileUpload: {fileId}}));
    }

    const removeFile = ({fileId}) =>{
        dispatch(showProgress({removeFile: {fileId}}));
    }

    const removeDefectiveFile = ({fileId}) =>{
        dispatch(showProgress({removeDefectiveFile: {fileId}}));
    }

    
    return (
        <>
        {(Object.keys(options.fileQueue).length > 0 || Object.keys(options.defectiveFileQueue).length > 0 ) && <StyledSnackbar
            open={state}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <Div className="fixed bottom-0 right-0  p-0 max-w-[380px] w-full ">
                {(isVisible) && (
                    <div className="">
                        <ul className="space-y-20 px-14 pt-28 pb-20 overflow-x-hidden overflow-y-scroll max-h-[270px]">
                            {Object.entries(options.fileQueue).map(([fileId, fileData]: [string, InitialProps['fileQueue'][string]]) => (
                                <li key={fileId}>
                                    {fileData.status === STATUS.PROGRESS && <div className="flex">
                                        <FuseSvgIcon size={32} color="secondary">
                                            material-outline:insert_drive_file
                                        </FuseSvgIcon>
                                        <div className="flex-1 mx-12">
                                            <div className="flex justify-between items-center mb-6">
                                                <Typography
                                                    color="disabled"
                                                    className="leading-4 font-medium block"
                                                >
                                                    {fileData.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    className=""
                                                    color="secondary"
                                                >
                                                    {fileData.progress}%
                                                </Typography>
                                            </div>
                                            <LinearProgress variant="determinate" color="secondary" value={fileData.progress} />
                                        </div>
                                        <div className="btns">
                                            <IconButton
                                                size="large"
                                                className="p-0"
                                                onClick={() => removeFile({fileId})}
                                            >
                                                <FuseSvgIcon size={24}>heroicons-outline:x</FuseSvgIcon>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {fileData.status === STATUS.PENDING && <div className="flex">
                                        <FuseSvgIcon size={32} >
                                            material-outline:insert_drive_file
                                        </FuseSvgIcon>
                                        <div className="flex-1 mx-12">
                                            <Typography
                                                className="leading-4 font-medium block"
                                                color="text.disabled"
                                            >
                                                {fileData.name}
                                            </Typography>
                                            <Typography
                                                className="leading-3 font-normal text-[11px]"
                                                color="text.disabled"
                                            >
                                                1 MB
                                            </Typography>
                                        </div>
                                        <div className="btns">
                                            <IconButton
                                                size="large"
                                                className="p-0"
                                                onClick={() => removeFile({fileId})}
                                            >
                                                <FuseSvgIcon size={24}>heroicons-outline:x</FuseSvgIcon>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {fileData.status === STATUS.DONE && <div className="flex">
                                        <FuseSvgIcon size={32} color="secondary">
                                            material-outline:insert_drive_file
                                        </FuseSvgIcon>
                                        <div className="flex-1 mx-12">
                                            <Typography
                                                className="leading-4 font-medium block"
                                                color="secondary"
                                            >
                                                {fileData.name}
                                            </Typography>
                                            <Typography
                                                className="leading-3 font-normal text-[11px]"
                                                color="secondary"
                                            >
                                                1 MB
                                            </Typography>
                                        </div>
                                        <div className="btns">
                                            <IconButton
                                                size="large"
                                                className="p-0"
                                            >
                                                <FuseSvgIcon size={24} style={{ color: "#00C3A5" }}>
                                                    heroicons-solid:check
                                                </FuseSvgIcon>
                                            </IconButton>
                                        </div>
                                    </div>}
                                    {(fileData.status === STATUS.ERROR || fileData.status === STATUS.CANCELLED) &&
                                        <div className="flex">
                                            <FuseSvgIcon size={32} color="error">
                                                material-outline:insert_drive_file
                                            </FuseSvgIcon>
                                            <div className="flex-1 mx-12">
                                                <Typography
                                                    className="leading-4 font-medium block"
                                                    color="error"
                                                >
                                                    {fileData.name}
                                                </Typography>
                                                <Typography
                                                    className="leading-3 font-normal text-[11px]"
                                                    color="error"
                                                >
                                                    1 MB
                                                </Typography>
                                            </div>
                                            <div className="btns">
                                                <IconButton
                                                    size="large"
                                                    className="p-0 me-4"
                                                    color="secondary"
                                                    onClick={()=>retryFileUpload({fileId})}
                                                >
                                                    <FuseSvgIcon size={24}>
                                                        material-outline:refresh
                                                    </FuseSvgIcon>
                                                </IconButton>

                                                <IconButton
                                                    size="large"
                                                    className="p-0 me-4"
                                                    color="error"
                                                    onMouseEnter={handlePopoverOpen}
                                                    onMouseLeave={handlePopoverClose}
                                                >
                                                    <FuseSvgIcon size={24}>
                                                        material-outline:info
                                                    </FuseSvgIcon>
                                                </IconButton>

                                                <Popover
                                                    id="mouse-over-popover"
                                                    sx={{
                                                        pointerEvents: "none",
                                                    }}
                                                    open={openl}
                                                    anchorEl={anchorEl}
                                                    anchorOrigin={{
                                                        vertical: "bottom",
                                                        horizontal: "left",
                                                    }}
                                                    transformOrigin={{
                                                        vertical: "top",
                                                        horizontal: "left",
                                                    }}
                                                    onClose={handlePopoverClose}
                                                    disableRestoreFocus
                                                >
                                                    <div className="flex items-center p-0">
                                                        <FuseSvgIcon className="me-2" color="error" size={24}>
                                                            material-outline:info
                                                        </FuseSvgIcon>
                                                        <Typography sx={{ p: 1 }}>
                                                            {" "}
                                                            network error
                                                        </Typography>
                                                    </div>
                                                </Popover>

                                                <IconButton
                                                    size="large"
                                                    className="p-0"
                                                    onClick={() => removeFile({fileId})}
                                                >
                                                    <FuseSvgIcon size={24}>heroicons-outline:x</FuseSvgIcon>
                                                </IconButton>
                                            </div>
                                        </div>}
                                </li>))}
                            {Object.entries(options.defectiveFileQueue).map(([fileId, fileData]: [string, InitialProps['defectiveFileQueue'][string]]) => (
                                <li key={fileId}>
                                    <div className="flex">
                                        <FuseSvgIcon size={32} color="error">
                                            material-outline:insert_drive_file
                                        </FuseSvgIcon>
                                        <div className="flex-1 mx-12">
                                            <Typography
                                                className="leading-4 font-medium block"
                                                color="error"
                                            >
                                                {fileData.name}
                                            </Typography>
                                            <Typography
                                                className="leading-3 font-normal text-[11px]"
                                                color="error"
                                            >
                                                1 MB
                                            </Typography>
                                        </div>
                                        <div className="btns">
                                            <IconButton
                                                size="large"
                                                className="p-0 me-4"
                                                color="error"
                                                onMouseEnter={handlePopoverOpen}
                                                onMouseLeave={handlePopoverClose}
                                            >
                                                <FuseSvgIcon size={24}>
                                                    material-outline:info
                                                </FuseSvgIcon>
                                            </IconButton>

                                            <Popover
                                                id="mouse-over-popover"
                                                sx={{
                                                    pointerEvents: "none",
                                                }}
                                                open={openl}
                                                anchorEl={anchorEl}
                                                anchorOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "left",
                                                }}
                                                transformOrigin={{
                                                    vertical: "top",
                                                    horizontal: "left",
                                                }}
                                                onClose={handlePopoverClose}
                                                disableRestoreFocus
                                            >
                                                <div className="flex items-center p-0">
                                                    <FuseSvgIcon className="me-2" color="error" size={24}>
                                                        material-outline:info
                                                    </FuseSvgIcon>
                                                    <Typography sx={{ p: 1 }}>
                                                        {" "}
                                                        File size exceed
                                                    </Typography>
                                                </div>
                                            </Popover>

                                            <IconButton
                                                size="large"
                                                className="p-0"
                                                onClick={() => removeDefectiveFile({fileId})}
                                            >
                                                <FuseSvgIcon size={24}>heroicons-outline:x</FuseSvgIcon>
                                            </IconButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Div
                    className="flex w-full items-center ps-20 pe-14 py-14"
                    sx={{
                        backgroundColor: (theme) => theme.palette.background.default
                    }}
                >
                    <div className="flex-1 text-left flex items-center">
                        <Button
                            className="whitespace-nowrap me-10 p-0"
                            variant="contained"
                            color="secondary"
                            style={{
                                width: "30px",
                                minWidth: "30px",
                                height: "30px",
                                minHeight: "30px",
                            }}
                        >
                            <FuseSvgIcon size={14}>heroicons-outline:upload</FuseSvgIcon>
                        </Button>
                        <Typography variant="caption" className="font-medium">
                            {Object.keys(options.fileQueue).length + Object.keys(options.defectiveFileQueue).length} Files Uploading
                        </Typography>
                    </div>
                    <IconButton size="large" onClick={toggleDiv} className="p-0 me-8">
                        {isVisible ? (
                            <FuseSvgIcon size={30} color="secondary">
                                material-outline:keyboard_arrow_down
                            </FuseSvgIcon>
                        ) : (
                            <FuseSvgIcon size={30} color="secondary">
                                material-outline:keyboard_arrow_up
                            </FuseSvgIcon>
                        )}
                    </IconButton>
                    <IconButton
                        size="large"
                        className="p-0"
                        onClick={handleClose}
                        color="primary"
                    >
                        <FuseSvgIcon size={24}>heroicons-outline:x</FuseSvgIcon>
                    </IconButton>
                </Div>
            </Div>
        </StyledSnackbar>}
        </>
        
    )
}

export default OnionProgress
