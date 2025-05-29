import React, { useEffect, useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import SubSIdeBar from "./SubSideBar";
import PollPopup from "../../../shared-components/polls/PollPopup";
import PollSubmission from "../../../shared-components/polls/pollSubmission";
import HallDetails from "./HallDetails";
import Modal from "./Modal";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button
} from "@mui/material";
import Typography from "@mui/material/Typography";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useLocation, useNavigate, useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import { filterWithHallName, groupAndSortByDate, groupWithHallName, searchBySchId } from "src/utils/schedule.helper";
import { generateChatToken } from "../api/generate-chat-token";
import LocalCache from "src/utils/localCache";
import UserItem from "./UserItem";
import { useTranslation } from "react-i18next";
import { checkUsers, getUsers } from "../api/users-details-api";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import FuseCountdown from "@fuse/core/FuseCountdown";
import { checkDate } from "src/utils/dateformatter";
import { getTenantSlug } from "src/utils/tenantHelper";
import { io } from "socket.io-client";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { checkSeesionStatus } from "app/shared-components/poll/pollRollPrivillage";
import { useQuery } from "@tanstack/react-query";
import { getExpoJson } from "../../expo-management/manage/booth/apis.ts/get-expo-json";
import LayoutMapping from "app/shared-components/components/expoPreview/booth/LayoutMapping";
import { getFavoriteAttendees, toggleFavoriteAttendeeStatus } from "../api/favorite-attendee";
import { useSelector } from "react-redux";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { isError } from "lodash";
import { useAppDispatch } from "app/store/hooks";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ZoomableExpoPreview from "app/shared-components/components/expoPreview/ZoomableExpoPreview";
import VideoPopup from "./VideoPopup";
import OfflineSchedule from "./schdules/SchedulePopup";
import SchedulePopup from "./schdules/SchedulePopup";
import { markAttendance } from "../api/attendence-marking";
import { userImageUrl } from "src/utils/urlHelper";
import { GetBoothManagers } from "../api/getBoothManagers";
import { isBoothManager, isOrganiser, isSpeaker } from "src/utils/isSpeakerBoothManager";
import { getAttendeeDetailsAPI } from "../../expo-management/manage/attendees/apis/Get-Attendees-Api";
import { getOS } from "src/utils/getOs";

type Expo = {
    id: string,
    expName: string,
    expDescription: string,
    expStartDate: Date,
    expEndDate: Date,
    expIsPaid: boolean,
    expPrice: number,
    expVenue: string,
    firstName: string,
    lastName: string,
    userImage: string,
    expAddress: string,
    expTermsConditionIsEnabled: boolean,
    expTermsAndConditions: string,
    expIsRegistrationEnabled: boolean,
    expCode: string,
    expType: string,
    expTenantId: string
}

type Speakers = {
    speakers: [],
}

type Schedules = {
    schedules: [],
}

