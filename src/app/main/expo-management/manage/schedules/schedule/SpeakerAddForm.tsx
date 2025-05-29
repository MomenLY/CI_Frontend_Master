import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, TextField, Typography } from '@mui/material';
import { Controller, Form, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import OnionDropdown from 'app/shared-components/components/OnionDropdown';
import _ from 'lodash';
import { setState, useScheduleDispatch, useSchedulesSelector } from '../SchedulesSlice';
import { AddSpeakerAPI } from '../apis/Add-Speaker-Api';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ImageUpload from 'app/shared-components/components/ImageUpload';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import OnionFileUpload from 'app/shared-components/onion-file-upload/OnionFileUpload';
import { defaultSpeakerImageUrl, expoPath, speakerImageUrl } from 'src/utils/urlHelper';
import { convertImageToDataURL } from 'app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper';
import { SettingsApi } from 'src/app/main/settings/SettingsApi';

const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    organisation: ''
};

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    organisation: string;
};

interface SpeakerAddFormProps {
    open: boolean;
    onClose: () => void;
    expoId: string;
    addNewSpeaker: (newSpeaker: any) => void;
}

function SpeakerAddForm({ open, onClose, expoId, addNewSpeaker }: SpeakerAddFormProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('schedules');
    const dispatchRefresh = useScheduleDispatch();
    const state = useSchedulesSelector((state) => state.state.value);
    const [imageFileErrors, setImageFileErrors] = useState({});
    const schema = z.object({
        firstName: z.string().min(1, 'addSpeaker_firstName_null_alert'),
        lastName: z.string().min(1, 'addSpeaker_lastName_null_alert'),
        email: z.string().min(1, 'addSpeaker_email_valid_alert').email('addSpeaker_email_null_alert'),
        designation: z.string().min(1, 'addSpeaker_designation_null_alert'),
        organisation: z.string().min(1, 'addSpeaker_organisation_null_alert')
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { control, formState, handleSubmit, getValues, setValue, clearErrors, watch } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema),
    });
    const [imagePath, setImagePath] = useState('');
    const [upLoadProgress, setUploadProgress] = useState<any>();
    const [speakerPath, setSpeakerPath] = useState('');
    const [fileQueue, setFileQueue] = useState({});
    const { isValid, dirtyFields, errors } = formState;
    const [speakerRoleId, setSpeakerRoleId] = useState('');
    const [image, setImage] = useState("");
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [defaultPassword, setDefaultPassword] = useState('');
    const [speakerPreviewImage, setSpeakerPreviewImage] = useState(defaultSpeakerImageUrl('default.webp'));
    useEffect(() => {
        getSpeakerRoleId();
        getDefaultPassword();
    }, []);

    const getDefaultPassword = async () => {
        const passwordData = await SettingsApi({ settingsKey: "password" });
        if (passwordData) {
            setDefaultPassword(passwordData.defaultPasswordSetByAdmin);
        }

    }

    const email = watch('email');
    useEffect(() => {
        if (!open) {
            setSpeakerPreviewImage(defaultSpeakerImageUrl('default.webp'));
            setValue('firstName', '');
            setValue('lastName', '');
            setValue('email', '');
            setValue('designation', '');
            setValue('organisation', '');
            clearErrors('email');
        }
    }, [open]);
    const getSpeakerRoleId = async () => {
        const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
        const speakerId = settings?.speakerRoleId;
        const speakerPath = settings?.speakerPath;
        setSpeakerRoleId(speakerId);
        setSpeakerPath(speakerPath);
    }

    const handleProgress = (progress: {}) => {
        setUploadProgress(progress);
    };

    const handleDefectiveFiles = (files) => {
        setImageFileErrors((errors) => {
            const _errors = { ...errors };
            for (const fileId in files) {
                if (files.hasOwnProperty(fileId)) {
                    const file = files[fileId];
                    _errors[file.identifier] = {
                        error: true,
                        message: t('invalid_file_errorMessage'),
                    };
                }
            }
            return _errors;
        });

        for (const fileId in files) {
            if (files.hasOwnProperty(fileId)) {
                const file = files[fileId];
                const defectsMessage = Array.isArray(file.defects)
                    ? file.defects.join(', ')
                    : file.defects;
                dispatch(showMessage({ message: defectsMessage, variant: "error" }));
            }
        }
    };
    const handleUploadComplete = async (result: {
        status: string;
        message: string;
        data: any;
        id: string;
    }) => {
        const _result = await result?.data;
        setImage(_result?.data)
        setFileQueue((prev) => {
            const _prev = { ...prev };
            _prev[result.id] = true;
            return _prev;
        });
        setSpeakerPreviewImage("");
    };

    const [speakerFormData, setSpeakerFormData] = useState(null);
    const [autoUpload, setAutoUpload] = useState(false);
    const onSubmit = async (data: FormData) => {
        if (Object.keys(fileQueue).length > 0) {
            setAutoUpload(true);
            setSpeakerFormData(data)
        } else {
            onSubmitProceed(data);
        }
    };

    const onSubmitProceed = async (formData: FormData) => {
        setIsLoading(true)
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                designation: formData.designation,
                organisation: formData.organisation,
                roleIds: [speakerRoleId],
                userImage: image === '' ? 'default.webp' : image,
                password: defaultPassword ? defaultPassword : 'Enfin@123'
            };
            const response = await AddSpeakerAPI(payload);
            if (response?.statusCode === 201) {
                setIsLoading(false);
                onClose();
                setValue('firstName', '');
                setValue('lastName', '');
                setValue('email', '');
                setValue('designation', '');
                setValue('organisation', '');
                setSpeakerFormData(null);
                setImage("");
                addNewSpeaker(response.data)
                await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + expoId)
                dispatch(showMessage({ message: `${t('schedule_addSpeaker_successMessage')}`, variant: 'success' }));
            } else {
                dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
                setIsLoading((prev) => !prev)
            }
            setFileQueue({});
            setAutoUpload(false);
        } catch (err) {
            setIsLoading(false);
            const errorMessage = err?.response?.data?.message;
            if (errorMessage) {
                dispatch(showMessage({ message: errorMessage || 'Server error', variant: 'error' }));
            }
            setFileQueue({});
            setAutoUpload(false);
        }
    };

    const handleFileSelect = (files) => {
        if (files.identifier === "expSpeakerImage") {
            for (let [fileKey, _file] of Object.entries(files.files)) {
                convertImageToDataURL(files.files[fileKey]['file'], setSpeakerPreviewImage);
                break;
            }
        }
        setFileQueue((prev) => {
            const _prev = { ...prev };
            _prev[files.identifier] = false;
            return _prev;
        });
    };

    useEffect(() => {
        if (Object.keys(fileQueue).length > 0) {
            let isAllFilesUploadCompleted = true;
            for (let [identifier, uploadStatus] of Object.entries(fileQueue)) {
                if (uploadStatus === false) {
                    isAllFilesUploadCompleted = false;
                    break;
                }
            }
            if (isAllFilesUploadCompleted) {
                onSubmitProceed(speakerFormData);
            }
        }
    }, [fileQueue]);

    const handleCropCancel = (identifier) => {
        if (identifier === 'expSpeakerImage') {
            setSpeakerPreviewImage(defaultSpeakerImageUrl('default.webp'))
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: "456px", // Customize the width here
                },
            }}
        >
            <DialogTitle>
                {/* Modal Title */}

                <div className="mb-0 pe-20">
                    <Typography
                        color="text.primary"
                        className="font-semibold text-[18px] block mb-8 truncate"
                    >
                        {t('addSpeaker_title')}
                    </Typography>
                    <Typography
                        color="text.disabled"
                        className="font-regular text-[11px] block mb-0 truncate"
                    >
                        {t('addSpeaker_subText')}
                    </Typography>
                </div>

                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    {/* <CloseIcon /> */}
                    <FuseSvgIcon className="text-48" size={24} color="action">
                        feather:x
                    </FuseSvgIcon>
                </IconButton>
            </DialogTitle>
            {/* <DialogContent dividers> */}
            <DialogContent
                sx={{
                    padding: "15px 30px !important",
                }}
            >
                <Box className="avatar-upload m-auto mb-20" >
                    <div className="avatar-edit">
                        <OnionFileUpload
                            id="expSpeakerImage"
                            loader={false}
                            accept={"image/jpeg, image/png, image/webp"}
                            maxFileSize={2}
                            multiple={false}
                            autoUpload={autoUpload}
                            buttonClass={"imageUpload"}
                            buttonContent={<FuseSvgIcon className="text-48" size={20} color="paper">
                                heroicons-outline:camera
                            </FuseSvgIcon>}
                            uploadPath={speakerPath}
                            onSelect={handleFileSelect}
                            onProgress={handleProgress}
                            onFileUploadComplete={handleUploadComplete}
                            onSelectingDefectiveFiles={handleDefectiveFiles}
                            onCropCancel={handleCropCancel}
                            cropper={true}
                            aspectRatio={1 / 1}
                        />
                    </div>
                    <div className="avatar-preview">
                        {/* {!uploadStatus &&
                            <Box sx={{ display: 'flex' }}>
                                <CircularProgress />
                            </Box>} */}
                        <div
                            id="imagePreview"
                            style={{ backgroundImage: `url(${speakerPreviewImage ? speakerPreviewImage : speakerImageUrl(image)})` }}
                        ></div>
                    </div>

                </Box>
                <div className='text-center'>
                    <Typography
                        color="text.primary"
                        className="font-medium text-[12px] block mb-8 opacity-50"
                    >
                        {t('addSpeaker_supportedFileText')}
                    </Typography>
                    <Typography
                        color="text.primary"
                        className="font-regular text-[11px] block mb-0 opacity-50"
                    >
                        {t('addSpeaker_fileSize')}
                    </Typography>
                </div>

                <div className="mt-24 mb-0 w-full ">
                    <Box
                        component="form"
                        sx={{
                            "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <form
                            name="SpeakerAddForm"
                            noValidate
                            spellCheck={false}
                            className="mt-20 flex flex-col justify-center space-y-20"
                            onSubmit={handleSubmit(onSubmit)}
                            autoComplete="off"
                        >
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('schedule_speakerFirstName')}
                                        autoFocus
                                        required
                                        type="expoName"
                                        error={!!errors.firstName}
                                        helperText={t(errors?.firstName?.message)}
                                        variant="outlined"
                                        fullWidth
                                        className='!mb-0'
                                    />
                                )}
                            />
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('schedule_speakerLastName')}
                                        required
                                        type="lastName"
                                        error={!!errors.lastName}
                                        helperText={t(errors?.lastName?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            /><Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('schedule_speakerEmail')}
                                        required
                                        type="email"
                                        error={!!errors.email}
                                        helperText={t(errors?.email?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                            <Controller
                                name="designation"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('schedule_designation')}
                                        required
                                        type="designation"
                                        error={!!errors.designation}
                                        helperText={t(errors?.designation?.message)}
                                        variant="outlined"
                                        fullWidth
                                        className='!mb-0'
                                    />
                                )}
                            />
                            <Controller
                                name="organisation"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t('schedule_organisation')}
                                        required
                                        type="organisation"
                                        error={!!errors.organisation}
                                        helperText={t(errors?.organisation?.message)}
                                        variant="outlined"
                                        fullWidth
                                        className='!mb-0'
                                    />
                                )}
                            />
                        </form>
                    </Box>
                </div>
            </DialogContent >

            <DialogActions
                sx={{
                    padding: "20px !important",
                }}
            >
                <Button
                    className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
                    variant="outlined"
                    color="primary"
                    onClick={onClose}
                    sx={{
                        borderColor: "primary.main",
                        border: "1px solid",
                        "&:hover": {
                            border: "1px solid",
                            borderColor: "primary.main",
                            backgroundColor: "primary.main",
                            color: "background.paper",
                        },
                    }}
                >
                    {t('common_cancel')}
                </Button>

                <Button
                    className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
                    variant="contained"
                    color="primary" onClick={handleSubmit(onSubmit)}
                    sx={{
                        // borderWidth: 2,
                        border: "1px solid",
                        borderColor: "primary.main",
                        backgroundColor: "primary.main",
                        color: "background.paper",
                        "&:hover": {
                            border: "1px solid",
                            borderColor: "primary.main",
                            backgroundColor: "primary.main",
                            color: "background.paper",
                            opacity: "0.8",
                        },
                    }}
                >
                    {t('common_save')}
                </Button>
            </DialogActions>
        </Dialog >

    );
}

export default SpeakerAddForm;
