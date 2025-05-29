import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import _ from '@lodash';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordAPI } from './forgotPassword-api';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useDebounce } from '@fuse/hooks';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CircularProgress, ClickAwayListener } from '@mui/material';
/**
 * Form Validation Schema
 */

const defaultValues = {
    email: ''
};

type FormType = {
    email: string;
};
/**
 * THe classic forgot password page.
 */
function ForgotPasswordTab() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const schema = z.object({
        email: z.string().nonempty('youMustEnterAValidEmail').email('youMustEnterAnEmail')
    });

    const { control, formState, handleSubmit, reset, setError,getValues } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema)
    });

    const handleUpdate = useDebounce((data:any) => {
        dispatch(showMessage({ message: data?.message || `${t('resetLinkSendInToYourEmail')}`, variant: 'success' }));
        setTimeout(() => {
            navigate('/sign-in')
            setIsLoading((prev) => !prev);
        }, 200);
    }, 300);

    const { isValid, dirtyFields, errors } = formState;

    const handleClickAway = () => {
		if(getValues().email === '') {
			reset();
		}
	}

    async function onSubmit(formData: FormType) {
        const { email } = formData;
        setIsLoading((prev) => !prev);
        try {
            const response = await forgotPasswordAPI(email);
            const result = response?.data
            if (result) {
                handleUpdate(result);
            }

        } catch (error) {
            const errorMesssage = error?.response?.data?.message
            if (errorMesssage) {
                if(errorMesssage === 'User Not Found')
                dispatch(showMessage({ message: t('userNotFound_ContactAdminMessage') || `${t('emailIsNotFound')}`, variant: 'error', autoHideDuration: 3000 }));
                setError('email', { type: 'email' })   
            }
            setIsLoading((prev) => !prev)
            //reset(defaultValues);
        }
    }

    return (
        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
            {/* <img
                className="w-48"
                src="assets/images/logo/logo.svg"
                alt="logo"
            /> */}

            <Typography className="mt-32 text-4xl font-bold leading-tight tracking-tight">
                {t('forgotPassword')}
            </Typography>
            <div className="mt-2 flex items-baseline font-medium">
                <Typography>{t('fillTheFormToResetYourPassword')}</Typography>
            </div>
            <ClickAwayListener onClickAway={()=>handleClickAway()}>
            <form
                name="registerForm"
                noValidate
                spellCheck={false}
                className="mt-32 flex w-full flex-col justify-center"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
            >
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mb-24"
                            label={t('email')}
                            type="email"
                            error={!!errors.email}
                            helperText={t(errors?.email?.message)}
                            variant="outlined"
                            required
                            fullWidth
                        />
                    )}
                />

                <Button
                    variant="contained"
                    color="secondary"
                    className=" mt-4 w-full"
                    aria-label="Register"
                    disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
                    type="submit"
                    size="large"
                >
                    {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('sendResetLink')}
                </Button>

                <Typography
                    className="mt-32 text-md font-medium flex justify-center"
                    color="text.secondary"
                >
                    <span>{t('returnTo')}</span>
                    <Link
                        className="ml-4"
                        to="/sign-in"
                    >
                        {t('signIn')}
                    </Link>
                </Typography>
            </form>
            </ClickAwayListener>
        </div>
    );
}

export default ForgotPasswordTab;
