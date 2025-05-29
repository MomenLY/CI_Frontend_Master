import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Controller, Form, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { SettingsApi } from 'src/app/main/settings/SettingsApi';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { ResetPasswordWithExistingPassword } from '../../settings/general-settings/reset-password/apis/ResetPasswordAPI';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';
import Header from '../common/Header';
import GeneralSettingsHeader from '../../settings/general-settings/GeneralSettingsHeader';

const defaultValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
};

type FormData = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
};

interface ResetPasswordProps {
    open: boolean;
    onClose: () => void;
}

function ResetPassword({ open, onClose }: ResetPasswordProps) {
    const { t } = useTranslation('resetPassword');
    const user = useAppSelector(selectUser);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const dispatch = useAppDispatch();
    const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false);

    const schema = z.object({
        currentPassword: z.string()
            .min(1, 'resetPassword_currentPasswordRequiredMessage')
            .refine(value => !/^\s/.test(value), 'resetPassword_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'resetPassword_SpacesOnlyMessage'),
        newPassword: z.string()
            .min(1, 'resetPassword_newPasswordRequiredMessage')
            .refine(value => !/^\s/.test(value), 'resetPassword_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'resetPassword_SpacesOnlyMessage')
            .refine(value => /[0-9]/.test(value), 'resetPassword_newPasswordDigitMessage')
            .refine(value => /[!@#$%^&*(),.?":{}|<>]/.test(value), 'resetPassword_newPasswordSymbolMessage')
            .refine(value => value.length >= 8, 'resetPassword_newPasswordMinLengthMessage'),
        confirmPassword: z.string()
            .min(1, 'resetPassword_confirmPasswordRequiredMessage')
            .refine(value => !/^\s/.test(value), 'resetPassword_LeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'resetPassword_SpacesOnlyMessage'),
    }).superRefine((data, ctx) => {
        if (data.confirmPassword !== data.newPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'resetPassword_confirmPasswordMismatchMessage',
                path: ['confirmPassword'],
            });
        }

        if (data.newPassword === data.currentPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'resetPassword_newPasswordSameAsCurrentMessage',
                path: ['newPassword'],
            });
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { control, formState, handleSubmit, setValue, getValues, watch, trigger, reset, clearErrors } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema),
    });

    const currentPassword = watch('currentPassword');
    const newPassword = watch('newPassword');
    const confirmPassword = watch('confirmPassword');
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);

    const isNewPasswordSameAsCurrent = newPassword && newPassword === currentPassword;
    const isConfirmPasswordMismatch = confirmPassword && confirmPassword !== newPassword;

    const { isValid, dirtyFields, errors } = formState;

    useEffect(() => {
        if (!open) {
            setValue('currentPassword', '');
            setValue('newPassword', '');
            setValue('confirmPassword', '');
        }
    }, [open]);

    const onSubmit = async (formData: FormData) => {
        try {
            const payload = {
                currentPassword: formData.currentPassword,
                newPassword: formData.confirmPassword
            };
            const response = await ResetPasswordWithExistingPassword(user.uuid, payload);
            if (response.success) {
                dispatch(showMessage({ message: t('resetPassword_passwordReset_success'), variant: "success" }));
                reset();
                onClose();
            } else {
                dispatch(showMessage({ message: t(response.message), variant: "error" }));
            }
        } catch (e) {
            console.error("An error occurred during password reset:", e);
            dispatch(showMessage({ message: t("An unexpected error occurred. Please try again."), variant: "error" }));
        }
    };

    const handleClickCurrentShowPassword = () => setShowCurrentPassword((show) => !show);
    const handleClickNewShowPassword = () => setShowNewPassword((show) => !show);

    const handleMouseDownCurrentPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseDownNewPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpCurrentPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpNewPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const cPassword = watch('confirmPassword');
    const nPassword = watch('newPassword');

    useEffect(() => {
        if (cPassword === nPassword) {
            clearErrors('confirmPassword');
            clearErrors('newPassword');
        }
    }, [cPassword, nPassword])

    useEffect(() => {
        if (!errors.newPassword) {
            setPreviewOpen(false);
        } else {
            setPreviewOpen(true);
        }
    }, [errors.newPassword])

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
                        {t('resetPassword_heading')}
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
                <div className="mt-0 mb-0 w-full ">

                    <Box
                        component="form"
                        sx={{
                            "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <form
                            name="resetPasswordForm"
                            noValidate
                            spellCheck={false}
                            className="mt-0 flex w-full flex-col justify-center space-y-10"
                            onSubmit={handleSubmit(onSubmit)}
                            autoComplete="off"
                        >
                            <div className="py-10 ">
                                <Controller
                                    name="currentPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full" variant="outlined" error={!!errors.currentPassword}>
                                            <InputLabel htmlFor="outlined-adornment-password" required>
                                                {t('resetPassword_currentPassword')}
                                            </InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id="outlined-adornment-password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                label={t('resetPassword_currentPassword')}
                                                required
                                                autoFocus
                                                error={!!errors.currentPassword}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickCurrentShowPassword}
                                                            onMouseDown={handleMouseDownCurrentPassword}
                                                            onMouseUp={handleMouseUpCurrentPassword}
                                                            edge="end"
                                                        >
                                                            {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            /><FormHelperText>
                                                {t(errors?.currentPassword?.message)}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </div>
                            <div className="py-10 ">
                                <Controller
                                    name="newPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full" variant="outlined" error={!!errors.newPassword || isNewPasswordSameAsCurrent}>
                                            <InputLabel htmlFor="outlined-adornment-password" required>
                                                {t('resetPassword_newPassword')}
                                            </InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id="outlined-adornment-password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                label={t('resetPassword_newPassword')}
                                                required
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (cPassword !== '' && nPassword === cPassword) {
                                                        trigger('confirmPassword')
                                                    }
                                                }}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickNewShowPassword}
                                                            onMouseDown={handleMouseDownNewPassword}
                                                            onMouseUp={handleMouseUpNewPassword}
                                                            edge="end"
                                                        >
                                                            {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                onBlur={() => setIsNewPasswordTouched(true)}
                                            />
                                            {/* </OnionPasswordPreview> */}
                                            <FormHelperText>
                                                {t(errors.newPassword?.message) || (isNewPasswordSameAsCurrent ? t('resetPassword_newPasswordSameAsCurrentMessage') : '')}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </div>
                            <div className="py-10 ">
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl className="w-full" variant="outlined" error={!!errors.confirmPassword || isConfirmPasswordMismatch}>
                                            <InputLabel htmlFor="outlined-adornment-password" required>
                                                {t('resetPassword_confirmPassword')}
                                            </InputLabel>
                                            <OutlinedInput
                                                {...field}
                                                id="outlined-adornment-password"
                                                type='text'
                                                label={t('resetPassword_confirmPassword')}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (isNewPasswordTouched) {
                                                        trigger('newPassword');
                                                    }
                                                }}
                                            />
                                            <FormHelperText>
                                                {cPassword !== nPassword ? t(errors.confirmPassword?.message) : ''}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </div>
                        </form>
                    </Box>
                </div>
            </DialogContent>
            <DialogActions
                sx={{
                    padding: "20px !important",
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <Button
                    className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
                    variant="contained"
                    disabled={_.isEmpty(dirtyFields) || !isValid}
                    color="primary" onClick={handleSubmit(onSubmit)}
                    sx={{
                        // borderWidth: 2,
                        border: "1px solid",
                        borderColor: "primary.main",
                        // backgroundColor: "primary.main",
                        color: "background.paper",
                        "&:hover": {
                            border: "1px solid",
                            borderColor: "primary.main",
                            // backgroundColor: "primary.main",
                            color: "background.paper",
                            opacity: "0.8",
                        },
                    }}
                >
                    {t('common_save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResetPassword;
