import { Controller, useForm } from 'react-hook-form';
import { Box, Button, CircularProgress, FormControl, styled, TextField } from '@mui/material';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useDebounce } from '@fuse/hooks';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { BasicSettingsUpdateAPI } from './apis/Basic-Settings-Update-Api';
import GeneralSettingsHeader from '../GeneralSettingsHeader';
import Header from './Header';
import { SettingsApi } from '../../SettingsApi';
import { useEffect, useState } from 'react';
import OnionFileUpload from 'app/shared-components/onion-file-upload/OnionFileUpload';
import { CircularProgressWithLabel } from 'app/shared-components/onion-file-upload/utils/progressBars';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';

const defaultValues = {
    logo: '',
    favicon: '',
    company_name: '',
    company_address: ''
};

type FormData = {
    logo: string;
    favicon: string;
    company_name: string;
    company_address: string;
};

type PrevFormData = {
    logo: string;
    favicon: string;
    companyName: string;
    address: string;
};

function BasicSettingsContent() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [prevData, setPrevData] = useState<PrevFormData>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [upLoadProgress, setUploadProgress] = useState<any>();

    const schema = z.object({
        logo: z.string().min(1, `${t('youMustUploadALogo')}`),
        favicon: z.string().min(1, `${t('youMustUploadAIcon')}`),
        company_name: z.string()
            .min(1, `${t('youMustEnterACompanyName')}`)
            .refine(value => value.trim() !== '', { message: `${t('inputCannotBeEmptyOrJustWhitespace')}` }),
        company_address: z.string()
            .min(1, `${t('youMustEnterACompanyAddress')}`)
            .refine(value => value.trim() !== '', { message: `${t('inputCannotBeEmptyOrJustWhitespace')}` })
    });

    const { control, formState, handleSubmit, getValues, setValue } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema)
    });

    const { isValid, dirtyFields, errors } = formState;

    const getBasicData = async () => {
        const basicData = await SettingsApi({ settingsKey: 'basic' });

        if (basicData) {
            setPrevData(basicData);
        };
    };

    useEffect(() => {
        getBasicData();
    }, [])

    useEffect(() => {
        if (prevData) {
            setValue('logo', `${prevData?.logo}` || '');
            setValue('favicon', `${prevData?.favicon}` || '');
            setValue('company_name', `${prevData?.companyName}` || '');
            setValue('company_address', `${prevData?.address}` || '');
        }
    }, [prevData])

    const handleUpdate = useDebounce(() => {
        dispatch(showMessage({ message: `${t('basicSettingsUpdated')}`, variant: 'success' }));
        setIsLoading((prev) => !prev);
    }, 300);

    const onSubmit = async (formData: FormData) => {
        const { logo, favicon, company_name, company_address } = formData;
        setIsLoading((prev) => !prev);
        const data = {
            logo,
            favicon,
            company_name,
            company_address
        };
        try {
            const response = await BasicSettingsUpdateAPI(data);
            const result = response?.data;

            if (result) {
                handleUpdate();
            }
        } catch (err) {
            const errorMesssage = err?.response?.data?.message;

            if (errorMesssage) {
                dispatch(showMessage({ message: errorMesssage || 'Settings not found', variant: 'error' }));
                setIsLoading((prev) => !prev);
            }
        }
    };

    const handleUploadComplete = async (result: { status: string; message: string; data: any; id: string }) => {
        const _result = await result?.data;
        if (result.id === 'logo') {
            setValue('logo', _result?.data[0]?.originalname);
        };
        if (result.id === 'favicon') {
            setValue('favicon', _result?.data[0]?.originalname);
        }
    };

    const handleProgress = (progress: {}) => {
        setUploadProgress(progress);
    };

    const UploadProgress = ({ progress }) => {
        return (
            <div className=' w-80 h-80 bg-cover bg-center flex justify-center items-center relative' style={{ backgroundImage: "url('assets/images/logo/logo.svg')" }}>
                <div className=' w-80 h-80 bg-grey-700 bg-opacity-50 flex justify-center items-center'>
                    <CircularProgressWithLabel value={progress} />
                </div>
            </div>
        )
    }

    const handleDefectiveFiles = ({ files }) => {

    }
    return (
        <OnionPageOverlay>
            <GeneralSettingsHeader
                title={t('Basic Settings')}
                subTitle={t('Basic Settings')}
            />
            <form spellCheck="false"
                name="basicSettingsForm"
                noValidate
                className="mt-10 flex w-full flex-col justify-center"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
            >
                <div className="flex w-full flex-col">
                    <Header
                        label={t('logoSettings')}
                        content={t('logoSettingsHelperText')}
                    />
                    <div className="flex-cole md:flex md:space-y-0 space-y-5 md:space-x-16 mt-16 justify-center items-center">
                        <Controller
                            name="logo"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    className="w-full md:w-1/2"
                                    error={!!errors.logo}
                                >
                                    <Box
                                        sx={{
                                            borderColor: 'divider'
                                        }}
                                        className="flex flex-col space-y-20 items-center justify-center w-full h-[298px] rounded-lg cursor-pointer border-3 border-gray-400 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
                                        role="button"
                                    >
                                        {(upLoadProgress?.id === 'logo' && upLoadProgress?.progress < 100) ?
                                            <UploadProgress progress={upLoadProgress?.progress} /> :
                                            <img
                                                className="w-full max-w-64"
                                                src="assets/images/logo/logo.svg"
                                                alt="admin logo"
                                            />}
                                        {(getValues().logo !== null || undefined || "") ? (
                                            <span className='items-center'>{getValues().logo}</span>
                                        ) : (<></>)}
                                        <div className="flex flex-col justify-center items-center text-12 opacity-50">
                                            <text>{t('supportedFiles')}- JPG, JPEG, PNG</text>
                                            <text>({t('fileSizeMin')} 300X300)</text>
                                        </div>
                                        <OnionFileUpload
                                            {...field}
                                            id="logo"
                                            loader={false}
                                            accept={".png"}
                                            maxFileSize={2}
                                            multiple={false}
                                            autoUpload={true}
                                            buttonLabel={t('chooseImage')}
                                            buttonColor={"secondary"}
                                            targetUrl='http://192.168.1.173:3002/file-upload/upload'
                                            onProgress={handleProgress}
                                            onFileUploadComplete={handleUploadComplete}
                                            onSelectingDefectiveFiles={handleDefectiveFiles}
                                        />
                                    </Box>
                                </FormControl>
                            )}
                        />
                        <Controller
                            name="favicon"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    className="w-full md:w-1/2"
                                    error={!!errors.favicon}
                                >
                                    <Box
                                        sx={{
                                            borderColor: 'divider'
                                        }}
                                        className="flex flex-col space-y-20 items-center justify-center w-full h-[298px] rounded-lg cursor-pointer border-3 border-gray-400 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
                                        role="button"
                                    >
                                        {(upLoadProgress?.id === 'favicon' && upLoadProgress?.progress < 100) ?
                                            <UploadProgress progress={upLoadProgress?.progress} /> :
                                            <img
                                                className="w-full max-w-64"
                                                src="assets/images/logo/logo.svg"
                                                alt="admin logo"
                                            />}
                                        {(getValues().favicon !== "" || undefined || null) ? (
                                            <span className='items-center'>{getValues().favicon}</span>
                                        ) : (<></>)}
                                        <div className="flex flex-col justify-center items-center text-12 opacity-50">
                                            <text>{t('supportedFiles')}- JPG, JPEG, PNG</text>
                                            <text>({t('fileSizeMin')} 300X300)</text>
                                        </div>
                                        <OnionFileUpload
                                            {...field}
                                            id="favicon"
                                            loader={false}
                                            accept={".png"}
                                            maxFileSize={1}
                                            multiple={false}
                                            autoUpload={true}
                                            buttonLabel={t('chooseImage')}
                                            buttonColor={"secondary"}
                                            targetUrl='http://192.168.1.72:3001/todo/upload'
                                            onProgress={handleProgress}
                                            onFileUploadComplete={handleUploadComplete}
                                            onSelectingDefectiveFiles={handleDefectiveFiles}
                                        />
                                    </Box>
                                </FormControl>
                            )}
                        />
                    </div>
                </div>
                <div className="w-full flex space-y-28 flex-col">
                    <Header
                        label={t('organisationSettings')}
                        content={t('organisationSettingsHelperText')}
                    />
                    <Controller
                        name="company_name"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                className="space-y-20 md:w-1/3"
                            >
                                <TextField
                                    {...field}
                                    id="outlined-basic"
                                    label={t('companyName')}
                                    variant="outlined"
                                    error={!!errors.company_name}
                                    helperText={errors?.company_name?.message}
                                />
                            </FormControl>
                        )}
                    />
                    <Controller
                        name="company_address"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                className="space-y-20 md:w-1/3"
                            >
                                <TextField
                                    {...field}
                                    id="outlined-multiline-static"
                                    label={t('companyAddress')}
                                    multiline
                                    rows={6}
                                    error={!!errors.company_address}
                                    helperText={errors?.company_address?.message}
                                />
                            </FormControl>
                        )}
                    />
                </div>
                <div className="flex md:w-1/2 justify-end mt-16 ">
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        disabled={isLoading}
                    >
                        {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t('save')}
                    </Button>
                </div>
            </form>
        </OnionPageOverlay>
    );
}

export default BasicSettingsContent;
