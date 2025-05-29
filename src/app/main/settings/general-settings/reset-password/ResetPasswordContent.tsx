import { zodResolver } from '@hookform/resolvers/zod'
import { Button, CircularProgress, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ResetPasswordWithExistingPassword } from './apis/ResetPasswordAPI'
import { useAppDispatch, useAppSelector } from 'app/store/hooks'
import { selectUser } from 'src/app/auth/user/store/userSlice'
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice'
import Header from '../basic-settings/Header'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { clearScreenDown } from 'readline'
import OnionPasswordPreview from 'app/shared-components/components/OnionPasswordPreview'
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay'
import GeneralSettingsHeader from '../GeneralSettingsHeader'

const defaultValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
}

type FormData = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
}

function ResetPasswordContent() {
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
    const { control, formState, handleSubmit, getValues, watch, trigger, reset, clearErrors } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema),
    });

    const currentPassword = watch('currentPassword');
    const newPassword = watch('newPassword');
    const confirmPassword = watch('confirmPassword');
    const [open, setOpen] = useState<boolean>(false);

    // Custom error conditions
    const isNewPasswordSameAsCurrent = newPassword && newPassword === currentPassword;
    const isConfirmPasswordMismatch = confirmPassword && confirmPassword !== newPassword;

    const { isValid, dirtyFields, errors } = formState;

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
            } else {
                dispatch(showMessage({ message: t(response.message), variant: "error" }));
            }
        } catch (e) {
            console.error("An error occurred during password reset:", e);
            dispatch(showMessage({ message: t('resetPassword_errorMessage'), variant: "error" }));
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
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [errors.newPassword])


    return (
        <OnionPageOverlay>
            <GeneralSettingsHeader
                title={t('resetPassword_heading')}
                subTitle={t('resetPassword_heading')}
            />
            <Header
                label={""}
                content={t('resetPassword_helperText')}
            />
            <form
                name="resetPasswordForm"
                noValidate
                spellCheck={false}
                className="mt-20 flex w-full flex-col justify-center space-y-10"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
            >
                <div className="py-10 ">
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <FormControl className="w-full md:max-w-[335px]" variant="outlined" error={!!errors.currentPassword}>
                                <InputLabel htmlFor="outlined-adornment-password" required>
                                    {t('resetPassword_currentPassword')}
                                </InputLabel>
                                <OutlinedInput
                                    {...field}
                                    id="outlined-adornment-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    label={t('resetPassword_currentPassword')}
                                    required
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
                            <FormControl className="w-full md:max-w-[335px]" variant="outlined" error={!!errors.newPassword || isNewPasswordSameAsCurrent}>
                                <InputLabel htmlFor="outlined-adornment-password" required>
                                    {t('resetPassword_newPassword')}
                                </InputLabel>
                                {/* <OnionPasswordPreview
                                                isOpen={open}
                                                onClose={() => setOpen(false)}
                                                password={field.value}
                                            > */}
                                <OutlinedInput
                                    {...field}
                                    id="outlined-adornment-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    label={t('resetPassword_newPassword')}
                                    required
                                    onChange={(e) => {
                                        field.onChange(e);
                                        // if (errors.newPassword) {
                                        // setOpen(true);
                                        // trigger('confirmPassword')
                                        // }
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
                            <FormControl className="w-full md:max-w-[335px]" variant="outlined" error={!!errors.confirmPassword || isConfirmPasswordMismatch}>
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
                <div className="text-right md:max-w-[600px]">
                    <Button
                        type='submit'
                        className="mx-4 rounded-[10px] font-medium uppercase "
                        variant="contained"
                        color="primary"
                        disabled={_.isEmpty(dirtyFields) || !isValid}
                    >
                        {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('common_save')}
                    </Button>
                </div>
            </form>
        </OnionPageOverlay>
    )
}

export default ResetPasswordContent