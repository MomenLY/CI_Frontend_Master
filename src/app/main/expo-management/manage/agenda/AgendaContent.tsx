import { Divider, IconButton, Paper, Switch, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ImageDetails from "app/shared-components/components/ImageDetails";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useTranslation } from "react-i18next";
import BasicListTable from "app/shared-components/components/BasicListTable";
import { differenceInMinutes, format } from "date-fns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { makeStyles } from "@mui/styles";
import { useNavigate, useParams } from "react-router";
import { defaultExpoImageUrl, expoImageUrl } from 'src/utils/urlHelper';
import { setState, useAgendaDispatch, useAgendaSelector } from "./AgendaSlice";
import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { sendNotification } from "./apis/Send-Notification-Apis";
import { expoFormatDate, formatDate, scheduleDateFormat, scheduleTimeFormat } from "src/utils/dateformatter";
import { useTheme } from "@mui/material/styles";
import { tenantPrefix } from "src/utils/tenantHelper";
import { sendBoothManagerNotification } from "./apis/send-booth-manager-notification-api";
import { getTimeZoneSettings } from "src/utils/getSettings";

const CssTextField = styled(TextField)({
    "& label.Mui-focused": {
        color: "#A0AAB4",
    },
    "& .MuiInput-underline:after": {
        borderBottomColor: "#E0E3E7",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "#E0E3E7",
        },
        "&:hover fieldset": {
            borderColor: "#E0E3E7",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#E0E3E7",
        },
    },
});

type Expos = {
    id: string;
    expName: string;
    expCreator: string;
    expDescription: string;
    expEndDate: string;
    expStartDate: string;
    expImage: string;
    expCode: string;
    expPrice: number;
    expStatus: string;
};

type ExpoDetails = {
    expo: any;
    schedules: any;
    speakers: any
}

type Props = {
    isMismatch?: boolean;
};

const expoImage = import.meta.env.VITE_EXPO_IMAGE

