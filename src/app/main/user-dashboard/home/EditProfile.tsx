import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, TextField, Typography } from '@mui/material';
import { Controller, Form, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import OnionDropdown from 'app/shared-components/components/OnionDropdown';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ImageUpload from 'app/shared-components/components/ImageUpload';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSettings, getUserSession } from 'app/shared-components/cache/cacheCallbacks';
import OnionFileUpload from 'app/shared-components/onion-file-upload/OnionFileUpload';
import { defaultSpeakerImageUrl, defaultUserImageUrl, expoPath, speakerImageUrl, userImageUrl } from 'src/utils/urlHelper';
import { convertImageToDataURL } from 'app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper';
import { SettingsApi } from 'src/app/main/settings/SettingsApi';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { GetUserAPI } from '../../users/apis/Get-User-Api';
import { UpdateUserAPI } from '../../users/apis/Update-User-Api';
import { setState, useUsersDispatch, useUsersSelector } from '../../users/UsersSlice';
import { stat } from 'fs';

const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
};

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
};

interface SpeakerAddFormProps {
    open: boolean;
    onClose: () => void;
    // expoId: string;
    // addNewSpeaker: (newSpeaker: any) => void;
}

type UserData = {
    firstName: string,
    lastName: string,
    email: string,
    userImage: string
}

