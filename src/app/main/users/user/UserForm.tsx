import { Button, FormGroup, TextField, Typography, MenuItem, CircularProgress } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { useDebounce } from '@fuse/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { RoleSelectorAPI } from '../apis/Role-Selector-Api';
import { AddUserAPI } from '../apis/Add-User-Api';
import { useCallback, useEffect, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { debounce } from 'lodash';
import LocalCache from 'src/utils/localCache';
import { setState, useUsersDispatch, useUsersSelector } from '../UsersSlice';
import { Onion } from 'src/utils/consoleLog';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getRoles } from 'app/shared-components/cache/cacheCallbacks';
import OnionSelector from 'app/shared-components/components/OnionSelector';


const defaultValues = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	role: []
};

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: string[];
};

const schema = z.object({
	firstName: z.string().nonempty('You must enter your name.'),
	lastName: z.string().nonempty('You must enter your name.'),
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
	password: z
		.string()
		.nonempty('Please enter your password.'),
	// .min(8, 'Password is too short - should be 8 chars minimum.'),
	role: z.array(z.string()).nonempty('You must enter a role.')
});

function UserForm() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [roleData, setRoleData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const dispatchRefresh = useUsersDispatch();
	const state = useUsersSelector((state) => state.state.value);

	const GetAllAdmins = useCallback(
		debounce(async () => {
			const roles = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
			setRoleData(roles ? roles : {});
		}, 300),
		[]
	);

	useEffect(() => {
		GetAllAdmins();
	}, []);

	const { control, formState, handleSubmit } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: t('newUserAddedSuccess'), variant: 'success' }));
		navigate('/admin/users');
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {
		const data = formData;
		setIsLoading((prev) => !prev);
		try {
			const response = await AddUserAPI({ data });
			const result = response?.data;

			if (result) {
				handleUpdate();
				dispatchRefresh(setState(!state));
			}
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;
			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || 'Server error', variant: 'error' }));
				setIsLoading((prev) => !prev);
			}
		}
	};

	return (
		<OnionSidebar
			title={t('addUser')}
			exitEndpoint="/admin/users"
			sidebarWidth='small'
			footer={true}
			footerButtonClick={handleSubmit(onSubmit)}
			footerButtonLabel={t('save')}
			footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
			footerButtonSize='medium'
			isFooterButtonLoading={isLoading}
		>
			<OnionSubHeader
				title={t('basicInfo')}
				subTitle={t('userBasicInfoHelpText')}
			/>
			<form
				name="UserAddForm"
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
							label={t("firstName")}
							autoFocus
							type="firstName"
							error={!!errors.firstName}
							helperText={errors?.firstName?.message}
							variant="outlined"
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
							label={t("lastName")}
							autoFocus
							type="lastName"
							error={!!errors.lastName}
							helperText={errors?.lastName?.message}
							variant="outlined"
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
							label={t("email")}
							autoFocus
							type="email"
							error={!!errors.email}
							helperText={errors?.email?.message}
							variant="outlined"
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
							label={t("password")}
							autoFocus
							type="text"
							error={!!errors.password}
							helperText={errors?.password?.message}
							variant="outlined"
							fullWidth
						/>
					)}
				/>
				<Controller
					name="role"
					control={control}
					render={({ field: { onChange, value } }) => (
						<OnionSelector
							data={roleData}
							value={value}
							onChangeComplete={onChange}
							label={t('roles')}
						/>
					)}
				/>
			</form>
		</OnionSidebar>
	);
}

export default UserForm;