const image = import.meta.env.VITE_EXPO_IMAGE
function AgendaContent({ isMismatch }: Props) {
    const routeParams = useParams();
    const [expoDetails, setExpoDetails] = useState<ExpoDetails | null>(null);
    const [expos, setExpos] = useState<Expos | null>(null);
    const [expoLink, setExpoLink] = useState('');
    const [joinLink, setJoinLink] = useState('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { t } = useTranslation('agenda');
    const [expoImage, setExpoImage] = useState('');
    const [schedules, setSchedules] = useState([]);
    const dispatchRefresh = useAgendaDispatch();
    const state = useAgendaSelector((state) => state.state.value);
    const [agendaData, setAgendaData] = useState([]);
    const [addAttendeeLink, setAddAttendeeLink] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [notifySpeakersAttendees, setNotifySpeakersAtendees] = useState(false);
    const [notifyBoothManager, setNotifyBoothManager] = useState(false);
    const theme = useTheme();
    const [timeZone, setTimeZone] = useState();
    const useStyles = makeStyles((theme: any) => ({
        tableHead: {
            fontWeight: "600",
            fontSize: "12px",
            color: theme.palette.text.primary,
            padding: '12px',
        },
        link: {
            color: `${theme.palette.primary.main} !important`,
            textDecoration: "none !important",
            fontWeight: "600",
            fontSize: "12px",
        },
        tableBody: {
            fontWeight: "400",
            fontSize: "14px !important",
            color: theme.palette.text.primary,
            padding: '14px',
        },
    }));

    const classes = useStyles(theme);

    useEffect(() => {
        getInitialDetails();
        setExpoImage(image)
    }, [state]);

    useEffect(() => {
        const organizedData = schedules?.reduce((acc, current) => {
            const { hallid, hallName, ...rest } = current;
            if (!acc[hallid]) {
                acc[hallid] = { hallid, hallName, events: [] };
            }
            acc[hallid].events.push(rest);
            return acc;
        }, {});
        const organizedDataArray = Object.keys(organizedData).map(key => organizedData[key]);
        setAgendaData(organizedDataArray);
    }, [schedules]);

    useEffect(() => {
        handleAgendaData();
    }, [agendaData]);

    const handleAgendaData = () => {
        if (agendaData) {
            agendaData.map((agenda) => {
                agenda.events.map((event) => {
                    const formattedDateTime = scheduleDateFormat(event.schStartDateTime, true, timeZone);
                })
            })
        }
    }

    const getInitialDetails = async () => {
        const expoDetails = await getSingleExpoAPI(routeParams.id);
        if (expoDetails === null || expoDetails.data === null) {
            dispatch(showMessage({ message: `${t('agendaContent_network_issue_message')}`, variant: 'error' }))
        } else {
            const timeZone = await getTimeZoneSettings();
            setTimeZone(timeZone);
            if (expoDetails.data.expo || expoDetails.data !== undefined || expoDetails.data !== null || expoDetails !== null) {
                await LocalCache.setItem(cacheIndex.expoDetails + "_" + routeParams.id, expoDetails);
            }
            if (expoDetails.data !== undefined || expoDetails.data !== null || expoDetails !== null) {
                const expos = expoDetails.data.expo;
                const schedules = expoDetails.data.schedules;
                setExpoDetails(expoDetails.data);
                setSchedules(schedules);
                setExpos(expos);
                const domain = document.location.origin;
                const addAttendeeLink = `${domain}/admin/expo/attendee/${routeParams.id}`;
                setAddAttendeeLink(addAttendeeLink);
                const expoLink = `${domain}/${tenantPrefix}${expoDetails.data.expo.expTenantId}/events/${expoDetails.data.expo.expCode}`;
                const joinLink1 = `${domain}/${tenantPrefix}${expoDetails.data.expo.expTenantId}/events/join/${expoDetails.data.expo.expCode}`;
                setExpoLink(expoLink);
                setJoinLink(joinLink1);
            } else {
                dispatch(
                    showMessage({
                        message: t('agenda_noExpo'),
                        variant: "error",
                    })
                );
            }
        }
    };

    const copyExpoLink = () => {
        navigator.clipboard.writeText(expoLink).then(
            () => {
                dispatch(
                    showMessage({
                        message: t('agenda_expoLink_success_copy'),
                        variant: "success",
                    })
                );
            },
            (err) => {
                dispatch(
                    showMessage({
                        message: t('agenda_expoLink_failed_copy'),
                        variant: "error",
                    })
                );
            }
        );
    }

    const copyAddAttendeeLink = () => {
        navigator.clipboard.writeText(addAttendeeLink).then(
            () => {
                dispatch(
                    showMessage({
                        message: t('agenda_addAttendeeFormLink_copied'),
                        variant: "success",
                    })
                );
            },
            (err) => {
                console.error('Could not copy text: ', err);
                dispatch(
                    showMessage({
                        message: "Failed to copy",
                        variant: "error",
                    })
                );
            }
        );
    }

    const getDuration = (startDateTime, endDateTime) => {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const durationInMinutes = differenceInMinutes(end, start);
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    const handleEdit = (id: string) => {
        navigate(`edit/${id}`);
        dispatchRefresh(setState(!state));
    }

    const handleNotification = async () => {
        try {
            if (isMismatch || !expos.expStatus) {
                dispatch(showMessage({ message: t('agenda_sendButtonCondition_message'), variant: 'warning' }))
            } else {
                setIsLoading(true);
                const response = await sendNotification(expoDetails.expo.expCode, document.location.origin);
                if (response?.data?.data?.attendees === 0 && response?.data?.data?.speakers === 0) {
                    dispatch(showMessage({ message: t('agenda_noRecipients_message'), variant: 'warning' }))
                }
                if (response?.data?.data?.success === true) {
                    dispatch(showMessage({ message: t('agenda_email_sent_success'), variant: 'success' }));
                }
            }
        } catch (e) {
            dispatch(showMessage({ message: t('agenda_email_sending_failed'), variant: 'error' }))
            console.log(e, "error from notify")
            throw e;
        } finally {
            setIsLoading(false);
            setNotifySpeakersAtendees(false);
        }
    }

    const [boothManagerNotifyLoading, setBoothManagerNotifyLoading] = useState(false);
    const [isBoothManagerNotifyDisabled, setIsBoothManagerNotifyDisabled] = useState(false);

    const handleNotifyBoothManager = async () => {
        try {
            setBoothManagerNotifyLoading(true);
            setIsBoothManagerNotifyDisabled(true);

            const response = await sendBoothManagerNotification(expoDetails.expo.expCode);
            const { success, successfulEmails = [], failedEmails = [], error } = response?.data?.data || {};

            if (success) {
                const successfulEmailCount = successfulEmails.length;
                if (successfulEmailCount > 0) {
                    dispatch(showMessage({
                        message: t('booth_manager_email_sent_success', { count: successfulEmailCount }),
                        variant: 'success',
                    }));
                } else {
                    dispatch(showMessage({
                        message: t('booth_manager_noRecipients_message'),
                        variant: 'warning',
                    }));
                }
            } else if (error && error.includes('No booths found for expo')) {
                dispatch(showMessage({
                    message: t('booth_manager_no_booths_error'),
                    variant: 'error',
                }));
            } else {
                dispatch(showMessage({
                    message: t('booth_manager_email_sending_failed'),
                    variant: 'error',
                }));
            }
        } catch (error) {
            console.error(error, 'Error from booth manager notification');
            dispatch(showMessage({
                message: t('booth_manager_email_sending_failed'),
                variant: 'error',
            }));
        } finally {
            setBoothManagerNotifyLoading(false);
            setIsBoothManagerNotifyDisabled(false);
            setNotifyBoothManager(false);
        }
    };

    const renderSpeakers = (speakers) => {
        let speakerElement = [];
        if (speakers) {
            let _speakers = speakers.split(', ');
            let totalSpeakers = _speakers.length;
            if (totalSpeakers) {
                let counter = 1;
                _speakers.forEach((speaker, index) => {
                    speakerElement.push(<div key={index}>{speaker}{counter < totalSpeakers ? "," : ""}</div>);
                    counter++;
                });
            }
        }
        return speakerElement;
    }

    const handleClick = () => {
        setIsDisabled(true)
        if (notifyBoothManager) {
            handleNotifyBoothManager()
        }
        if (notifySpeakersAttendees) {
            handleNotification()
        }
    }

    useEffect(() => {
        if (notifyBoothManager || notifySpeakersAttendees) {
            setIsDisabled(false);
        }
        if (notifyBoothManager && notifySpeakersAttendees) {
            setIsDisabled(false);
        }
        if (!notifyBoothManager && !notifySpeakersAttendees) {
            setIsDisabled(true);
        }
    }, [notifyBoothManager, notifySpeakersAttendees]);

    const shouldSendEmailAttendeeSpeakers = () => {
        if (isMismatch || !expos.expStatus) {
            setNotifySpeakersAtendees(false);
            dispatch(showMessage({
                message: t('agenda_sendButtonCondition_message'),
                variant: 'warning'
            }));
        } else {
            setNotifySpeakersAtendees(!notifySpeakersAttendees);
        }
    }

    const scheduleTime = (startTime) => {
        let formattedStartTime = format(new Date(startTime), "hh:mm a");
        return formattedStartTime;
    }

    return (
        <>
            <div className="flex flex-col w-full pb-[50px]">
                <div className="mb-20">
                    <Typography
                        color="text.primary"
                        variant=""
                        className="font-semibold text-[13px] block mb-6"
                    >
                        {t('agenda_title')}
                    </Typography>
                    <Typography
                        color="text.disabled"
                        variant="caption"
                        className="font-normal text-[11px] block"
                    >
                        {t('agenda_subTitle')}
                    </Typography>

                    <div className="my-20 max-w-[760px] w-full">
                        {expos && (
                            <ImageDetails
                                handleEdit={() => handleEdit(expos.id)}
                                expName={expos.expName}
                                creator={expos.expCreator}
                                description={expos.expDescription}
                                startDate={expos.expStartDate}
                                endDate={expos.expEndDate}
                                image={expos.expImage === "default.webp"
                                    ? defaultExpoImageUrl(
                                        expos.expImage
                                    )
                                    : expoImageUrl(expos.expImage)}
                                expCode={expos.expCode}
                                expPrice={expos.expPrice}
                            />
                        )}
                    </div>
                </div>

                <div className="mb-20">
                    <Typography
                        color="text.primary"
                        className="font-semibold text-[13px] block mb-6"
                    >
                        {t('agenda_expLink')}
                    </Typography>
                    <Typography
                        color="text.disabled"
                        variant="caption"
                        className="font-normal text-[11px] block"
                    >
                        {t('agenda_expLink_text')}
                    </Typography>

                    <Box
                        component="form"
                        className="my-24 w-full max-w-[760px]"
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <CssTextField
                            id="custom-css-outlined-input"
                            className="w-full "
                            value={expoLink}
                            sx={{
                                "& .MuiInputBase-input": {
                                    paddingRight: "100px",
                                    color: "primary.main",
                                },
                            }}
                        />
                        <div className="absolute top-0 z-10 right-0 flex items-center justify-center h-full">
                            <Button
                                onClick={copyExpoLink}
                                className="rounded-[4px] font-medium uppercase min-h-full m-0 px-[20px] border-[1px] border-gray-300"
                                variant="outlined"
                                sx={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    backgroundColor: "#fff",
                                    borderRight: "none",
                                    borderLeft: "none",
                                    "&:hover": {
                                        backgroundColor: "#fff",
                                    },
                                }}
                            >
                                <svg
                                    width="16"
                                    height="18"
                                    viewBox="0 0 16 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        opacity="0.9"
                                        d="M5.4 14.4C4.905 14.4 4.48125 14.2237 4.12875 13.8712C3.77625 13.5187 3.6 13.095 3.6 12.6V1.8C3.6 1.305 3.77625 0.88125 4.12875 0.52875C4.48125 0.17625 4.905 0 5.4 0H13.5C13.995 0 14.4187 0.17625 14.7712 0.52875C15.1237 0.88125 15.3 1.305 15.3 1.8V12.6C15.3 13.095 15.1237 13.5187 14.7712 13.8712C14.4187 14.2237 13.995 14.4 13.5 14.4H5.4ZM5.4 12.6H13.5V1.8H5.4V12.6ZM1.8 18C1.305 18 0.88125 17.8237 0.52875 17.4712C0.17625 17.1187 0 16.695 0 16.2V3.6H1.8V16.2H11.7V18H1.8Z"
                                        fill="#6F43D6"
                                    />
                                </svg>
                            </Button>

                            <Button
                                className="rounded-[4px] font-medium uppercase min-h-full m-0 px-[30px] border-l-[1px]"
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                }}
                                onClick={() => window.open(joinLink)}
                            >
                                {t('join_expo')}
                            </Button>
                        </div>
                    </Box>
                </div>

                <div className="mb-20">
                    <Typography
                        color="text.primary"
                        variant=""
                        className="font-semibold text-[13px] block mb-6"
                    >
                        {t('agendaContent_addAttendee_heading')}
                    </Typography>
                    <Typography
                        color="text.disabled"
                        variant="caption"
                        className="font-normal text-[11px] block"
                    >
                        {t('agendaContent_addAttendee_text')}
                    </Typography>

                    <Box
                        component="form"
                        className="my-24 w-full max-w-[760px]"
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <CssTextField
                            id="custom-css-outlined-input"
                            className="w-full "
                            value={addAttendeeLink}
                            sx={{
                                "& .MuiInputBase-input": {
                                    paddingRight: "100px",
                                    color: "primary.main",
                                },
                            }}
                        />

                        <Button
                            className="rounded-[4px] font-medium uppercase absolute right-0 min-h-full m-0 min-w-92"
                            variant="contained"
                            color="primary" onClick={copyAddAttendeeLink}
                        >
                            <span>{t('agenda_copy')}</span>
                        </Button>
                    </Box>
                </div>

                {(agendaData && agendaData.length > 0) &&
                    <div className="mb-24 flex flex-wrap justify-between w-full sm:max-w-[90%]">
                        <div className="flex-1">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-semibold text-[13px] block mb-6"
                            >
                                {t('agenda_heading')}
                            </Typography>
                            <Typography
                                color="text.disabled"
                                variant="caption"
                                className="font-normal text-[11px] block"
                            >
                                {t('agenda_heading_subTitle')}
                            </Typography>
                        </div>
                    </div>}

                {(agendaData && agendaData.length > 0) &&
                    agendaData.map((agenda) => (
                        <div key={agenda.hallid} className="mb-20">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-semibold text-[14px] block mb-12"
                            >
                                {(agenda.hallName === 'defaultLobby') ? `${t("defaultLobby")}` : agenda.hallName} - {agenda.events.length} {t('agenda_session')}{agenda.events.length > 1 ? 's' : ''}
                            </Typography>

                            <div>
                                <TableContainer component={Paper} className="border-0 shadow-0 rounded-0 mx-[-10px]">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className={classes.tableHead} sx={{ width: 200 }}>
                                                    {t('agenda_date')}
                                                </TableCell>
                                                <TableCell className={classes.tableHead} sx={{ width: 150 }}>
                                                    {t('agenda_timeSlot')}
                                                </TableCell>
                                                <TableCell
                                                    className={classes.tableHead}
                                                    sx={{ width: 150 }}
                                                    align="left"
                                                >
                                                    {t('agenda_duration')}
                                                </TableCell>
                                                <TableCell
                                                    className={classes.tableHead}
                                                    sx={{ width: 200 }}
                                                    align="left"
                                                >
                                                    {t('agenda_sessions')}
                                                </TableCell>
                                                <TableCell
                                                    className={classes.tableHead}
                                                    sx={{ minWidth: 200 }}
                                                    align="left"
                                                >
                                                    {t('agenda_speakers')}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {agenda.events.map((event) => (
                                                <TableRow key={event.id}>
                                                    <TableCell className={classes.tableBody}>{scheduleDateFormat(event.schStartDateTime, true, timeZone)}
                                                    </TableCell>
                                                    <TableCell className={classes.tableBody}>{scheduleTimeFormat(event.schStartDateTime, timeZone)}</TableCell>
                                                    <TableCell className={classes.tableBody}>{getDuration(event.schStartDateTime, event.schEndDateTime)}</TableCell>
                                                    <TableCell className={classes.tableBody}>{event.schName}</TableCell>
                                                    <TableCell className={classes.tableBody}>
                                                        <div className="flex flex-wrap gap-10">
                                                            {
                                                                renderSpeakers(event.speakers)
                                                            }
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </div>
                    ))
                }

                <div className="mt-24  justify-between w-full max-w-[550px]">
                    <div className="flex flex-wrap mb-5 relative pb-[15px]">
                        <div className="flex-1 me-4">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-semibold text-[13px] block mb-6"
                            >
                                {t('agenda_notify')}
                            </Typography>
                            <Typography
                                color="text.disabled"
                                variant="caption"
                                className="font-normal text-[11px] block mb-6"
                            >
                                {t('agenda_content_selectText')}
                            </Typography>
                            {isDisabled && <div className="flex absolute bottom-0">
                                <FuseSvgIcon className="text-48 me-4" size={14} color="error">
                                    heroicons-outline:information-circle
                                </FuseSvgIcon>
                                <Typography
                                    color="error"
                                    variant=""
                                    className="font-medium text-[11px] block mb-0"
                                >
                                    {t('agenda_content_selectAnyOption')}
                                </Typography>
                            </div>}
                        </div>
                        <Box component="div" className="">
                            <Button
                                className="min-w-[63px] min-h-[34px] px-2 font-medium rounded-lg uppercase"
                                variant="contained"
                                color="primary"
                                onClick={handleClick}
                                disabled={isDisabled}
                            >
                                {t('agendaContent_sendButton')}
                            </Button>
                        </Box>
                    </div>

                    <Box
                        sx={{
                            border: "none",
                            marginTop: "20px",
                            boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
                            paddingY: "10px",
                            borderRadius: "12px",
                        }}
                    >
                        <div className="flex items-center justify-between px-[30px] py-[10px]">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-normal text-[14px] block mb-0 flex-1"
                            >
                                {t('agendaContent_notifyAttendeeSpeakers')}
                            </Typography>
                            <Switch checked={notifySpeakersAttendees} onChange={() => {
                                if (isMismatch || !expos.expStatus) {
                                    setNotifySpeakersAtendees(false);
                                    dispatch(showMessage({
                                        message: t('agenda_sendButtonCondition_message'),
                                        variant: 'warning'
                                    }));
                                } else {
                                    setNotifySpeakersAtendees(!notifySpeakersAttendees);
                                }
                            }} />
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between px-[30px] py-[10px]">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-normal text-[14px] block mb-0 flex-1"
                            >
                                {t('agendaContent_notifyBoothManager')}
                            </Typography>
                            <Switch checked={notifyBoothManager} onChange={() => setNotifyBoothManager(!notifyBoothManager)} />
                        </div>
                    </Box>
                </div>
            </div>
        </>
    );
}

export default AgendaContent;