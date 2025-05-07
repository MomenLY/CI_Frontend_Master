import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import { AxiosError } from 'axios';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { SettingsApi } from '../../sign-up/apis/Settings-Api';

type FormType = {
	email: string;
	password: string;
	remember?: boolean;
};

const defaultValues = {
	email: '',
	password: '',
	remember: true
};

type PrevPermissionData = {
	isSignUpEnabled: string;
	isLoginEnabled: string;
	layout: string;
	socialMediaLogin: {
		google: boolean;
		facebook: boolean;
		apple: boolean;
	};
};

function jwtSignInTab() {
	const { jwtService } = useAuth();
	const [validatorError, setValidatorError] = useState(false);
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [permission, setPermission] = useState<PrevPermissionData>();
	const [signUpEnabled, setSignUpEnabled] = useState('true');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const schema = z.object({
		email: z
			.string()
			.email(`${t('youMustEnterAValidEmail')}`)
			.nonempty(`${t('youMustEnterAnEmail')}`),
		password: z
			.string()
			.nonempty(`${t('enterYourPassword')}`)
			.min(1, `${t('passwordMustBeAtLeast')} 1 ${t('characters')}`)
	});

	const { control, formState, handleSubmit, getValues, setError, clearErrors,reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const getPermissionData = async () => {
		const permissionData = await SettingsApi({ settingsKey: 'signin_signup' });

		if (permissionData) {
			setPermission(permissionData);
		}
	};

	const handleClickAway = () => {
		if(getValues().email === '' && getValues().password === '') {
			reset();
		}
	}

	useEffect(() => {
		getPermissionData();
	}, []);

	useEffect(() => {
		if (permission) {
			setSignUpEnabled(permission.isSignUpEnabled);
		}
	}, [permission]);

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		const { email, password } = formData;
		setIsLoading((prev) => !prev);
		jwtService
			.signIn({
				email,
				password
			}).then((data) => {
				
			})
			.catch(
				(
					error: AxiosError<
						{
							type: 'email' | 'password' | 'remember' | `root.${string}` | 'root';
							message: string;
						}[]
					>
				) => {
					const errorData = error.response.data;

					errorData.forEach((err) => {
						setError(err.type, {
							type: 'manual',
							message: err.message
						});
					});
				}
			)
			.finally(() => {
				setIsLoading((prev) => !prev); // Set isLoading to false after completion (success or error)
			});
	}

	useEffect(() => {
		if (errors.root) {
			dispatch(
				showMessage({
					message: `${errors.root.message}`,
					variant: 'error',
					autoHideDuration: 10000
				})
			);
		}
	}, [errors.root]);

	useEffect(() => {
		if (errors.root) {
			setValidatorError(false);
			clearErrors();
		}
	}, [getValues().email, getValues().password]);

	return (
		<div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
			<img
				className="w-48"
				src="assets/images/logo/logo.svg"
				alt="logo"
			/>

			<Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
				{t('signIn')}
			</Typography>
			{signUpEnabled === 'true' && (
				<div className="mt-2 flex items-baseline font-medium">
					<Typography>{t('dontHaveAnAccount')}</Typography>
					<Link
						className="ml-4"
						to="/sign-up"
					>
						{t('signUp')}
					</Link>
				</div>
			)}
			<div className="w-full">
			<ClickAwayListener onClickAway={()=>handleClickAway()}>
				<form
					name="loginForm"
					noValidate
					spellCheck={false}
					className="mt-32 flex w-full flex-col justify-center space-y-5"
					onSubmit={handleSubmit(onSubmit)}
				>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mb-16"
								label={t('email')}
								autoFocus
								type="email"
								error={!!errors.email}
								helperText={errors?.email?.message}
								variant="outlined"
								required
								fullWidth
							/>
						)}
					/>

					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								// className="mb-16"
								label={t('password')}
								type="password"
								error={!!errors.password}
								helperText={errors?.password?.message}
								variant="outlined"
								required
								fullWidth
							/>
						)}
					/>
					<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between !mt-20 !mb-10">
						<Controller
							name="remember"
							control={control}
							render={({ field }) => (
								<FormControl>
									<FormControlLabel
										label={t('rememberMe')}
										control={
											<Checkbox
												size="small"
												{...field}
											/>
										}
									/>
								</FormControl>
							)}
						/>

						<Link
							className="text-md font-medium"
							to="/forgot-password"
						>
							{t('forgotPassword')}
						</Link>
					</div>

					<Button
						variant="contained"
						color="secondary"
						className=" mt-16 w-full"
						aria-label="Sign in"
						disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
						type="submit"
						size="large"
					>
						{isLoading === true ? (
							<CircularProgress
								size={25}
								color="inherit"
							/>
						) : (
							t('signIn')
						)}
					</Button>
				</form>
				</ClickAwayListener>
				{/* <div className="mt-32 flex items-center space-x-16">
					<Button
						variant="outlined"
						className="flex-auto"
					>
						<FuseSvgIcon
							size={20}
							color="action"
						>
							feather:facebook
						</FuseSvgIcon>
					</Button>
					<Button
						variant="outlined"
						className="flex-auto"
					>
						<FuseSvgIcon
							size={20}
							color="action"
						>
							feather:twitter
						</FuseSvgIcon>
					</Button>
					<Button
						variant="outlined"
						className="flex-auto"
					>
						<FuseSvgIcon
							size={20}
							color="action"
						>
							feather:github
						</FuseSvgIcon>
					</Button>
				</div> */}
			</div>
		</div>
	);
}

export default jwtSignInTab;
