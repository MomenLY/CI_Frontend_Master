import React, { useEffect, useState } from 'react';
import { Typography, Button, TextField, CircularProgress, styled } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { FormControl } from '@mui/base';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import LabelHeader from './LabelHeader';
import { getLanguagesAPI, updateLanguagesAPI } from './apis/LanguageAPI';
import PlatformHeader from '../PlatformHeader';
import LoaderModal from 'app/shared-components/modal/LoaderModel';
import FuseLoading from '@fuse/core/FuseLoading';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';


function LabelSettingsContent() {
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchLoading, setSearchloading] = useState<boolean>(false);
	// useForm hook
	const {
		control,
		watch,
		formState: { dirtyFields, isDirty },
		handleSubmit
	} = useForm({
		mode: 'onChange'
	});
	const [search, setSearch] = useState("");

	const [languages, setLanguages] = useState({});

	const allFields = watch();

	// handle update button
	const onSubmit = async (formData) => {
		const modifiedFields = Object.keys(dirtyFields).filter((field) => dirtyFields[field]);
		const languageDefinitions = {};
		modifiedFields.map((item) => {
			if (
				typeof languages[item] !== 'undefined' &&
				formData[`${item}`] &&
				formData[`${item}`].trim() &&
				formData[`${item}`] !== languages[item]
			)
				languageDefinitions[item] = formData[`${item}`];
		});

		if (Object.keys(languageDefinitions).length > 0) {
			// setLanguages((prevDefinition) => {
			// 	return { ...prevDefinition, ...languageDefinitions };
			// });
			try {
				setIsLoading((prev) => !prev);
				const response = await updateLanguagesAPI(languageDefinitions);

				if (response) {
					dispatch(showMessage({ message: `${t('labelUpdated')}`, variant: 'success' }));
					setIsLoading((prev) => !prev);
				}
			} catch (err) {
				if (err.message) {
					dispatch(showMessage({ message: err.message, variant: 'success' }));
					setIsLoading((prev) => !prev);
				}
			}
		}
	};

	// API call to get default values
	const getDefaultValue = async () => {
		setSearchloading((prev) => !prev);
		try {
			const response = await getLanguagesAPI(search);
			const languageItems = response.items.reduce((_languageItems, item) => {
				_languageItems[item.default.LKey] = item;
				return _languageItems;
			}, {});

			setLanguages(languageItems);
			setSearchloading((prev) => !prev);
		} catch (error) {
			setSearchloading((prev) => !prev);
		}
	};
	useEffect(() => {
		getDefaultValue();
	}, [search]);

	const Span = styled('span')(({ theme }) => ({
		...theme.typography.body1,
		color: 'black',
		backgroundColor: 'yellow'
	}));

	const replacePlaceholdersWithJSX = (definition, placeholders) => {
		// Split the string by placeholders and include the delimiter
		const regex = new RegExp(`(${Object.keys(placeholders).join('|')})`, 'g');
		const parts = definition.split(regex);

		return (
			<>
				{parts.map((part, index) =>
					placeholders[part] ? (
						<React.Fragment key={index}>{placeholders[part]}</React.Fragment>
					) : (
						part
					)
				)}
			</>
		);
	}


	return (
		<OnionPageOverlay>
			<OnionCustomHeader
				label={t('labelSettings')}
				setSearchKeyword={(e) => setSearch(e)}
				button={false}
			/>
			<div className="mt-24">
				<Header
					label={""}
					content={t('labelSettingsHelperText')}
				/>
				<div className="w-full flex flex-row mt-24 mb-24">
					<Typography className="w-1/3 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate ">
						{t('defaultLabel')}
					</Typography>
					<Typography className="w-1/2 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate ">
						{t('customLabel')}
					</Typography>
				</div>
				{searchLoading ? <FuseLoading /> :
					<form
						spellCheck="false"
						name="labeSettingForm"
						noValidate
						className="mt-10 flex w-full flex-col justify-center space-y-24"
						onSubmit={handleSubmit(onSubmit)}
						autoComplete="off"
					>
						{Object.keys(languages).length > 0 &&
							Object.keys(languages).map((key) => (
								<Controller
									key={key}
									name={key}
									control={control}
									defaultValue={languages[key]?.custom?.LDefinition || languages[key]['default']['LDefinition']}
									render={({ field }) => {
										const isError =
											isDirty && (!allFields[key] || !(allFields[key] && allFields[key].trim()));

										let defaultDefinition = languages[key]['default']['LDefinition'];
										let defaultDefinitionJSX = defaultDefinition;

										if (search) {
											const keywordToSplit = new Set(defaultDefinition.match(new RegExp(search, "ig")));
											const placeholders = {};
											if (keywordToSplit.size > 0) {
												for (const _keywordPiece of keywordToSplit) {
													placeholders[_keywordPiece as string] = <Span>{_keywordPiece as any}</Span>
												}
												defaultDefinitionJSX = replacePlaceholdersWithJSX(defaultDefinition, placeholders);
											}
										}

										return (
											<FormControl className="flex flex-row items-center w-full">
												<Typography className="w-1/3 semi-bold">{defaultDefinitionJSX}</Typography>
												<TextField
													{...field}
													multiline={true}
													error={isError}
													id="outlined-basic"
													variant="outlined"
													defaultValue={languages[key]?.custom?.LDefinition || ''}
													className="w-1/2"
													helperText={isError ? `${t('fieldCannotBeEmpty')}` : ''}
												/>
											</FormControl>
										);
									}}
								/>
							))}

						<div className="flex justify-end mt-24">
							<Button
								type="submit"
								variant="contained"
								color="secondary"
								disabled={isLoading}
							>
								{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('Update')}
							</Button>
						</div>
					</form>
				}
			</div>
		</OnionPageOverlay>
	);
}

export default LabelSettingsContent;
