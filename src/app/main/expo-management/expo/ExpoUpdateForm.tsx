import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UpdateExpoAPI } from '../apis/Update-Expo-Api';
import { setState, useExpoDispatch, useExpoSelector } from '../ExpoManagementSlice';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import SliderCSV from 'app/shared-components/components/SliderCSV';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { dateFix, expoFormatDate } from 'src/utils/dateformatter';
import { getTimeZoneSettings } from 'src/utils/getSettings';
import moment from 'moment-timezone';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { D } from '@tanstack/react-query-devtools/build/legacy/ReactQueryDevtools-Cn7cKi7o';

const defaultValues = {
  expName: '',
  expType: 'Select',
  expStartDate: null,
  expEndDate: null,
  expDescription: '',
  expLayoutId: 'layout_1'
};

type FieldTypeArray = {
  name: string;
  value: string;
};

type FormData = {
  expName: string;
  expStartDate: Date | null;
  expEndDate: Date | null;
  expDescription: string;
  expType: string;
  expCode: string;
  expRegistrationStartType: string;
  expRegistrationStartBefore: string;
  expRegistrationEndType: string;
  expRegistrationEndBefore: string;
  expLayoutId: string | null;
};

function ExpoUpdateForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();
  const { t } = useTranslation('expoManagement');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expoData, setExpoData] = useState<FormData | null>(null);
  const dispatchRefresh = useExpoDispatch();
  const state = useExpoSelector((state) => state.state.value);
  const [timeZone, setTimeZone] = useState();

  const getExpoData = async () => {
    const expo = await getSingleExpoAPI(routeParams?.id);
    setExpoData(expo?.data?.expo);
    const timeZone = await getTimeZoneSettings();
    setTimeZone(timeZone);
  };

  const schema = z.object({
    expName: z.string()
      .min(1, 'expo_expoNameRequiredMessage')
      .max(50, 'expo_expoNameMaxLengthMessage')
      .refine(value => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value), 'expo_expoNameEmailInvalidMessage')
      .refine(value => !/^(ftp|http|https):\/\/[^ "]+$/.test(value), 'expo_expoNameUrlInvalidMessage')
      .refine(value => !/^\s/.test(value), 'expo_expoNameLeadingSpaceMessage')
      .refine(value => value.trim().length > 0, 'expo_expoNameSpacesOnlyMessage'), expType: z.string().min(1, 'expo_expoTypeRequiredMessage'),
    expStartDate: z.date().refine((date) => date !== null, 'expo_expoStartDateRequiredMessage'),
    expEndDate: z.date().refine((date) => date !== null, 'expo_expoEndDateRequiredMessage'),
    expDescription: z.string().min(1, 'expo_expoDescriptionRequiredMessage'),
    expLayoutId: z.union([
      z.enum(["layout_1", "layout_2", "layout_3", "layout_4", "layout_5", "layout_6", "layout_7", "layout_8"]),
      z.null(),
    ]),
  })
    .superRefine((data, ctx) => {
      if (data.expStartDate > data.expEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'expo_expoEndValidation',
          path: ['expEndDate'],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'expo_expoStartValidation',
          path: ['expStartDate'],
        });
      }
    });

  const { control, formState, handleSubmit, setValue, clearErrors, watch } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const startDate = watch('expStartDate');
  const endDate = watch('expEndDate');
  const expLayoutwatch = watch('expLayoutId');

  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(startDate) <= new Date(endDate)) {
        clearErrors('expStartDate');
        clearErrors('expEndDate');
      }
    }
  }, [startDate, endDate, clearErrors]);

  const expoType: FieldTypeArray[] = [
    { name: t('expo_addExpo_online'), value: 'Online' },
    { name: t('expo_addExpo_offline'), value: 'Offline' },
    { name: t('expo_addExpo_hybrid'), value: 'Hybrid' },
  ];

  useEffect(() => {
    getExpoData();
  }, [state]);

  useEffect(() => {
    if (expoData) {
      setValue('expName', expoData?.expName || '');
      setValue('expStartDate', expoData?.expStartDate ? new Date(expoData?.expStartDate) : null);
      setValue('expEndDate', expoData?.expEndDate ? new Date(expoData?.expEndDate) : null);
      setValue('expDescription', expoData?.expDescription || '');
      setValue('expType', expoData?.expType || '');
      setValue('expLayoutId', expoData?.expLayoutId)
    }
  }, [expoData, setValue]);

  const { isValid, dirtyFields, errors } = formState;

  const adjustDateTimes = (startDate: Date | null, endDate: Date | null) => {
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  };

  const onSubmit = async (formData: FormData) => {
    try {
      let expoDetails = await LocalCache.getItem(
        cacheIndex.expoDetails + "_" + routeParams.id,
        getSingleExpoAPI.bind(this, routeParams.id)
      );
      
      let dateOnlyStartDate1 = dateFix(formData.expStartDate);
      let dateOnlyEndDate1 = dateFix(formData.expEndDate);
      const timeZoneToUse1 = timeZone && timeZone !== '' ? timeZone : moment.tz.guess();
      const momentStartDate = expoFormatDate(dateOnlyStartDate1, false, false, false, timeZoneToUse1, true);
      let dateOnlyStartDate = moment(momentStartDate).format('YYYY-MM-DD');
      const momentEndDate = expoFormatDate(dateOnlyEndDate1 , false, false, false, timeZoneToUse1, true);
      let dateOnlyEndDate = moment(momentEndDate).format('YYYY-MM-DD');


      const { startDate, endDate } = adjustDateTimes(
        dateOnlyStartDate ? new Date(dateOnlyStartDate) : null,
        dateOnlyEndDate ? new Date(dateOnlyEndDate) : null
      );
      // const startDate = formData.expStartDate;
      // const endDate = formData.expEndDate;
      let payload = {
        id: routeParams.id,
        expName: formData.expName,
        expStartDate: startDate,
        expEndDate: endDate,
        expDescription: formData.expDescription,
        expType: formData.expType,
        expRegistrationStartDate: undefined as string | undefined,
        expRegistrationEndDate: undefined as string | undefined,
        expLayoutId: formData?.expLayoutId,
        expCode: expoDetails.data.expo.expCode
      };
      if (expoData.expRegistrationStartType == "Days") {
        const newDate = new Date(formData.expStartDate); // Create a copy of the current date
        const daysToSubtract = parseInt(expoData.expRegistrationStartBefore, 10);
        newDate.setDate(newDate.getDate() - daysToSubtract);
        payload.expRegistrationStartDate = newDate.toISOString();
      }
      if (expoData.expRegistrationEndType == "Days") {
        const newDate = new Date(formData.expStartDate); // Create a copy of the current date
        const daysToSubtract = parseInt(expoData.expRegistrationEndBefore, 10);
        newDate.setDate(newDate.getDate() - daysToSubtract);
        payload.expRegistrationEndDate = newDate.toISOString();
      }
      setIsLoading(true);

      const response = await UpdateExpoAPI(payload);
      if (response.data.statusCode === 200) {
        await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + routeParams.id);
        dispatchRefresh(setState(!state));
        dispatch(showMessage({ message: `${t('expo_updateExpo_successMessage')}`, variant: 'success' }));
        navigate('/admin/expo-management');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message;
      if (errorMessage) {
        dispatch(showMessage({ message: errorMessage || 'Server error', variant: 'error' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const shouldDisableDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <OnionSidebar
      title={t("expo_updateExpo_title")}
      exitEndpoint={-1}
      sidebarWidth="small"
      footer={true}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonLabel={t("common_submit")}
      footerButtonSize="full"
      footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
      isFooterButtonLoading={isLoading}
    >
      <OnionSubHeader
        title={t("expo_eventInfo_title")}
        subTitle={t("expo_updateExpo_subtitle")}
      />
      <form
        name="ExpoUpdateForm"
        noValidate
        spellCheck={false}
        className="mt-20 flex flex-col justify-center space-y-20"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <Controller
          name="expName"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "2px",
                },
              }}
              {...field}
              label={t("expo_expoName")}
              autoFocus
              type="expoName"
              error={!!errors.expName}
              helperText={t(errors?.expName?.message)}
              variant="outlined"
              fullWidth
              required
            />
          )}
        />
        <Controller
          name="expType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.expType}>
              <InputLabel id="expType-label">{t("expo_expoType")}</InputLabel>
              <Select
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "2px",
                  },
                }}
                disabled
                labelId="expType-label"
                id="expType"
                {...field}
                label={t("expo_expoType")}
              >
                <MenuItem value="">Select</MenuItem>
                {expoType.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.expType && (
                <FormHelperText>{t(errors.expType.message)}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <div className={expoData?.expType === "Offline" ? "hidden" : ""}>
          {
            expoData && (
              <SliderCSV
                control={control}
                setValue={setValue}
                expLayoutwatch={expoData?.expLayoutId}
                isDisabled={true}
              />
            )
          }
          {(expoData && expoData?.expLayoutId !== expLayoutwatch && expoData?.expType !== 'Offline') && (
            <div className="rounded-md border-2 border-orange-200 p-5 flex items-start justify-start">
              <span
                className='py-5 pr-10'
                size="large"
              >
                <FuseSvgIcon>material-outline:info</FuseSvgIcon>
              </span>
              <FormHelperText className="">
                {t('layout_update_warning_message')}
              </FormHelperText>
            </div>
          )}
        </div>
        <LocalizationProvider dateAdapter={AdapterMoment} dateLibInstance={moment}>
          <Controller
            name="expStartDate"
            control={control}
            render={({ field: { onChange, value } }) => {
              const timeZoneToUse = timeZone && timeZone !== '' ? timeZone : moment.tz.guess();
              const formattedDate = value ? expoFormatDate(expoData?.expStartDate, false, false, false, timeZoneToUse, true) : null;
              return (
                <DatePicker
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "2px",
                    },
                  }}
                  label={t("expo_startDate")}
                  slotProps={{
                    textField: {
                      helperText: t(errors?.expStartDate?.message || ""),
                      error: !!errors.expStartDate,
                      variant: "outlined",
                      fullWidth: true,
                      required: true,
                    },
                  }}
                  value={formattedDate}
                  onChange={(date) => {
                    if (date) {
                      onChange(date ? date.toDate() : null);
                    } else {
                      onChange(null);
                    }
                  }}
                  shouldDisableDate={shouldDisableDate}
                />
              );
            }}
          />
        </LocalizationProvider>


        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Controller
            name="expEndDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "2px",
                  },
                }}
                label={t("expo_endDate")}
                slotProps={{
                  textField: {
                    helperText: t(errors?.expEndDate?.message),
                    error: !!errors.expEndDate,
                    variant: "outlined",
                    fullWidth: true,
                    required: true,
                  },
                }}
                value={new Date(value)}
                onChange={onChange}
                shouldDisableDate={shouldDisableDate}
              />
            )}
          />
        </LocalizationProvider>
        <Controller
          name="expDescription"
          control={control}
          render={({ field }) => (
            <TextField
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "2px",
                },
              }}
              multiline
              {...field}
              label={t("expo_expoDesc")}
              rows={6}
              placeholder={t("expo_placeHolder")}
              error={!!errors.expDescription}
              helperText={t(errors?.expDescription?.message)}
              variant="outlined"
              required
            />
          )}
        />
      </form>
    </OnionSidebar>
  );
}

export default ExpoUpdateForm;
