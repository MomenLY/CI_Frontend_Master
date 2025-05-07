import { Button, FormGroup, TextField, Typography, MenuItem, CircularProgress, Select, Checkbox, ListItemText, OutlinedInput, Box, Chip, InputLabel } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { array, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { useNavigate, useParams } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetUserAPI } from '../apis/Get-User-Api';
import { UpdateUserAPI } from '../apis/Update-User-Api';
import { useDebounce } from '@fuse/hooks';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import LocalCache from 'src/utils/localCache';
import { debounce } from 'lodash';
import { RoleSelectorAPI } from '../apis/Role-Selector-Api';
import { Onion } from 'src/utils/consoleLog';
import { setState, useUsersDispatch, useUsersSelector } from '../UsersSlice';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getRoles } from 'app/shared-components/cache/cacheCallbacks';
import OnionSelector from 'app/shared-components/components/OnionSelector';

const defaultValues = {
	firstName: '',
	lastName: '',
	email: '',
	roleIds: ['']
};

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	roleIds: string[];
};

const schema = z?.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email('You must enter a valid email').optional(),
	roleIds: z.array(z.string()).nullable()
});

function UpdateUserForm() {
	const { t } = useTranslation();
	const routeParams = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [userData, setUserData] = useState<FormData>();
	const [roleData, setRoleData] = useState([]);
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const dispatchRefresh = useUsersDispatch();
	const state = useUsersSelector((state) => state.state.value);

	const getUserData = async () => {
		const User = await GetUserAPI({ id: routeParams.id });
		setUserData(User?.data);
		Onion.log('data------------', User)
	};

	const GetAllAdmins = useCallback(
		debounce(async () => {
			const roles = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
			setRoleData(roles ? roles : {});
		}, 300),
		[]
	);

	const { control, formState, handleSubmit, setValue } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		GetAllAdmins();
		getUserData();
	}, []);

	useEffect(() => {
		setValue('firstName', userData?.firstName || '');
		setValue('lastName', userData?.lastName || '');
		setValue('email', userData?.email || '');
		setValue('roleIds', userData?.roleIds || []);
	}, [userData]);

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: t('userUpdatedSuccess'), variant: 'success' }));
		navigate('/admin/users');
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {
		console.log(formData, "ggggggggggg");
		const { firstName, lastName, email, roleIds } = formData;
		setIsLoading((prev) => !prev);
		const data = {
			userId: routeParams.id,
			firstName,
			lastName,
			email,
			roleIds
		};
		try {
			const response = await UpdateUserAPI({ data });
			const result = response?.data;
			if (result) {
				handleUpdate();
				dispatchRefresh(setState(!state));
			};
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;
			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || 'User already exists', variant: 'error' }));
				setIsLoading((prev) => !prev);
			}
		}
	};

	return (

		<OnionSidebar
			title={t('updateUser')}
			exitEndpoint="/admin/users"
			sidebarWidth='small'
			footer={true}
			footerButtonClick={handleSubmit(onSubmit)}
			footerButtonLabel={t('save')}
			// footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
			footerButtonSize='medium'
			isFooterButtonLoading={isLoading}
		>
			<OnionSubHeader
				title={t('editInfo')}
				subTitle={t('editInfoHelper')}
			/>
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
					name="roleIds"
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

export default UpdateUserForm;