const Root = styled("div")(({ theme }) => ({
    // Customize your root styles here
}));
interface UserRole {
    role: string;
}
interface PollOption {
    label: string;
    votes: number;
}
interface Poll {
    id: number;
    question: string;
    options: PollOption[];
}
function Lobby() {
    const navigate = useNavigate();
    const { t } = useTranslation("user-dashboard");
    const [fillColor, setFillColor] = React.useState("#D8DBDE");
    const dispatch = useAppDispatch()
    const changeColor = () => {
        setFillColor(fillColor === "#D8DBDE" ? "#f7ca69" : "#D8DBDE");
    };
    const [polls, setPolls] = useState<Poll[]>([]);
    const [expo, setExpo] = useState<Expo | null>(null);
    const [isExpo, setIsExpo] = useState(false);
    const [schedules, setSchedules] = useState<Schedules | null>(null);
    const [isSchedules, setIsSchedules] = useState(false);
    const [openModal, setOpenModal] = useState('null');
    const [schDateTime, setSchDateTime] = useState('');
    const [schCounter, setSchCounter] = useState("2024-08-23T00:00:00");
    const [schCounterEnd, setSchCounterEnd] = useState("2024-08-23T00:00:00");
    const [schName, setSchName] = useState('');
    const [filteredEvents, setFilteredEvents] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [openModalChat, setOpenModalChat] = React.useState(null);
    const [iframeSrc, setIframeSrc] = React.useState('');
    const [openUsers, setOpenUsers] = useState(false);
    const pathArray = window.location.pathname.split('/');
    const eventId = pathArray[pathArray.length - 1];
    const [userRole, setUserRole] = useState("");
    const [checkSession, setCheckSession] = useState(null);
    const routeParams = useParams();
    const [scheduleId, setScheduleId] = useState(null)
    const location = useLocation();
    const schedule = new URLSearchParams(location.search).get('schedule');
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [speakers, setSpeakers] = useState();
    const [userID, setUserID] = useState();
    const [isValidSpeaker, setIsValidSpeaker] = useState(false);
    const [expoId, setExpoId] = useState();
    const [boothManagers, setBoothManagers] = useState();
    const [userRoleID, setUserRoleID] = useState();
    const [attendees, setAttendees] = useState();
    const [renderKey, setRenderKey] = useState(0);
    const [userTenantId, setUserTenantId] = React.useState();
    const [isDataReady, setIsDataReady] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const [_isBoothManager, setIsBoothManager] = useState(false);
    const handleClick = () => {
        setRenderKey(prevKey => prevKey + 1); // Change key to force re-render
    };

    // const socket = useMemo(() => io("http://localhost:3002"), []);
    // const socket = useMemo(() => io(import.meta.env.VITE_DB_URL), []); // Use import.meta.env
    const socket = useMemo(() => {
        const expoId = expo?.expCode; // Get the expoId
        const subId = scheduleId; // Retrieve subId from your data source
        return io(import.meta.env.VITE_DB_URL, {
            query: { expoId, subId }, // Pass both expoId and subId when the user connects
        });
    }, [expo?.expCode, scheduleId]);

    useEffect(() => {
        socket.on("connect", () => console.log("Connected to server with ID:", socket.id));
    }, [socket]);

    const getInitialDetails = useCallback(async (id) => {
        try {
            const expoDetails = await getEvent(id);
            if (!expoDetails) return;
            await LocalCache.setItem(`expoDetails_${expoDetails.expo.id}`, expoDetails?.data)
            const attendees = await getAttendeeDetailsAPI({ expoId: expoDetails.expo.id });
            const queryParams = new URLSearchParams(location.search);
            const scheduleId = queryParams.get("schedule");
            const boothManagers = await GetBoothManagers(id);
            const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));

            if (!userData) return;

            setUserID(userData.uuid);
            setUserTenantId(userData.data.tenant);
            setBoothManagers(boothManagers.boothManagers);
            setUserRole(userData.role);
            setUserRoleID(userData.roleId);

            if (userData.role !== 'admin') {
                checkUserDetails(userData.uuid, expoDetails.expo.id);
            }

            setSpeakers(expoDetails.speakers || []);
            setAttendees(attendees.data || []);
            setIsExpo(true);
            setExpo(expoDetails.expo);
            setExpoId(expoDetails.expo.id);
            setSchedules(expoDetails.schedules || []);
            setScheduleId(scheduleId);
        } catch (error) {
            console.error("Error fetching initial details:", error);
        }
    }, []);

    useEffect(() => {
        getInitialDetails(routeParams.id);
    }, [getInitialDetails, routeParams.id]);

    const checkUserDetails = async (userId, expoId) => {
        const userDetails = await checkUsers(userId, expoId);
        if (userDetails.total === 0) {
            navigate(`/${getTenantSlug(routeParams)}/events/${routeParams.id}`);
        } else {
            getUsersDetails(expoId);
        }
    };

    useEffect(() => {
        (schedules !== null && schedules?.length !== 0) ? setIsSchedules(true) : setIsSchedules(false);
        const _schedules = async () => {
            if (schedules != null) {
                const newUrl = new URL(window.location.href);
                const params = new URLSearchParams(newUrl.search);
                if (schedule && params.has('schedule')) {
                    const events = await groupAndSortByDate(schedules)
                    const event = searchBySchId(schedule, events);
                    handleOpenModal("modalTwo", null, { event })
                }
            }
        }
        _schedules();
    }, [schedules])


    const handleRedirection = () => {
        dispatch(
            showMessage({
                message: t('noAccessToThisSchedule'),
                variant: "warning",
            })
        );

        setTimeout(() => {
            window.location.replace(`/${getTenantSlug(routeParams)}/events/${expo.expCode}`);
        }, 1500);
    };

    useEffect(() => {
        if (
            expo !== undefined &&
            userRoleID !== undefined && userTenantId &&
            Array.isArray(speakers) &&
            Array.isArray(boothManagers)
        ) {
            setIsDataReady(true);
        }
    }, [speakers, boothManagers, expo, userRoleID, userID, userTenantId]);

    useEffect(() => {
        if (!isDataReady || isRedirecting) return;
        let isUserAttendee = attendees?.some((attendee) => attendee.epUserId === userID);
        let isUserSpeaker = isSpeaker(speakers, userID);
        let isUserBoothManager = isBoothManager(boothManagers, userID, "", true, boothManagers);
        setIsBoothManager(isUserBoothManager);
        let isUserOrganiser = isOrganiser(userRoleID, expo?.expTenantId, userTenantId);

        if (!(isUserSpeaker || isUserBoothManager || isUserAttendee || isUserOrganiser)) {
            setIsRedirecting(true);
            setTimeout(() => handleRedirection(), 100);
        }
    }, [isDataReady]);

    const getUsersDetails = async (id) => {
        const usersDetails = await getUsers(id);
        setUsers(usersDetails);
    }

    const handleOpenModal = async (modal, hallName = null, event = null) => {
        const eventsByDate = await groupAndSortByDate(schedules);
        (hallName) && setFilteredEvents(filterWithHallName(eventsByDate, hallName));
        const today = new Date().toISOString().split('T')[0];
        const eventDates = Object.keys(filterWithHallName(eventsByDate, hallName));
        const initialTabIndex = eventDates.findIndex((date) => date === today);
        setActiveTab(initialTabIndex == -1 ? 0 : initialTabIndex);
        const newUrl = new URL(window.location.href);
        const params = new URLSearchParams(newUrl.search);
        if (params.has('schedule')) {
            params.delete('schedule');
            navigate(`${newUrl.pathname}?${params.toString()}`, { replace: true });
            const checkSession = await checkSeesionStatus(routeParams, location);
            setCheckSession(checkSession);
            setScheduleId(event.event["schId"])
        }
        if (hallName == null) {
            newUrl.searchParams.set('schedule', event.event["schId"]);
            window.history.pushState({}, '', newUrl);
            const checkSession = await checkSeesionStatus(routeParams, location);
            setCheckSession(checkSession);
            setScheduleId(event.event["schId"])
            setSchDateTime(event.event["schStartDateTime"] + ", " + event.event["time"]);
            setSchCounter(event.event["eventStartDateTime"]);
            setSchCounterEnd(event.event["eventEndDateTime"]);
            setSchName(event.event["event"]);
            setSelectedSchedule(event.event);
        }
        handleCloseModalChat();
        setOpenModal(modal);
    };

    const handleCloseModal = async () => {
        setOpenModal(null);
        // if (!checkSession) {
        //     setOpenModal(null);
        // }
    };

    // useEffect(() => {
    //     handleCloseModal()
    // }, [checkSession])

    const handleOpenModalChat = async (modal) => {
        let userDetails = await LocalCache.getItem("userData");
        const payload = { expName: (checkSession && scheduleId) ? scheduleId : expo.expCode, email: userDetails?.data?.email, show_announcement: (checkSession && scheduleId) ? false : true, show_group: true, image: (userDetails?.data?.userImage === 'default.webp' || !userDetails?.data?.userImage) ? '' : userImageUrl(userDetails?.data?.userImage) };
        const { data } = await getToken(payload);
        const newSrc = import.meta.env.VITE_CHAT_URL + `/?token=${data}`;
        setIframeSrc(newSrc);
        handleCloseModal();
        setOpenModalChat(modal);
    };

    const getToken = async (data) => {
        return await generateChatToken(data);
    }

    const handleCloseModalChat = () => {
        setOpenModalChat(null);
    };

    const handleClickOpenUsers = () => {
        setOpenUsers(true);
    };
    const handleChatClose = () => {
        setOpenModalChat(null);
    };
    const handleUsersClose = () => {
        setOpenUsers(null);
    };
    const handleCloseUsers = () => {
        setOpenUsers(false);
    };

    // react query for fetching expo json for preview
    const {
        data: expoJson,
        error: additionalError,
        isLoading: isLoadingExpoJson,
        isError: isAdditionalError,
    } = useQuery({
        queryKey: ["expoJson", expo?.expCode],
        queryFn: () => getExpoJson(expo?.expCode),
        enabled: !!expo?.expCode,
        staleTime: 0,
        retry: 2,
        refetchOnWindowFocus: false,
    });

    // for showing each booth in preview
    const [showEachBooth, setShowEachBooth] = useState<boolean>(false);
    const user = useSelector(selectUser)

    useEffect(() => {
        if (expo?.id) {
            getUsersDetails(expo?.id)
        }
    }, [expo])

    // mark attendance
    useEffect(() => {

        (async () => {
            if (user?.uuid && expo?.id && userRole !== 'admin' && expo?.expType !== 'Offline') {
                const data = {
                    epUserId: user?.uuid,
                    epExpoId: expo?.id,
                    attDeviceInfo: {
                        "os": getOS()
                    }
                }
                try {
                    const response = await markAttendance(data);
                } catch (error: any) {
                    if (!(error.response?.status === 409)) {
                        // dispatch(showMessage({ message: t('uD_mark_attendance_error'), variant: "error" }))
                    } else { }
                }
            }
        })()
    }, [user, expo])

    const {
        data: favoriteAttendees = { favoriteUsers: [] },
        isLoading: favoriteAttendeesLoading,
        isError: favoriteAttendeesIsError,
        error: favoriteAttendeesErrorData,
    } = useQuery({
        queryKey: ["favoriteAttendees", user?.uuid],
        queryFn: () => getFavoriteAttendees(user?.uuid),
        enabled: !!user?.uuid && user?.role !== 'admin',
        staleTime: 0,
        retry: 2,
        refetchOnWindowFocus: false,
    })

    if (favoriteAttendeesIsError) {
        if (user.role !== "admin") {
            dispatch(showMessage({ message: t('uD_Favorite_attendee_api_error_message'), variant: "error" }))
        }
    }

    const [usersWithFavoriteStatus, setUsersWithFavoriteStatus] = useState([])
    useEffect(() => {
        handleData();
    }, [favoriteAttendees?.favoriteUsers, users]);

    const handleData = () => {
        if (users?.length > 0 && favoriteAttendees?.favoriteUsers) {
            // Create a hash map of favorite user IDs for quick lookup
            const favoriteMap = new Set(favoriteAttendees?.favoriteUsers?.map((user) => user?._id));

            // Map through the users array and add a 'isFavorite' flag
            const updatedUsers = users.map((user) => ({
                ...user,
                isFavorite: favoriteMap?.has(user?.epUserId),
            }));
            setUsersWithFavoriteStatus((prev) => {
                const isSame = prev.length === updatedUsers.length && prev.every((p, i) => p.isFavorite === updatedUsers[i].isFavorite);
                return isSame ? prev : updatedUsers.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
            });
        }
    }

    return (
        <>
            <Root>
                <Box
                    className="min-h-screen min-w-screen max-h-screen relative"
                    sx={{
                        backgroundImage: `url('../assets/images/lobby-img.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // width: "100vw",
                        // height: "100vh",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                    }}
                >
                    <div onClick={handleClick}>
                        {(expoJson && expo) && <ZoomableExpoPreview expoJson={expoJson} expo={expo} showEachBooth={showEachBooth} setShowEachBooth={setShowEachBooth} />}
                    </div>


                    <SubSIdeBar scheduleId={scheduleId} checkSessions={checkSession} expo={expo} socket={socket} onClick={(modal) => handleOpenModalChat("modalChat")} onClickUsers={() => handleClickOpenUsers()} onClickChatClose={() => handleChatClose()} onClickUsersClose={() => handleUsersClose()} />

                    {!_isBoothManager && isSchedules && <Box
                        sx={{
                            bgcolor: (theme) => theme.palette.background.paper, // Use shorthand for backgroundColor
                            position: "fixed",
                            bottom: { xs: "70px", sm: "40px" }, // Fixed the misplaced parenthesis
                            left: 0,
                            right: 0,
                            margin: "auto",
                            overflowX: "auto",
                            width: "max-content",
                            maxWidth: { xs: "calc(100% - 30px)", sm: "432px" },
                            zIndex: 2,
                            padding: "5px",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: 500,
                            boxShadow: "0 4px 10px 0 rgba(0, 0, 0, 0.4)",

                            display: "flex",
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            color: "text.secondary",

                            "& span": {
                                color: "#333333 !important",
                                textDecoration: "none !important",
                                margin: "0 10px",
                                padding: "10px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",

                                "&.active, &:hover": {
                                    color: "#6F43D6 !important",
                                },
                            },
                        }}
                    >

                        {(() => {
                            const events = groupWithHallName(schedules);
                            return events.map((event, index) => (
                                <React.Fragment key={index}>
                                    <span onClick={() => handleOpenModal('modalOne', Object.keys(event)[0])}>
                                        {Object.keys(event)[0] === 'defaultLobby' ? `${t("defaultLobby")}` : Object.keys(event)[0]}
                                    </span>
                                    {index < events.length - 1 && (
                                        <Divider orientation="vertical" flexItem />
                                    )}
                                </React.Fragment>
                            ));
                        })()}
                    </Box>}
                </Box>

                <Modal
                    title={"modalOne"}
                    show={openModal === "modalOne"}
                    onClose={handleCloseModal}
                    size="large"
                >
                    <Box
                        component="div"
                    // sx={{ padding: { xs: "20px 30px", md: "28px 38px" } }}
                    >
                        <HallDetails onClick={(modal, hallName, event) => handleOpenModal("modalTwo", null, { event })} schedules={filteredEvents} activeTab={activeTab} />
                    </Box>
                </Modal>

                <Modal
                    show={openModal === "modalTwo"}
                    onClose={handleCloseModal}
                    title="Modal Two"
                //   size={medium}
                >
                    <SchedulePopup schCounterEnd={schCounterEnd} schCounter={schCounter} schName={schName} schDateTime={schDateTime} expo={expo} t={t} schedule={selectedSchedule} />
                </Modal>

                {/* <VideoPopup open={true} handleClose={() => { }} /> */}

                <div>
                    <Dialog
                        className="md:left-[40px] bottom-[60px] md:bottom-0"
                        open={openModalChat === "modalChat"}
                        fullScreen
                        onClose={handleCloseModalChat}
                        BackdropProps={{ style: { display: "none" } }}

                        PaperProps={{
                            sx: {
                                width: "100%",
                                maxWidth: { xs: "100%", sm: "calc(100vw - 60px)" },
                                height: "100vh",
                                position: "absolute",
                                left: { xs: "inherit", sm: "20px" },
                                borderRadius: "0 !important",
                                margin: 0,
                                maxHeight: { xs: "calc(100vh - 60px)", sm: "100vh" },
                                top: "0px",
                            },
                        }}


                    >
                        <DialogTitle
                            sx={{
                                padding: "16px !important",
                                // backgroundColor: (theme) => theme.palette.background.default,
                            }}
                        >
                            <div className="mb-0 pe-20">
                                <Typography
                                    color="text.primary"
                                    variant=""
                                    className="font-semibold text-[16px] block mb-0 truncate"
                                >
                                    Messages
                                </Typography>
                            </div>

                            <IconButton
                                aria-label="close"
                                onClick={handleCloseModalChat}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <FuseSvgIcon className="text-48" size={24} color="action">
                                    feather:x
                                </FuseSvgIcon>
                            </IconButton>
                        </DialogTitle>

                        <DialogContent
                            sx={{
                                padding: "0!important",
                                backgroundColor: (theme) => theme.palette.background.default,
                            }}
                        >
                            <IconButton
                                aria-label="close"
                                onClick={handleCloseModalChat}
                                sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                            >
                                <FuseSvgIcon className="text-48" size={24} color="action">
                                    feather:x
                                </FuseSvgIcon>
                            </IconButton>
                            <div className="space-y-20">
                                <iframe
                                    src={iframeSrc}
                                    title="Event Details"
                                    width="100%"
                                    style={{
                                        border: "none",
                                    }}
                                    className="responsive-iframe"
                                ></iframe>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                {/* <Modal
                    show={openModalChat === "modalChat"}
                    onClose={handleCloseModal}
                    size="large"
                >
                    <Box
                        component="div"
                        sx={{ padding: { xs: "20px 30px", md: "28px 38px" } }}
                    >
                        <iframe
                            src={iframeSrc}
                            title="Event Details"
                            width="100%"
                            height="400px"
                            style={{ border: 'none' }}
                        ></iframe>
                    </Box>
                </Modal> */}


            </Root>

            <div>
                <Dialog
                    className="md:left-[60px] bottom-[60px] md:bottom-0"
                    open={openUsers}
                    onClose={handleCloseUsers}
                    disableBackdropClick
                    disableEscapeKeyDown
                    BackdropProps={{ style: { display: "none" } }}
                    PaperProps={{
                        sx: {
                            width: "100%",
                            height: "100vh",
                            position: "absolute",
                            left: { xs: "inherit", sm: "10px" },
                            maxWidth: { xs: "100%", sm: "330px" },
                            maxHeight: { xs: "calc(100vh - 60px)", sm: "auto" },
                            top: { xs: 0, sm: "auto" },
                            margin: 0,
                            borderRadius: { xs: "0", sm: "12px" },
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            padding: "16px !important",
                            // backgroundColor: (theme) => theme.palette.background.default,
                        }}
                    >
                        <div className="mb-0 pe-20">
                            <Typography
                                color="text.primary"
                                variant=""
                                className="font-semibold text-[16px] block mb-0 truncate"
                            >
                                {t('lobby_attendees')}
                            </Typography>
                        </div>

                        <IconButton
                            aria-label="close"
                            onClick={handleCloseUsers}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <FuseSvgIcon className="text-48" size={24} color="action">
                                feather:x
                            </FuseSvgIcon>
                        </IconButton>
                    </DialogTitle>

                    <DialogContent
                        sx={{
                            padding: "16px !important",
                            backgroundColor: (theme) => theme.palette.background.default,
                        }}
                    >
                        <div className="space-y-20">
                            {usersWithFavoriteStatus?.map((userDetails, index) => (
                                <UserItem key={index} userRole={user?.role} email={userDetails?.email} isFavorite={userDetails?.isFavorite} userId={userDetails?.epUserId} name={userDetails?.name} imageSrc={userDetails?.imageSrc} setUsersWithFavoriteStatus={setUsersWithFavoriteStatus} />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* <PollSubmission  socket={socket} />  */}
            {
                checkSession && userRole == "enduser" && <PollSubmission expo={expo} socket={socket} />

            }
        </>
    );
}

export default Lobby;
