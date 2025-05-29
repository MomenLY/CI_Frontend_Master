import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import _ from '@lodash';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodError, ZodIssue } from 'zod';
import { SignUpPayload, useAuth } from '../../../auth/AuthRouteProvider';
import { Alert, CircularProgress, ClickAwayListener, IconButton, InputAdornment, InputLabel, OutlinedInput, styled, Tooltip, tooltipClasses, TooltipProps, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useDebounce } from '@fuse/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsApi } from '../apis/Settings-Api';
import OnionPasswordPreview from 'app/shared-components/components/OnionPasswordPreview';
import { Visibility, VisibilityOff } from '@mui/icons-material';
/**
 * Form Validation Schema
 */
const defaultValues = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	passwordConfirm: '',
	acceptTermsConditions: false
};

type PasswordForm = {
	passwordRange: number;
	requireMinimumOneNumerical: boolean;
	resetPasswordAfterFirstLogin: boolean;
	requireMinimumOneCapitalLetter: boolean;
	requireMinimumOneSpecialCharacter: boolean;
	enforcePasswordResetAfterPasswordResetedByAdmin: boolean;
};

function JwtSignUpTab() {
	const dispatch = useAppDispatch();
	const { jwtService } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [prevData, setPrevData] = useState<PasswordForm>();
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [open, setOpen] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

	const handleUpdate = useDebounce((data: any) => {
		if (data?.message.message[0] == 'User accounts created successfully' || data?.message.message[0] == 'User Account Creation Successfully') {
			dispatch(showMessage({ message: data?.message.message[0] || 'User created', variant: 'success' }));
		} else {
			dispatch(showMessage({ message: data?.message.message[0] || 'User created', variant: 'warning' }));
		}
		setTimeout(() => {
			navigate('/confirmation')
		}, 200);
	}, 300);

	const getPasswordData = async () => {
		const passwordData = await SettingsApi({ settingsKey: 'password' })
		if (passwordData) {
			setPrevData(passwordData)
		};
	};

	useEffect(() => {
		getPasswordData();
	}, [])

	const schema = z
		.object({
			firstName: z.string().nonempty(`${t('youMustEnterYourName')}`),
			lastName: z.string().nonempty(`${t('youMustEnterYourLastName')}`),
			email: z.string().email(`${t('youMustEnterAValidEmail')}`).nonempty(`${t('youMustEnterAnEmail')}`),
			password: z
				.string()
				.nonempty(`${t('enterYourPassword')}`)
				.min(prevData?.passwordRange || 6, `${t("passwordMustBeAtLeast")} ${prevData?.passwordRange || 6} ${t('characters')}`)
				.regex(prevData?.requireMinimumOneCapitalLetter ? /[A-Z]/ : /(?:)/, prevData?.requireMinimumOneCapitalLetter && { message: `${t('passwordMustIncludeAtLeastOneCapitalLetter')}` })
				.regex(prevData?.requireMinimumOneNumerical ? /[0-9]/ : /(?:)/, prevData?.requireMinimumOneNumerical && { message: `${t('passwordMustIncludeAtLeastANumerical')}` })
				.regex(prevData?.requireMinimumOneSpecialCharacter ? /[!@#$%^&*(),.?":{}|<>]/ : /(?:)/, prevData?.requireMinimumOneSpecialCharacter && { message: `${t('passwordMustIncludeAtLeastASpecialCharacter')}` }),
			passwordConfirm: z.string().nonempty(`${t('passwordConfirmationIsRequired')}`),
			acceptTermsConditions: z.boolean().refine((val) => val === true, `${t('theTermsAndConditionsMustBeAccepted')}`)
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: `${t('mustMatchTheAbovePassword')}`,
			path: ['passwordConfirm']
		});

	const { control, formState, handleSubmit, setError } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: SignUpPayload) {
		const { firstName, lastName, email, password } = formData;
		setIsLoading((prev) => !prev);
		jwtService
			.signUp({
				firstName,
				lastName,
				password,
				email
			})
			.then((response) => {
				const userData = response?.data
				if (userData) {
					handleUpdate(userData);
				}
				// No need to do anything, registered user data will be set at app/auth/AuthRouteProvider
			})
			.catch(
				(
					error: AxiosError<
						{
							type: 'email' | 'password' | 'acceptTermsConditions' | `root.${string}` | 'root';
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
			dispatch(showMessage({ message: `${errors.root.message}`, variant: 'error' }));
		}
	}, [errors.root])

	useEffect(() => {
		if (!errors.password) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}, [errors.password])

	const handleClickShowPassword = () => {
		setShowPassword((show) => !show)
	};

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleClickShowConfirmPassword = () => {
		setShowConfirmPassword((show) => !show)
	};

	const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const handleMouseUpConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};


	return (
		<div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
			{/* <img
				className="w-48"
				src="assets/images/logo/logo.svg"
				alt="logo"
			/> */}

			<Typography className="mt-32 text-4xl font-bold leading-tight tracking-tight">
				{t('signUp')}
			</Typography>
			<div className="mt-2 flex items-baseline font-medium">
				<Typography>{t('alreadyHaveAnAccount')}</Typography>
				<Link
					className="ml-4"
					to="/sign-in"
				>
					{t('signIn')}
				</Link>
			</div>
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
						name="firstName"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mb-24"
								label={t('firstName')}
								autoFocus
								type="name"
								error={!!errors.firstName}
								helperText={errors?.firstName?.message}
								variant="outlined"
								required
								fullWidth
							/>
						)}
					/>
					<Controller
						name="lastName"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mb-24"
								label={t('lastName')}
								type="name"
								error={!!errors.lastName}
								helperText={errors?.lastName?.message}
								variant="outlined"
								required
								fullWidth
							/>
						)}
					/>

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
							<FormControl className="w-full md:max-w-[335px] mb-20" variant="outlined" error={!!errors.password}>
								<InputLabel htmlFor="outlined-adornment-password">
									{t('password')}
								</InputLabel>

								<OnionPasswordPreview
									isOpen={open}
									onClose={() => setOpen(false)}
									password={field.value}
								>
									<OutlinedInput
										{...field}
										id="outlined-adornment-password"
										type={showPassword ? 'text' : 'password'}
										label={t('password')}
										error={!!errors.password}
										onChange={(e) => {
											field.onChange(e);
											if (errors.password) {
												setOpen(true)
											}
										}}
										endAdornment={
											<InputAdornment position="end">
												<IconButton
													aria-label="toggle password visibility"
													onClick={handleClickShowPassword}
													onMouseDown={handleMouseDownPassword}
													onMouseUp={handleMouseUpPassword}
													edge="end"
												>
													{showPassword ? <Visibility /> : <VisibilityOff />}
												</IconButton>
											</InputAdornment>
										}
									/>
								</OnionPasswordPreview>
								<FormHelperText>
									{errors?.password?.message}
								</FormHelperText>
							</FormControl>
						)}
					/>
					<Controller
						name="passwordConfirm"
						control={control}
						render={({ field }) => (
							<FormControl className="w-full md:max-w-[335px] mb-24" variant="outlined" error={!!errors.passwordConfirm}>
								<InputLabel htmlFor="outlined-adornment-password">
									{`${t('password')}(${t('confirm')})`}
								</InputLabel>
								<OutlinedInput
									{...field}
									id="outlined-adornment-password"
									type={showConfirmPassword ? 'text' : 'password'}
									label={`${t('password')}(${t('confirm')})`}
									error={!!errors.passwordConfirm}
									endAdornment={
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={handleClickShowConfirmPassword}
												onMouseDown={handleMouseDownConfirmPassword}
												onMouseUp={handleMouseUpConfirmPassword}
												edge="end"
											>
												{showConfirmPassword ? <Visibility /> : <VisibilityOff />}
											</IconButton>
										</InputAdornment>
									}
								/>
								<FormHelperText>
									{errors?.passwordConfirm?.message}
								</FormHelperText>
							</FormControl>
						)}
					/>
					<Controller
						name="acceptTermsConditions"
						control={control}
						render={({ field }) => (
							<FormControl
								className="items-center"
								error={!!errors.acceptTermsConditions}
							>
								<FormControlLabel
									label={t('iAgreeToTheTermsOfServiceAndPrivacyPolicy')}
									control={
										<Checkbox
											size="small"
											{...field}
										/>
									}
								/>
								<FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
							</FormControl>
						)}
					/>

					<Button
						variant="contained"
						color="secondary"
						className="mt-24 w-full"
						aria-label="Register"
						disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
						type="submit"
						size="large"
					>
						{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('signUp')}
					</Button>
				</form>
			</ClickAwayListener>
		</div>
	);
}

export default JwtSignUpTab;