function EditProfile({ open, onClose }: SpeakerAddFormProps) {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useUsersDispatch();
    const state = useUsersSelector((state) => state.state.value)
    const user = useAppSelector(selectUser)
    const { t } = useTranslation('profileSettings');
    // const dispatchRefresh = useSchedDispatch();
    // const state = useSchedulesSelector((state) => state.state.value);
    const schema = z.object({
        firstName: z.string().min(1, 'profileSettings_firstNameRequiredMessage')
            .refine(value => !/^\s/.test(value), 'profileSettings_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'profileSettings_SpacesOnlyMessage')
            .refine(value => !/\bhttps?:\/\/\S+/i.test(value),
                'profileSettings_NoURLsMessage')
            .refine(value => !/^[^@]+@[^@]+\.[^@]+$/.test(value), 'profileSettings_NoEmailsMessage'),
        lastName: z.string().min(1, 'profileSettings_lastNameRequiredMessage').refine(value => !/^\s/.test(value), 'profileSettings_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'profileSettings_SpacesOnlyMessage')
            .refine(value => !/\bhttps?:\/\/\S+/i.test(value),
                'profileSettings_NoURLsMessage')
            .refine(value => !/^[^@]+@[^@]+\.[^@]+$/.test(value), 'profileSettings_NoEmailsMessage'),
        email: z.string().min(1, 'profileSettings_emailRequiredMessage').email('profileSettings_emailRequiredMessage').refine(value => !/^\s/.test(value), 'profileSettings_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'profileSettings_SpacesOnlyMessage')
            .refine(value => !/\bhttps?:\/\/\S+/i.test(value),
                'profileSettings_NoURLsMessage'),
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { control, formState, handleSubmit, getValues, reset, setValue, clearErrors, watch } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema),
    });
    const [userImagePath, setUserImagePath] = useState('');
    const [upLoadProgress, setUploadProgress] = useState<any>();
    const [userPath, setUserPath] = useState('');
    const [fileQueue, setFileQueue] = useState({});
    const { isValid, dirtyFields, errors } = formState;
    const [userId, setUserRoleId] = useState('');
    const [image, setImage] = useState("");
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [defaultPassword, setDefaultPassword] = useState('');
    const [userPreviewImage, setUserPreviewImage] = useState(defaultUserImageUrl('default.webp'));
    const [userDetails, setUserDetails] = useState<UserData | null>(null);
    const [imageFileErrors, setImageFileErrors] = useState({});

    useEffect(() => {
        getUserDetailsAPI();
    }, [state])

    useEffect(() => {
        if (userDetails) {
            setValue('firstName', userDetails.firstName);
            setValue('lastName', userDetails.lastName);
            setValue('email', userDetails.email);
            setUserPreviewImage((userDetails?.userImage !== '' || userDetails?.userImage !== null) ? (userDetails.userImage !== 'default.webp' ? userImageUrl(userDetails?.userImage) : defaultUserImageUrl('default.webp')) : defaultUserImageUrl('default.webp'))
        }
    }, [userDetails, reset])

    const getUserDetailsAPI = async () => {
        const userDetails = await GetUserAPI({ id: user.uuid });
        if (userDetails.statusCode === 200) {
            setUserDetails(userDetails.data);
            const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
            const userImagePath = settings?.userPath;
            setUserImagePath(userImagePath);
        }
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
                        message: `Invalid File`,
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
        setUserPreviewImage("");
    };

    const [userFormData, setUserFormData] = useState(null);
    const [autoUpload, setAutoUpload] = useState(false);
    const onSubmit = async (data: FormData) => {
        if (Object.keys(fileQueue).length > 0) {
            setAutoUpload(true);
            setUserFormData(data)
        } else {
            onSubmitProceed(data);
        }
    };

    const onSubmitProceed = async (formData: FormData) => {
        setIsLoading(true)
        try {
            const payload = {
                _id: user.uuid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                userImage: image !== "" ? image : userDetails?.userImage,
            };
            const response = await UpdateUserAPI(payload);
            if (response?.data?.statusCode === 200) {
                setIsLoading(false);
                onClose();
                setUserFormData(null);
                dispatch(showMessage({ message: `${t('profileSettings_data_update_success')}`, variant: 'success' }));
                const existingData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
                const { userImage, email, firstName, lastName } = payload;
                if (existingData) {
                    const updatedData = {
                        ...existingData,
                        data: {
                            ...existingData.data,
                            displayName: `${firstName} ${lastName}`,
                            email,
                            userImage,
                            userTimeZone: existingData.data.userTimeZone
                        }
                    };
                    await LocalCache.setItem('userData', updatedData);
                    dispatchRefresh(setState(!state));
                }
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
        if (files.identifier === "userImage") {
            for (let [fileKey, _file] of Object.entries(files.files)) {
                convertImageToDataURL(files.files[fileKey]['file'], setUserPreviewImage);
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
                onSubmitProceed(userFormData);
            }
        }
    }, [fileQueue]);

    const handleCropCancel = (identifier) => {
        if (identifier === 'userImage') {
            setUserPreviewImage(defaultUserImageUrl('default.webp'))
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: "456px",
                },
            }}
        >
            <DialogTitle>
                <div className="mb-0 pe-20">
                    <Typography
                        color="text.primary"
                        className="font-semibold text-[18px] block mb-8 truncate"
                    >
                        {t('profileSettings_editProfile')}
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
                    <FuseSvgIcon className="text-48" size={24} color="action">
                        feather:x
                    </FuseSvgIcon>
                </IconButton>
            </DialogTitle>
            <DialogContent
                sx={{
                    padding: "16px !important",
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <Box className="avatar-upload m-auto mb-20" >
                    <div className="avatar-edit">
                        <OnionFileUpload
                            id="userImage"
                            loader={false}
                            accept={"image/jpeg, image/png, image/webp"}
                            maxFileSize={2}
                            multiple={false}
                            autoUpload={autoUpload}
                            buttonClass={"imageUpload"}
                            buttonContent={<FuseSvgIcon className="text-48" size={20} color="paper">
                                heroicons-outline:camera
                            </FuseSvgIcon>}
                            uploadPath={userImagePath}
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
                        <div
                            id="imagePreview"
                            style={{
                                backgroundImage: `url(${userPreviewImage ? userPreviewImage : userImageUrl(image)})`,
                            }}
                        >
                        </div>
                    </div>

                </Box>
                <div className="text-center">
                    <div className="mt-0 mb-[16px]">
                        <Typography
                            variant="caption"
                            color="primary.main"
                            className="font-semibold text-[12px] block"
                        >
                            {userDetails?.userImage && (userDetails?.userImage !== 'default.webp'
                                ? (userDetails.userImage.length > 45
                                    ? `...${userDetails.userImage.slice(-45)}`
                                    : userDetails.userImage)
                                : "")}

                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.disabled"
                            className="font-normal text-[12px] block"
                        >
                            {t('profileField_supportedFiles')}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.disabled"
                            className="font-normal text-[11px] block"
                        >
                            {t('profileField_maxSize')}
                        </Typography>
                    </div>
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
                            name="UserUpdateForm"
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
                                        label={t('profileSettings_editProfile_firstName')}
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
                                        label={t('profileSettings_editProfile_lastName')}
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
                                        label={t('profileSettings_editProfile_email')}
                                        disabled
                                        type="email"
                                        error={!!errors.email}
                                        helperText={t(errors?.email?.message)}
                                        variant="outlined"
                                        fullWidth
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
                    backgroundColor: (theme) => theme.palette.background.default,
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

export default EditProfile;
