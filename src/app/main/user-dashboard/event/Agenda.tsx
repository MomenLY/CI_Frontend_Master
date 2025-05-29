import * as React from "react";
import { Box, styled } from "@mui/system";
import { Tabs } from "@mui/base/Tabs";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { buttonClasses } from "@mui/base/Button";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";


import { withTheme } from "@mui/styles";
import { makeStyles } from "@mui/styles";
import { groupAndSortByDate } from "src/utils/schedule.helper";
import { formatDate, scheduleTimeFormat, scheduleTimeFormat1 } from "src/utils/dateformatter";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getTenantSlug } from "src/utils/tenantHelper";
import { getEvent } from "../api/event-details-api";
import { getAttendeeDetailsAPI } from "../../expo-management/manage/attendees/apis/Get-Attendees-Api";
import { GetBoothManagers } from "../api/getBoothManagers";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import speaker from "material-ui/svg-icons/hardware/speaker";
import Expo from "../../expo-management/Expo";
import { getUsers, checkUsers } from "../api/users-details-api";
import { isOrganiser } from "src/utils/isSpeakerBoothManager";
import { getTimeZoneSettings } from "src/utils/getSettings";

const useStyles = makeStyles((theme: any) => ({
  table: {
    padding: '20px',
  },

  head: {
    '& .MuiTableCell-root': {
      color: theme.palette.mode === 'light' ? theme.palette.text.disabled : theme.palette.text.primary,
      fontWeight: '600',
      padding: '10px 20px',
    }
  },
  row: {
    border: "none",
  },
  cell: {
    border: "none",
    color: theme.palette.mode === 'light' ? theme.palette.text.primary : theme.palette.text.disabled,
    fontWeight: '500',
    verticalAlign: 'baseline',
  },
}));

const getCurrentDateIndex = (events: any) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const dates = Object.keys(events);
  return dates.findIndex(date => date === currentDate);
};


const handleJoin = () => {
}

type Expo = {
  id: string;
  expName: string;
  expDescription: string;
  expStartDate: string;
  expEndDate: string;
  expIsPaid: boolean;
  expType: string;
  expPrice: number;
  expVenue: string;
  firstName: string;
  lastName: string;
  userImage: string;
  expAddress: string;
  expTermsConditionIsEnabled: boolean;
  expTermsAndConditions: string;
  expIsRegistrationEnabled: boolean;
  expBanerImage: string;
  expCode: string;
  expCreator: string;
  expRegistrationEndDate: string;
  expRegistrationStartDate: string;
  expIsSeatsUnlimited: boolean;
  expMaxSeats: number;
  expoId: string;
  expTenantId: string;
  expRegistrationEndType: string;
};

