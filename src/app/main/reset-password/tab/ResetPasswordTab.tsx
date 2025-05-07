import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import _ from '@lodash';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordAPI } from '../apis/Reset-Password-Api';
import { useDebounce } from '@fuse/hooks';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsApi } from '../../sign-up/apis/Settings-Api';
import { CircularProgress, ClickAwayListener, Tooltip } from '@mui/material';
import { log } from 'console';
import OnionPasswordPreview from 'app/shared-components/components/OnionPasswordPreview';
import { useSelector } from 'react-redux';
import { selectUser, selectUserRole, selectUserSettings } from 'src/app/auth/user/store/userSlice';
import { setUserRole } from 'src/app/auth/user/store/adminSlice';
import { useAuth } from 'src/app/auth/AuthRouteProvider';


type FormType = {
	password: string;
};

type PasswordForm = {
	passwordRange: number;
	requireMinimumOneNumerical: boolean;
	resetPasswordAfterFirstLogin: boolean;
	requireMinimumOneCapitalLetter: boolean;
	requireMinimumOneSpecialCharacter: boolean;
	enforcePasswordResetAfterPasswordResetedByAdmin: boolean;
};


function ResetPasswordTab() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { id } = useParams();
	const [prevData, setPrevData] = useState<PasswordForm>();
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [open, setOpen] = useState<boolean>(false);
	const user = useSelector(selectUser);
	const { jwtService } = useAuth();

	// Get specific user details
	// const userRole = useSelector(selectUserRole);
	const userSettings = useSelector(selectUserSettings);
	const userRole_ = useSelector((state:any) => state.userList.userRole);
	const userRole = useSelector((state:any)=> state.userList.loggedUser)

	const getPasswordData = async () => {
		const passwordData = await SettingsApi({ settingsKey: 'password' })
		if (passwordData) {
			setPrevData(passwordData)
		};
	};

	console.log(userRole_,"from userRole reduer");
	
	console.log(userRole.role,"logged user from loggedReducer");
	

	useEffect(() => {
		getPasswordData();
	},[])

	const schema = z
		.object({
			password: z
				.string()
				.nonempty(`${t('enterYourPassword')}`)
				.min(prevData?.passwordRange || 6, `${t("passwordMustBeAtLeast")} ${prevData?.passwordRange || 6} ${t('characters')}`)
				.regex(prevData?.requireMinimumOneCapitalLetter ? /[A-Z]/ : /(?:)/, prevData?.requireMinimumOneCapitalLetter && { message: `${t('passwordMustIncludeAtLeastOneCapitalLetter')}` })
				.regex(prevData?.requireMinimumOneNumerical ? /[0-9]/ : /(?:)/, prevData?.requireMinimumOneNumerical && { message: `${t('passwordMustIncludeAtLeastANumerical')}` })
				.regex(prevData?.requireMinimumOneSpecialCharacter ? /[!@#$%^&*(),.?":{}|<>]/ : /(?:)/, prevData?.requireMinimumOneSpecialCharacter && { message: `${t('passwordMustIncludeAtLeastASpecialCharacter')}` }),
			passwordConfirm: z.string().nonempty(`${t('passwordConfirmationIsRequired')}`)
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: `${t('mustMatchTheAbovePassword')}`,
			path: ['passwordConfirm']
		});

	const defaultValues = {
		password: '',
		passwordConfirm: ''
	};

	const PasswordTip = () => {
		return (
			<div className='flex flex-col space-y-2'>
				{prevData?.passwordRange && <span>* {t('shouldContainAtLeast')} {prevData?.passwordRange} {t('letters')}</span>}
				{prevData?.requireMinimumOneCapitalLetter && <span>* {t('shouldContainMinimum1CapitalLetter')}</span>}
				{prevData?.requireMinimumOneNumerical && <span>* {t('shouldContainMinimum1Numerical')}</span>}
				{prevData?.requireMinimumOneSpecialCharacter && <span>* {t('shouldContainMinimum1SpecialCharacter')}</span>}
			</div>
		);
	}

	const { control, formState, handleSubmit, reset, watch, clearErrors, setError } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const handleUpdate = useDebounce(() => {
		jwtService.refreshAccess();
		dispatch(showMessage({ message: `${t('passwordResetSuccessfully')}`, variant: 'success' }));
		reset(defaultValues);
		setTimeout(() => {
			dispatch(setUserRole(userRole.role));
			navigate('/admin/dashboard');
			setIsLoading((prev) => !prev);
		}, 200);
	}, 300);

	const { isValid, dirtyFields, errors } = formState;

	const watchFeild = watch(["password", "passwordConfirm"]);
	useEffect(() => {
		watch((value, { name }) => {
			if (
				value.password === value.passwordConfirm &&
				value.password &&
				value.passwordConfirm !== ""
			) {
				clearErrors("passwordConfirm");
			}
			if (
				value.password !== value.passwordConfirm &&
				value.passwordConfirm !== ""
			) {
				setError("passwordConfirm", {
					message: `${t('mustMatchTheAbovePassword')}`,
				});
			}
		});
	}, [watch().password, watch().passwordConfirm]);

	useEffect(() => {
		if (!errors.password) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}, [errors.password])

	async function onSubmit(formData: FormType) {
		const { password } = formData;
		setIsLoading((prev) => !prev);
		const data = {
			password,
			token: id
		}
		try {
			const response = await resetPasswordAPI({ data });
			const result = response?.data;
			if (result) {
				handleUpdate();
			}
		} catch (error) {
			const errorMesssage = error?.response?.data?.message
			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || 'Invalid Link', variant: 'error' }));
			}
			reset(defaultValues);
			setIsLoading((prev) => !prev);
		}

	}

	return (
		<div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
			<img
				className="w-48"
				src="assets/images/logo/logo.svg"
				alt="logo"
			/>

			<Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
				{t('resetYourPassword')}
			</Typography>
			<Typography className="font-medium">{t('createANewPasswordForYourAccount')}</Typography>
			<ClickAwayListener onClickAway={() => setOpen(false)}>
				<form
					name="registerForm"
					noValidate
					spellCheck={false}
					className="mt-32 flex w-full flex-col justify-center"
					onSubmit={handleSubmit(onSubmit)}
					autoComplete="off"
				>
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<OnionPasswordPreview
								isOpen={open}
								onClose={() => setOpen(false)}
								password={field.value}
							>
								<TextField
									{...field}
									className="mb-24"
									label={t('password')}
									type="password"
									error={!!errors.password}
									helperText={errors?.password?.message}
									variant="outlined"
									required
									fullWidth
									onClick={() => setOpen(true)}
								/>
							</OnionPasswordPreview>
						)}
					/>

					<Controller
						name="passwordConfirm"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mb-24"
								label={`${t('password')}(${t('confirm')})`}
								type="password"
								error={!!errors.passwordConfirm}
								helperText={errors?.passwordConfirm?.message}
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
						{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('resetYourPassword')}
					</Button>

					<Typography
						className="mt-32 text-md font-medium"
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

export default ResetPasswordTab;
