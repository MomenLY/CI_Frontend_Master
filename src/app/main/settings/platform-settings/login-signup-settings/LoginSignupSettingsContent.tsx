import { Button, Checkbox, CircularProgress } from '@mui/material';
import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { Controller, useForm } from 'react-hook-form';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useDebounce } from '@fuse/hooks';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import LayoutCard from './LayoutCard';
import PlatformHeader from '../PlatformHeader';
import { LoginSignupSettingsUpdateAPI } from './apis/Login-Signup-Settings-Update-Api';
import { SettingsApi } from '../../SettingsApi';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';

const defaultValues = {
	signup: true,
	signin: true,
	layout: 'modern',
	isGoogle: false,
	isFacebook: false,
	isApple: false
};

type FormData = {
	signup: boolean;
	signin: boolean;
	layout: string;
	isGoogle: boolean;
	isFacebook: boolean;
	isApple: boolean;
};

type PrevFormData = {
	isSignUpEnabled: boolean;
	isLoginEnabled: boolean;
	layout: string;
	socialMediaLogin: {
		google: boolean;
		facebook: boolean;
		apple: boolean;
	};
};

function LoginSignupSettingsContent() {
	const dispatch = useAppDispatch();
	const [prevData, setPrevData] = React.useState<PrevFormData>();
	const [isLoading, setIsLoading] = React.useState<boolean>(false)
	const { t } = useTranslation();

	const { control, handleSubmit, setValue } = useForm({
		mode: 'onChange',
		defaultValues
	});

	const getLoginSignupData = async () => {
		const loginSignupData = await SettingsApi({ settingsKey: 'signin_signup' });

		if (loginSignupData) {
			setPrevData(loginSignupData);
		}
	};

	React.useEffect(() => {
		getLoginSignupData();
	}, []);

	React.useEffect(() => {
		if (prevData) {
			setValue('signup', prevData?.isSignUpEnabled || true);
			setValue('signin', prevData?.isLoginEnabled || true);
			setValue('layout', `${prevData?.layout}` || 'classic');
			setValue('isGoogle', prevData?.socialMediaLogin?.google || false);
			setValue('isFacebook', prevData?.socialMediaLogin?.facebook || false);
			setValue('isApple', prevData?.socialMediaLogin?.apple || false);
		}
	}, [prevData]);

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: `${t('loginSignUpSettingsUpdated')}`, variant: 'success' }));
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {
		const data = formData;
		setIsLoading((prev) => !prev);
		try {
			const response = await LoginSignupSettingsUpdateAPI(data);
			const result = response?.data;

			if (result) {
				handleUpdate();
			}
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;

			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || `${t('settingsNotFound')}`, variant: 'error' }));
			}
			setIsLoading((prev) => !prev);
		}
	};

	return (
		<OnionPageOverlay>
			<PlatformHeader
				title={t('loginSignUpSettings')}
				subTitle={t('loginSignUpSettings')}
			/>
			<form
				name="loginSignupSettingsForm"
				noValidate
				className="mt-10 flex w-full flex-col justify-center"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Controller
					name="signup"
					control={control}
					render={({ field }) => (
						<FormControl className="mt-10 mb-5">
							<Header
								label={t('signUpSettings')}
								content={t('signUpSettingsHelperText')}
							/>
							<RadioGroup
								row
								aria-labelledby="demo-row-radio-buttons-group-label"
								name="row-radio-buttons-group"
								{...field}
							>
								<FormControlLabel
									value="true"
									control={<Radio />}
									label={t('enableSignUp')}
								/>
								<FormControlLabel
									value="false"
									control={<Radio />}
									label={t('disableSignUp')}
								/>
							</RadioGroup>
						</FormControl>
					)}
				/>

				<Controller
					name="signin"
					control={control}
					render={({ field }) => (
						<FormControl className="mt-10 mb-5">
							<Header
								label={t('loginSettings')}
								content={t('signInSettingsHelperText')}
							/>
							<RadioGroup
								row
								aria-labelledby="demo-row-radio-buttons-group-label"
								name="row-radio-buttons-group"
								{...field}
							>
								<FormControlLabel
									value="true"
									control={<Radio />}
									label={t('enableLogin')}
								/>
								<FormControlLabel
									value="false"
									control={<Radio />}
									label={t('disableLogin')}
								/>
							</RadioGroup>
						</FormControl>
					)}
				/>

				<Controller
					name="layout"
					control={control}
					render={({ field }) => (
						<FormControl className="mt-10 mb-5">
							<Header
								label={t('loginLayout')}
								content={t('loginLayoutHelperText')}
							/>
							<RadioGroup
								className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
								aria-labelledby="demo-row-radio-buttons-group-label"
								name="row-radio-buttons-group"
								{...field}
							>
								<LayoutCard
									imgUrl="assets/images/layouts/login-layouts/login-layout1.svg"
									label={t('loginLayout1HelperText')}
								>
									<FormControlLabel
										value="modernReversed"
										control={<Radio />}
										label={`${t('layout')} 1`}
									/>
								</LayoutCard>
								<LayoutCard
									imgUrl="assets/images/layouts/login-layouts/login-layout2.svg"
									label={t('loginLayout2HelperText')}
								>
									<FormControlLabel
										value="classic"
										control={<Radio />}
										label={`${t('layout')} 2`}
									/>
								</LayoutCard>
								<LayoutCard
									imgUrl="assets/images/layouts/login-layouts/login-layout3.svg"
									label={t('loginLayout3HelperText')}
								>
									<FormControlLabel
										value="modern"
										control={<Radio />}
										label={`${t('layout')} 3`}
									/>
								</LayoutCard>
							</RadioGroup>
						</FormControl>
					)}
				/>
				<div className='flex-col hidden'>
				<Header
					label={t('socialMediaLogin')}
					content={t('socialMediaLoginHelperText')}
				/>
				<Controller
					name="isGoogle"
					control={control}
					render={({ field: { onChange, value } }) => (
						<FormControl>
							<FormControlLabel
								control={
									<Checkbox
										checked={value}
										onChange={onChange}
									/>
								}
								label={t('google')}
							/>
						</FormControl>
					)}
				/>
				<Controller
					name="isFacebook"
					control={control}
					render={({ field: { onChange, value } }) => (
						<FormControl>
							<FormControlLabel
								control={
									<Checkbox
										checked={value}
										onChange={onChange}
									/>
								}
								label={t('facebook')}
							/>
						</FormControl>
					)}
				/>
				<Controller
					name="isApple"
					control={control}
					render={({ field: { onChange, value } }) => (
						<FormControl>
							<FormControlLabel
								control={
									<Checkbox
										checked={value}
										onChange={onChange}
									/>
								}
								label={t('apple')}
							/>
						</FormControl>
					)}
				/>
				</div>
				<div className="flex md:w-1/2 justify-end mt-20 ">
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						disabled={isLoading}
					>
						{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("save")}
					</Button>
				</div>
			</form>
		</OnionPageOverlay> 
	);
}

export default LoginSignupSettingsContent;