function Agenda(props) {
  const { theme } = props;
  const { t } = useTranslation('user-dashboard');
  const classes = useStyles({ theme });
  const navigate = useNavigate();
  const [events, setEvents] = React.useState();
  const qrCode = props?.qrCode;
  const [defaultTabIndex, setDefaultTabIndex] = React.useState(0);
  const routerParams = useParams();
  const [userID, setUserID] = React.useState();
  const [userTenantId, setUserTenantId] = React.useState();
  const [boothManagers, setBoothManagers] = React.useState();
  const [userRole, setUserRole] = React.useState("");
  const [userRoleID, setUserRoleID] = React.useState();
  const [users, setUsers] = React.useState([]);
  const [attendees, setAttendees] = React.useState();
  const [isDataReady, setIsDataReady] = React.useState(false);
  const [expo, setExpo] = React.useState<Expo | null>(null);
  const [speakers, setSpeakers] = React.useState([]);
  const [schedules, setSchedules] = React.useState([]);
  const [tenantName, setTenantName] = React.useState();
  const [attendeeIds, setAttendeeIds] = React.useState([]);
  const [hasAccess, setHasAccess] = React.useState(false);
  const [timeZone, setTimeZone] = React.useState();

  const getInitialDetails = React.useCallback(async (id) => {
    const timeZone = await getTimeZoneSettings();
    setTimeZone(timeZone);
    const events = await groupAndSortByDate(props.schedules);
    if (events) {
      setEvents(events);
      const currentDateIndex = getCurrentDateIndex(events);
      if (currentDateIndex !== -1) {
        setDefaultTabIndex(currentDateIndex);
      }
    }
    const expoDetails = await getEvent(id);
    if (!expoDetails) return;
    const attendeesData = await getAttendeeDetailsAPI({ expoId: expoDetails.expo.id });
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
    if (attendeesData.data.length >= 0) {
      const attendeeIds = attendeesData.data.map((attendee) => attendee.epUserId);
      setAttendeeIds(attendeeIds);
      setAttendees(attendeesData.data);
    }
    setExpo(expoDetails.expo);
    setSpeakers(expoDetails.speakers);
    setSchedules(expoDetails.schedules);
    setTenantName(expoDetails.expo.expTenantId);
  }, []);

  React.useEffect(() => {
    getInitialDetails(routerParams.id);
  }, [getInitialDetails]);

  const tenantSlug = getTenantSlug(routerParams);

  const getUsersDetails = async (id) => {
    const usersDetails = await getUsers(id);
    setUsers(usersDetails);
  }

  const checkUserDetails = async (userId, expoId) => {
    const userDetails = await checkUsers(userId, expoId);
    if (userDetails.total === 0) {
      navigate(`/${getTenantSlug(routerParams)}/events/${routerParams.id}`);
    } else {
      getUsersDetails(expoId);
    }
  };

  React.useEffect(() => {
    if (
      expo !== undefined &&
      userRoleID !== undefined && userTenantId &&
      Array.isArray(speakers) &&
      Array.isArray(boothManagers) &&
      Array.isArray(attendees)
    ) {
      setIsDataReady(true);
    }
  }, [speakers, boothManagers, expo, userRoleID, userID, userTenantId, attendees]);

  React.useEffect(() => {
    if (!isDataReady) return;
    const organiserRoleID = import.meta.env.VITE_ORGANISER_ROLE_ID?.trim();
    const isUserAttendee = attendees?.some((user) => user.epUserId === userID);
    const isUserSpeaker = speakers?.some((speaker: any) => {
      return (speaker === userID);
    });
    const isUserOrganiser = isOrganiser(userRoleID, expo.expTenantId, userTenantId);

    if ((isUserSpeaker || isUserAttendee || isUserOrganiser)) {
      setHasAccess(true);
    }

  }, [isDataReady]);

  return (
    <Box component="div" sx={{ padding: { xs: "10px 0 ", md: "" } }}>
      <Typography
        color="text"
        className="font-bold text-[20px] block mb-28"
      >
        {t('uD_Agenda')}
      </Typography>
      <Tabs value={defaultTabIndex} onChange={(event, newValue: any) => setDefaultTabIndex(newValue)}>
        <TabsList theme={theme} sx={{ overflow: 'auto', paddingBottom: '5px' }}>
          {events && Object.keys(events).map((date, index) => (
            <Tab theme={theme} value={index} key={"agenda_tab_head_" + index} className="whitespace-nowrap">
              {t('uD_Day').toUpperCase()} {index + 1} <span className="block">{formatDate(date, "ddd DD MMM")}</span>
            </Tab>
          ))}
        </TabsList>
        {events && Object.keys(events).map((date, index) => (
          <TabPanel theme={theme} value={index} key={"agenda_tab_" + index}>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table
                sx={{ minWidth: 650 }}
                className={classes.table}
                aria-label="simple table"
              >
                <TableHead className={`${classes.head}`}>
                  <TableRow className={classes.row}>
                    <TableCell className={`text-[12px] md:text-[14px] min-w-[150px] ${classes.cell}`}>{t('uD_Hall')}</TableCell>
                    <TableCell className={`text-[12px] md:text-[14px] min-w-[250px] ${classes.cell}`} align="left">
                      {t('uD_Time')}
                    </TableCell>
                    <TableCell className={`text-[12px] md:text-[14px] min-w-[300px] ${classes.cell}`} align="left">
                      {t('uD_EventName')}
                    </TableCell>
                    <TableCell className={`text-[12px] md:text-[14px] min-w-[200px] ${classes.cell}`} align="left">
                      {t('uD_Speaker')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* <TableBody> */}
                {events && Object.keys(events[date]).map((hall, eventIndex) => (
                  <TableBody key={`${eventIndex}` + "-" + `${index}`}>
                    {/* {index !== 0 && <hr></hr>} */}
                    {events[date][hall].map(({ time, hours, event, speakers, schId, ssUserId, eventEndDateTime, eventStartDateTime }, sessionIndex) => (
                      <TableRow className={classes.row} key="0">
                        {/* {index !== 0 && <hr></hr>} */}
                        <TableCell className={`text-[15px] md:text-[17px] !font-semibold ${classes.cell}`} component="th" scope="row">
                          {sessionIndex === 0 ? ((hall === 'defaultLobby') ? `${t("defaultLobby")}` : hall) : null} <small className='block text-[12px] opacity-50'>{sessionIndex === 0 ? events[date][hall].length + " Sessions" : null}</small>
                        </TableCell>
                        <TableCell className={`text-[14px] md:text-[16px] ${classes.cell}`} align="left">
                          {scheduleTimeFormat1(eventStartDateTime, '')} -  {scheduleTimeFormat1(eventEndDateTime, '')} <small className='block text-[12px] opacity-50'>{hours}</small>
                        </TableCell>
                        <TableCell className={`text-[14px] md:text-[16px] ${classes.cell}`} align="left">{event}</TableCell>
                        <TableCell className={`text-[14px] md:text-[16px] ${classes.cell}`} align="left">{speakers}</TableCell>
                        {
                          <TableCell className={`text-[14px] md:text-[16px] ${classes.cell}`} align="left">
                            <Button
                              sx={{
                                borderRadius: "8px",
                                borderColor: "primary.main",
                                backgroundColor: "transparent",
                                color: "primary.main",
                                borderWidth: "2px",
                                "&:hover": {
                                  backgroundColor: "primary.main",
                                  color: "background.paper",
                                },
                              }}
                              variant="outlined"
                              size="medium"
                              disabled={!(ssUserId.includes(userID) || attendeeIds.includes(userID) || isOrganiser(userRoleID, expo?.expTenantId, userTenantId))}
                              onClick={() => { window.open(`/${tenantSlug}/events/join/` + props.expCode + '?schedule=' + schId, "_blank") }}
                            >
                              {t('uD_Join')}
                            </Button>
                          </TableCell>
                        }
                      </TableRow>
                    ))}
                    {/* <TableRow>
                      <hr/>
                    </TableRow> */}
                  </TableBody>
                ))}

                {/* </TableBody> */}
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Tabs>
    </Box>
  );
}

const Tab = styled(BaseTab)(({ theme }) => ({
  color: theme.palette.text.disabled,
  cursor: 'pointer',
  fontSize: '24px',
  fontWeight: '800',
  backgroundColor: 'transparent',
  padding: '15px 12px',
  margin: '0px 20px',
  border: 'none',
  borderRadius: '7px',
  position: 'relative',
  '@media only screen and (max-width: 991px)': {
    fontSize: '16px',
    margin: '0px 15px',
  },
  span: {
    fontSize: '12px',
    fontWeight: '500',
  },
  '&:focus': {},
  [`&.${tabClasses.selected}`]: {
    color: theme.palette.text.primary,
    '&:before': {
      content: '""',
      background: theme.palette.primary.main,
      borderTopLeftRadius: '0.5rem',
      borderTopRightRadius: '0.5rem',
      width: '100%',
      height: '6px',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
  [`&.${buttonClasses.disabled}`]: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const TabPanel = styled(BaseTabPanel)(({ theme }) => ({
  width: '100%',
  padding: '20px',
  borderRadius: '12px',
  opacity: 1,
  backgroundColor: theme.palette.background.paper,
}));

const TabsList = styled(BaseTabsList)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  paddingLeft: '15px',
}));

export default withTheme(Agenda);
