import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { setState, useScheduleDispatch, useSchedulesSelector } from '../SchedulesSlice';
import { AddScheduleAPI } from '../apis/Add-Schedule-Api';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getHallDetailsAPI } from '../apis/Get-Hall-Details';
import { getSpeakerList } from '../apis/Get-Speakers-Api';
import { format, isAfter, isBefore } from 'date-fns';
import _ from 'lodash';
import FuseLoading from '@fuse/core/FuseLoading';
import SpeakerAddForm from './SpeakerAddForm';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import OnionSelector from 'app/shared-components/components/OnionSelector';
import Box from '@mui/material/Box';
import { isDefaultLobby } from 'src/utils/common';
import moment from 'moment';

const defaultValues = {
    schName: '',
    schStartDateTime: null,
    schEndDateTime: null,
    schHallId: '',
    schType: '',
    schDescription: '',
    schAgenda: '',
    schDuration: '',
    schParticipantLink: '',
    schBackstageLink: '',
    schSpeakerLink: '',
    schStreamingLink: '',
    ssUserId: []
};

type ExpoDetails = {
    id: string,
    expType: string,
    expStartDate: any,
    expEndDate: any
}

type FormData = {
    schName: string,
    schStartDateTime: Date,
    schEndDateTime: string,
    schHallId: string,
    schType: string,
    schDescription?: string,
    schAgenda?: string,
    schDuration?: string,
    schParticipantLink?: string,
    schBackstageLink?: string,
    schSpeakerLink?: string,
    schStreamingLink?: string,
    ssUserId?: string[]
};

type Duration = {
    label: string;
    value: string;
};


function ScheduleAddForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation('schedules');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatchRefresh = useScheduleDispatch();
    const state = useSchedulesSelector((state) => state.state.value);
    const [expoDetails, setExpoDetails] = useState<ExpoDetails>();
    const [hallDetails, setHallDetails] = useState([]);
    const [halls, setHalls] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [expStartDate, setExpStartDate] = useState<Date | undefined>();
    const [expEndDate, setExpEndDate] = useState<Date | undefined>();
    const [selectedExpoType, setSelectedExpoType] = useState('');
    const [expoId, setExpoId] = useState('');
    const [open, setOpen] = useState(false);
    const routeParams = useParams();
    const [newSpeakerPresent, setNewSpeakerPresent] = useState(false);
    const [duration, setDuration] = useState<Duration[]>([]);
    const [isSsUserIdSelected, setIsSsUserIdSelected] = useState(false);
    const [isFieldSelect, setFieldSelect] = useState(false);
    const [speakerLoading, setSpeakerLoading] = useState(true);

    const getDuration = () => {
        const durations: Duration[] = [];
        for (let i = 15; i <= 12 * 60; i += 15) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;

            let label = '';
            if (hours > 0) {
                label += `${hours} hour${hours > 1 ? 's' : ''}`;
            }
            if (minutes > 0) {
                label += `${hours > 0 ? ' ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
            }

            durations.push({
                label: label,
                value: i.toString(),
            });
        }
        setDuration(durations); // Update state with the array of durations
    };

    type FieldTypeArray = {
        name: string;
        value: string;
    };

    useEffect(() => {
        getInitialDetails();
        getDuration();
    }, []);

    useEffect(() => {
        setImportantDetails();
    }, [expoDetails, state]);

    const setImportantDetails = async () => {
        if (expoDetails) {
            const expoId = expoDetails.id;
            setExpoId(expoId);
            const hallDetails = await getHallDetailsAPI(expoDetails.id);
            const hallNames: FieldTypeArray[] = hallDetails?.map((hall: any) => ({
                value: hall.id,
                name: isDefaultLobby(hall.hallName) ? t(hall.hallName) : hall.hallName
            }));
            setExpEndDate(expoDetails?.expEndDate);
            setExpStartDate(expoDetails?.expStartDate);
            setSelectedExpoType(expoDetails?.expType);
            setHallDetails(hallDetails || []);
            setHalls(hallNames || []);
            const speakerDetails = await getSpeakerList();
            const speakers: FieldTypeArray[] = speakerDetails?.map((speaker: any) => ({
                value: speaker._id,
                name: `${speaker.firstName} ${speaker.lastName}`,
                _id: speaker._id
            }));
            setSpeakers(speakers);
            setSpeakerLoading(false);
        }
    };

    const getInitialDetails = async () => {
        const expoDetails = await LocalCache.getItem(
            cacheIndex.expoDetails + "_" + routeParams.id,
            getSingleExpoAPI.bind(this, routeParams.id)
        );
        setExpoDetails(expoDetails.data.expo);
    };

    const createSchema = () => z.object({
        schName: z
            .string()
            .min(1, 'schedule_scheduleNameRequiredMessage')
            .max(50, 'schedule_scheduleNameMaxLengthMessage')
            .refine(value => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value), 'schedule_scheduleNameEmailInvalidMessage')
            .refine(value => !/^(ftp|http|https):\/\/[^ "]+$/.test(value), 'schedule_scheduleNameUrlInvalidMessage')
            .refine(value => !/^\s/.test(value), 'schedule_scheduleNameLeadingSpaceMessage')
            .refine(value => value.trim().length > 0, 'schedule_scheduleNameSpacesOnlyMessage'),
        schStartDateTime: z.date()
            .nullable()
            .refine(date => date !== null, {
                message: 'schedules_scheduleStartDateTimeRequiredMessage',
            })
            .refine(date => {
                if (!date) return false;

                const now = new Date();

                // Check if selected date is today
                const isToday = date.toDateString() === now.toDateString();

                // If the selected date is today, check if the selected time is in the future
                if (isToday && date.getTime() < now.getTime()) {
                    return false;
                }

                return true;
            }, {
                message: 'schedules_scheduleStartDateTimePastMessage',
            })
            .refine(date => {
                if (!date) return false;

                const expStartDate = new Date(expoDetails.expStartDate);
                const expEndDate = new Date(expoDetails.expEndDate);

                // Adjust the expEndDate to include the full day
                expEndDate.setHours(23, 59, 59, 999);

                return date >= expStartDate && date <= expEndDate;
            }, {
                message: 'schedules_scheduleStartDateTimeInvalidRangeMessage',
            }),
        schDuration: z.string()
            .min(2, 'schedules_durationRequiredMessage')
            .refine(value => duration.some(d => d.value === value), 'Invalid duration value'),
        schHallId: z.string().min(1, 'schedules_hallRequiredMessage'),
        schType: z.string().min(1, 'schedules_typeRequiredMessage'),
        schDescription: z
            .string()
            .max(200, 'schedules_scheduleDescriptionMaxLengthMessage')
            .refine(value => !/^\s/.test(value), 'schedules_scheduleDescriptionLeadingSpaceMessage')
            .nullable(),

        schSpeakerLink: z.string().optional().refine((value) => !value || /^(ftp|http|https):\/\/[^ "]+$/.test(value), {
            message: 'schedules_speakerLinkvalidUrlMessage'
        }),
        schParticipantLink: z.string().optional().refine((value) => !value || /^(ftp|http|https):\/\/[^ "]+$/.test(value), {
            message: 'schedules_participantLinkvalidUrlMessage'
        }),
        schBackstageLink: z.string().optional().refine((value) => !value || /^(ftp|http|https):\/\/[^ "]+$/.test(value), {
            message: 'schedules_backStagevalidUrlMessage'
        }),
        schStreamingLink: z.string().optional().refine((value) => !value || /^(ftp|http|https):\/\/[^ "]+$/.test(value), {
            message: 'schedules_streamingvalidUrlMessage'
        }),
        schAgenda: z.string().optional(),
        ssUserId: z.array(z.string()).optional(),
    })
        .superRefine((data, ctx) => {
            if (data.schType === 'Streaming' && !data.schStreamingLink) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'schedules_streamingLinkRequiredMessage',
                    path: ["schStreamingLink"],
                });
            }
            if (data.schType === 'Video Conference' && !data.schParticipantLink) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'schedules_participantLinkRequiredMessage',
                    path: ["schParticipantLink"],
                });
            }
            if (data.schType === 'Video Conference' && !data.schSpeakerLink) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'schedules_speakerLinkRequiredMessage',
                    path: ["schSpeakerLink"],
                });
            }
        });

    const schema = createSchema();

    const { control, handleSubmit, formState, setValue, watch, getValues } = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: zodResolver(schema)
    });

    const { isValid, dirtyFields, errors } = formState;

    const scheduleType = expoDetails?.expType === 'Hybrid' ? [
        { name: t('schedule_type_streaming'), value: 'Streaming' },
        { name: t('schedule_type_vc'), value: 'Video Conference' },
        { name: t('schedule_type_offline'), value: 'Offline' },
    ] : expoDetails?.expType === 'Online' ? [
        { name: t('schedule_type_streaming'), value: 'Streaming' },
        { name: t('schedule_type_vc'), value: 'Video Conference' },
    ] : expoDetails?.expType === 'Offline' ? [
        { name: t('schedule_type_offline'), value: 'Offline' },
    ] : [];

    useEffect(() => {
        if (expoDetails?.expType === 'Offline') {
            setValue('schType', 'Offline');
        }
    }, [expoDetails, setValue]);

    function addMinutesToDate(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60000);
    }

    const onSubmit = async (formData: FormData) => {
        try {
            setIsLoading(true);
            const schDuration = parseInt(formData.schDuration, 10);
            const schEndDateTime = addMinutesToDate(formData.schStartDateTime, schDuration);
            const payload = {
                schExpoId: expoDetails.id,
                ...(formData.ssUserId && { ssUserId: formData.ssUserId }),
                schName: formData.schName,
                schStartDateTime: formData.schStartDateTime,
                schEndDateTime: schEndDateTime,
                schType: formData.schType,
                schHallId: formData.schHallId,
                schDuration: schDuration,
                schDescription: formData.schDescription,
                ...(formData.schAgenda !== null && { schAgenda: formData.schAgenda }),
                ...(formData.schType === 'Video Conference' && { schSpeakerLink: formData.schSpeakerLink }),
                ...(formData.schType === 'Video Conference' && { schParticipantLink: formData.schParticipantLink }),
                ...(formData.schBackstageLink && { schBackstageLink: formData.schBackstageLink }),
                ...(formData.schType === 'Streaming' && { schStreamingLink: formData.schStreamingLink || '' }),
            };
            const response = await AddScheduleAPI(payload);
            if (response?.statusCode === 201) {
                await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + routeParams.id)
                dispatch(showMessage({ message: t('schdules_addSchedule_successMessage'), variant: 'success' }));
                setIsLoading(false);
                dispatchRefresh(setState(!state));
                if (newSpeakerPresent) {
                    navigate(-2);
                    setNewSpeakerPresent(false);
                } else {
                    navigate(-1)
                }
            } else {
                dispatch(showMessage({ message: t('schdules_addSchedule_failedMessage'), variant: 'error' }));
                setIsLoading(false);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || 'Server error';
            dispatch(showMessage({ message: errorMessage, variant: 'error' }));
            setIsLoading(false);
        }
    };

    if (!expoDetails) {
        return <FuseLoading />;
    }

    const expoStartDate = new Date(expoDetails.expStartDate);
    const expoEndDate = new Date(expoDetails.expEndDate);

    const shouldDisableDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return isBefore(date, today) || isBefore(date, expoStartDate) || isAfter(date, expoEndDate);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const schType = watch('schType');

    const addNewSpeaker = (newSpeakers) => {
        setNewSpeakerPresent(true);
        const newSpeaker = {
            value: newSpeakers._id,
            name: `${newSpeakers.firstName} ${newSpeakers.lastName}`,
            _id: newSpeakers._id
        };
        const existingSpeakers = getValues('ssUserId') || [];
        const selectedSpeakers = [...existingSpeakers, newSpeaker.value];

        setSpeakers([...speakers, newSpeaker]);
        setValue('ssUserId', selectedSpeakers);
    };

    const handleFieldSelectChange = (selected) => {
        if (selected === 'ssUserId') {
            setIsSsUserIdSelected(true);
        }
        setFieldSelect(selected);
    };


    const shouldShowSpeakerLink = expoDetails.expType !== 'Offline' && (schType === 'Video Conference');
    const shouldShowParticipantLink = expoDetails.expType !== 'Offline' && (schType === 'Video Conference');
    const shouldShowBackstageLink = expoDetails.expType !== 'Offline' && (schType === 'Video Conference');
    const shouldShowStreamingLink = expoDetails.expType !== 'Offline' && (schType === 'Streaming')

    const formatDateTime = (date: Date | null) => {
        if (!date) return '';
        const formattedDate = format(date, 'MMMM d yyyy'); // e.g., "August 24, 2024"
        const formattedTime = format(date, 'h:mm a'); // e.g., "3:00 PM"
        return `${formattedDate}, ${formattedTime}`;
    };


    return (
        <>
            <OnionSidebar
                title={t("schedule_addSchedule_title")}
                exitEndpoint={`/admin/expo-management/expo/${expoDetails.id}/manage/schedule`}
                sidebarWidth='small'
                footer={true}
                footerButtonClick={handleSubmit(onSubmit)}
                footerButtonLabel={t("common_save")}
                footerButtonSize='full'
                footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
                isFooterButtonLoading={isLoading}
            >

                <form
                    name="ScheduleAddForm"
                    noValidate
                    spellCheck={false}
                    className="mt-[-10px] flex flex-col justify-center "
                    onSubmit={handleSubmit(onSubmit)}
                    autoComplete="off"
                >

                    <div className='mb-[30px]'>
                        <div className='mb-[10px]'>
                            <OnionSubHeader title={t("schedule_sessions")}
                                subTitle={t("schedule_addSessionsText")} />
                        </div>
                        <Controller
                            name="schName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '2px',
                                        },
                                    }}
                                    {...field}
                                    label={t("schedule_name")}
                                    autoFocus
                                    type="schName"
                                    required
                                    error={!!errors.schName}
                                    helperText={t(errors?.schName?.message)}
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    <div className='mb-[30px]'>
                        <div className='mb-[10px]'>
                            <OnionSubHeader title={t("schedule_timeSlot")}
                                subTitle={t("schedule_addScheduleTimeSlot")} />
                        </div>
                        <div className='space-y-28'>
                            <div>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Controller
                                        name="schStartDateTime"
                                        control={control}
                                        render={({ field: { onChange, value } }) => {
                                            const now = new Date();

                                            const isToday = value && value.toDateString() === now.toDateString();

                                            const minSelectableTime = isToday && now.getHours() >= 12
                                                ? new Date(now.setMinutes(now.getMinutes(), 0, 0))
                                                : undefined;

                                            const defaultTimeValue = isToday && now.getHours() >= 12 && value && value.getHours() < 12
                                                ? minSelectableTime
                                                : value;

                                            return (
                                                <DateTimePicker
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderWidth: '2px',
                                                    },
                                                    '& .MuiSvgIcon-root': {
                                                        color: '#6F43D6',
                                                    },
                                                }}u
                                                    label={t('schedule_schStartDateTime')}
                                                    slotProps={{
                                                        textField: {
                                                            helperText: t(errors?.schStartDateTime?.message),
                                                            error: !!errors.schStartDateTime,
                                                            type: "schStartDateTime",
                                                            required: true,
                                                            variant: "outlined",
                                                            fullWidth: true,
                                                            InputProps: {
                                                                value: formatDateTime(value),
                                                            },
                                                        }
                                                    }}
                                                    value={defaultTimeValue || null}
                                                    disablePast={true}
                                                    minDate={new Date()} // Disable past dates
                                                    minTime={isToday ? minSelectableTime : undefined} // Disable AM times if it’s PM and the selected date is today
                                                    onChange={onChange}
                                                    shouldDisableDate={shouldDisableDate}
                                                    defaultCalendarMonth={new Date(expoDetails.expStartDate)}
                                                />
                                            );
                                        }}
                                    />
                                </LocalizationProvider>

                            </div>

                            <div className='mb-[30px]'>
                                <Controller
                                    name="schDuration"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.schDuration}>
                                            <InputLabel required id="schDuration-label">{t('schedules_duration')}</InputLabel>
                                            <Select
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderWidth: '2px',
                                                    },
                                                }}
                                                labelId="schDuration-label"
                                                id="schDuration"
                                                {...field}
                                                label={t('schedules_addForm_duration')}
                                                required
                                                value={field.value}
                                            >
                                                <MenuItem value="">Select</MenuItem>
                                                {duration.map((item) => (
                                                    <MenuItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.schDuration && <FormHelperText>{t(errors.schDuration.message)}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                            </div>


                            {/* <div>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Controller
                                        name="schEndDateTime"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <DateTimePicker
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderWidth: '2px',
                                                    },
                                                }}
                                                label={t('schedule_schEndDateTime')}
                                                slotProps={{
                                                    textField: {
                                                        helperText: errors?.schEndDateTime?.message,
                                                        error: !!errors.schEndDateTime,
                                                        type: "schEndDateTime",
                                                        required: true,
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                    }
                                                }}
                                                value={value || null}
                                                onChange={onChange}
                                                shouldDisableDate={shouldDisableDate}
                                                defaultCalendarMonth={new Date(expoDetails.expStartDate)}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </div> */}
                        </div>
                    </div>

                    <div className='mb-[30px]'>
                        <div className='mb-[10px]'>
                            <OnionSubHeader title={t("schedule_hallSelectionTitle")}
                                subTitle={t("schedule_addScheduleHallSubtitle")} />
                        </div>
                        <Controller
                            name="schHallId"
                            control={control}
                            rules={{ required: t('schedule_hall_requiredMessage') }}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.schHallId}>
                                    <InputLabel id="schHallId-label">{t('schedule_halls_req')}</InputLabel>
                                    <Select
                                        sx={{ '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' } }}
                                        labelId="schHallId-label"
                                        id="schHallId"
                                        {...field}
                                        label={t('schedule_halls_req')}
                                    >
                                        <MenuItem value="">Select</MenuItem>
                                        {halls.map((hall) => (
                                            <MenuItem key={hall.value} value={hall.value}>
                                                {hall.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.schHallId && <FormHelperText>{t(errors.schHallId.message)}</FormHelperText>}
                                </FormControl>
                            )}
                        />
                    </div>

                    {expoDetails.expType !== 'Offline' &&
                        <div className='mb-[30px]'>
                            <div className='mb-[10px]'>
                                <OnionSubHeader title={t("schedule_type_title")}
                                    subTitle={t("schedule_type_subTitle")} />
                            </div>
                            <div className='space-y-28'>
                                <div>
                                    <Controller
                                        name="schType"
                                        control={control}
                                        rules={{ required: t('schedule_type_requiredMessage') }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.schType}>
                                                <InputLabel id="schType-label">{t('schedule_type')}</InputLabel>
                                                <Select
                                                    sx={{ '& .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' } }}
                                                    labelId="schType-label"
                                                    id="schType"
                                                    {...field}
                                                    label={t('schedule_type')}
                                                >
                                                    <MenuItem value="">Select</MenuItem>
                                                    {scheduleType.map((type) => (
                                                        <MenuItem key={type.value} value={type.value}>
                                                            {type.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.schType && <FormHelperText>{t(errors.schType.message)}</FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>}
                    <div className='mb-[30px]'>
                        <div>
                            <Controller
                                name="schDescription"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '2px',
                                            },
                                        }}
                                        multiline
                                        label={t("schedule_schDescription")}
                                        placeholder={t('schedule_placeHolder')}
                                        {...field}
                                        rows={6}
                                        fullWidth
                                        error={!!errors.schDescription}
                                        helperText={t(errors?.schDescription?.message)}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className='mb-[10px]'>
                        <div className='mb-[10px]'>
                            <OnionSubHeader title={t("schedule_speakersTitle")}
                                subTitle={t("schedule_addSpeakerSubtitle")} button={true} buttonLabel={t('common_add')}
                                onClick={handleClickOpen} />
                        </div>
                    </div>

                    <Box className='w-full mb-[30px]' sx={{
                        "& .MuiFormControl-root": {
                            width: "100%",
                        }
                    }}>
                        <Controller
                            name="ssUserId"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <OnionSelector
                                    isLoading={speakerLoading}
                                    data={speakers}
                                    value={value}
                                    onChangeComplete={(newValue) => {
                                        onChange(newValue);
                                        handleFieldSelectChange('ssUserId');
                                    }}
                                    label={t('schedule_speakers')}

                                />
                            )}
                        />
                    </Box>
                    {shouldShowSpeakerLink && (
                        <div className='mb-[30px]'>
                            <div className='mb-[10px]'>
                                < OnionSubHeader title={t("schedule_speakerLink_title")}
                                    subTitle={t("schedule_speakerLink_subTitle")} />
                            </div>
                            <Controller
                                name="schSpeakerLink"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '2px',
                                            },
                                        }}
                                        {...field}
                                        required={expoDetails.expType !== 'Offline' && schType === 'Video Conference'}
                                        label={t("schedule_speakerLink_title")}
                                        type="schSpeakerLink"
                                        error={!!errors.schSpeakerLink}
                                        helperText={t(errors?.schSpeakerLink?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    )}

                    {shouldShowParticipantLink && (
                        <div className='mb-[30px]'>
                            <div className='mb-[10px]'>
                                <OnionSubHeader title={t("schedule_participantLink_title")}
                                    subTitle={t("schedule_participantLink_subTitle")} />
                            </div>
                            <Controller
                                name="schParticipantLink"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '2px',
                                            },
                                        }}
                                        {...field}
                                        required={expoDetails.expType !== 'Offline' && schType === 'Video Conference'}
                                        label={t("schedule_participantLink_title")}
                                        type="schParticipantLink"
                                        error={!!errors.schParticipantLink}
                                        helperText={t(errors?.schParticipantLink?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    )}

                    {shouldShowBackstageLink && (
                        <div className='mb-[30px]'>
                            <div className='mb-[10px]'>
                                <OnionSubHeader title={t("schedule_backStageLink_title")}
                                    subTitle={t("schedule_backStageLink_subTitle")} />
                            </div>
                            <Controller
                                name="schBackstageLink"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '2px',
                                            },
                                        }}
                                        label={t("schedule_backStageLink_title")}
                                        type="schBackstageLink"
                                        error={!!errors.schBackstageLink}
                                        helperText={t(errors?.schBackstageLink?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    )}

                    {shouldShowStreamingLink && (
                        <div className='mb-[30px]'>
                            <div className='mb-[10px]'>
                                <OnionSubHeader title={t("schedule_streamingLink_title")}
                                    subTitle={t("schedule_streamingLink_subTitle")} />
                            </div>
                            <Controller
                                name="schStreamingLink"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '2px',
                                            },
                                        }}
                                        label={t("schedule_streamingLink_title")}
                                        type="schStreamingLink"
                                        required={schType === 'Streaming' && expoDetails.expType !== 'Offline'}
                                        error={!!errors.schStreamingLink}
                                        helperText={t(errors?.schStreamingLink?.message)}
                                        variant="outlined"
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    )}

                </form>
            </OnionSidebar>

            <SpeakerAddForm open={open} onClose={() => handleClose()} expoId={routeParams.id} addNewSpeaker={addNewSpeaker} />
        </>
    );
}

export default ScheduleAddForm;
