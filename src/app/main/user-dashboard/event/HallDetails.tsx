import * as React from "react";
import { styled } from "@mui/system";
import { Tabs } from "@mui/base/Tabs";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { buttonClasses } from "@mui/base/Button";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { withTheme } from "@mui/styles";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import { formatDate } from "src/utils/dateformatter";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { getAttendeeDetailsAPI } from "../../expo-management/manage/attendees/apis/Get-Attendees-Api";
import { checkUsers } from "../api/users-details-api";
import { getTenantSlug } from "src/utils/tenantHelper";
import { isOrganiser } from "src/utils/isSpeakerBoothManager";

const useStyles = makeStyles((theme) => ({
    table: {
        padding: "20px",
    },
    head: {
        "& .MuiTableCell-root": {
            color:
                theme.palette.mode === "light"
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary,
            fontWeight: "600",
            padding: "10px 20px",
        },
        position: "sticky",
        top: 0,
        backgroundColor: theme.palette.background.paper,
        zIndex: 1,
    },
    row: {
        border: "none",
    },
    cell: {
        border: "none",
        color:
            theme.palette.mode === "light"
                ? theme.palette.text.primary
                : theme.palette.text.disabled,
        fontWeight: "500",
        verticalAlign: "baseline",
    },
    container: {
        maxHeight: "350px",
        overflowY: "auto",
    },
}));

function HallDetails(props) {   
    const { theme, onClick, } = props;
    const classes = useStyles({ theme });
    const events = props.schedules;
    const { t } = useTranslation('user-dashboard');
    const routeParams = useParams();
    const [speakerData, setSpeakerData] = React.useState([]);
    const [userID, setUserID] = React.useState();
    const [userRoleID, setUserRoleID] = React.useState();
    const [attendees, setAttendees] = React.useState([]);
    const [usersLoaded, setUsersLoaded] = React.useState(false);
    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = React.useState(false);
    const [isDataReady, setIsDataReady] = React.useState(false);
    const [noAccess, setNoAccess] = React.useState(false);
    const [attendeeIds, setAttendeeIds] = React.useState([]);
    const [expoDetails, setExpoDetails] = React.useState();
    const [userTenantId, setUserTenantId] = React.useState();
    const [isOrganiserFlag, setIsOrganiserFlag] = React.useState(false);
    const [activeTab1, setActiveTab1] = React.useState(0);

    const getInitialDetails = async () => {
        const expoDetails = await getEvent(routeParams.id);
        if (expoDetails) {
            setExpoDetails(expoDetails);
            if (expoDetails?.schedules.length > 0) {
                const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
                if (!expoDetails || !userData) return;

                const attendeesData = await getAttendeeDetailsAPI({ expoId: expoDetails.expo.id });
                setUserTenantId((prev) => (prev !== userData?.data?.tenant ? userData?.data?.tenant : prev))
                setUserID((prev) => (prev !== userData.uuid ? userData.uuid : prev));
                setUserRoleID((prev) => (prev !== userData.roleId ? userData.roleId : prev));
                if (attendeesData.data.length >= 0) {
                    const attendeeIds = attendeesData.data.map((attendee) => attendee.epUserId);
                    setAttendeeIds(attendeeIds);
                    setAttendees((prev) => (prev.length !== attendeesData.data.length ? attendeesData.data : prev));
                    setUsersLoaded(true);
                }

                if (userData.role !== "admin") {
                    checkUserDetails(userData.uuid, expoDetails.expo.id);
                }
            }
        }
    }

    React.useEffect(() => {
        getInitialDetails();
    }, []);

    React.useEffect(() => {
        setActiveTab1(props.activeTab);
    }, [props]);

    const checkUserDetails = async (userId, expoId) => {
        const userDetails = await checkUsers(userId, expoId);
        if (userDetails.total == 0) {
            navigate(`/${getTenantSlug(routeParams)}/events/` + routeParams.id);
        }
    }

    return (
        <>
            {expoDetails ? (
                <Tabs value={activeTab1} onChange={(e, newValue) => setActiveTab1(newValue)}>
                    <TabsList theme={theme} sx={{ overflow: "auto", paddingBottom: "5px" }}>
                        {Object.keys(events).map((date, index) => (
                            <Tab theme={theme} value={index} key={"agenda_tab_head_" + index} className="whitespace-nowrap">
                                DAY {index + 1} <span className="block">{formatDate(date, "ddd DD MMM")}</span>
                            </Tab>
                        ))}
                    </TabsList>
                    {Object.keys(events).map((date, index) => (
                        <TabPanel theme={theme} value={index} key={"hall_details_tab_" + index}>
                            <TableContainer
                                component={Paper}
                                sx={{ boxShadow: "none" }}
                                className={classes.container}
                                key={"table_container_" + index}
                            >
                                <Table
                                    sx={{ minWidth: 650 }}
                                    className={classes.table}
                                    aria-label="simple table"
                                    key={"table_" + index}
                                >
                                    <TableHead className={classes.head} key={"table_head_" + index}>
                                        <TableRow className={classes.row} key="table_row__1">
                                            <TableCell key="table_cell__1"
                                                className={`text-[12px] md:text-[14px] min-w-[200px] ${classes.cell}`}
                                                align="left"
                                            >
                                                {t('uD_Time')}
                                            </TableCell>
                                            <TableCell key="table_cell__2"
                                                className={`text-[12px] md:text-[14px] min-w-[300px] ${classes.cell}`}
                                                align="left"
                                            >
                                                {t('uD_EventName')}
                                            </TableCell>
                                            <TableCell key="table_cell__3"
                                                className={`text-[12px] md:text-[14px] min-w-[200px] ${classes.cell}`}
                                                align="left"
                                            >
                                                {t('uD_Speakers')}
                                            </TableCell>
                                            <TableCell key="table_cell__4"
                                                className={`text-[12px] md:text-[14px] min-w-[50px] ${classes.cell}`}
                                                align="left"
                                            ></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {Object.keys(events[date]).map((hall, eventIndex) => (
                                        <TableBody key={`${eventIndex}-${index}`}>
                                            {events[date][hall].map(({ time, hours, event, speakers, ssUserId }, sessionIndex) => (
                                                <TableRow className={classes.row} key={hall.replace(/ /g, "_") + "_" + sessionIndex + "_table_row_index_" + index}>
                                                    <TableCell
                                                        className={`text-[14px] md:text-[16px] ${classes.cell}`}
                                                        align="left"
                                                    >
                                                        {time}{" "}
                                                        <small className="block text-[12px] opacity-50">
                                                            {hours}
                                                        </small>
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-[14px] md:text-[16px] ${classes.cell}`}
                                                        align="left"
                                                    >
                                                        {event}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-[14px] md:text-[16px] ${classes.cell}`}
                                                        align="left"
                                                    >
                                                        {speakers}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-[14px] md:text-[16px] ${classes.cell}`}
                                                        align="left"
                                                    >
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
                                                            disabled={!(ssUserId.includes(userID) || attendeeIds.includes(userID) || isOrganiser(userRoleID, expoDetails?.expo.expTenantId, userTenantId))}
                                                            onClick={() => onClick('modalTwo', null, events[date][hall][sessionIndex])}
                                                        >
                                                            {t('uD_Join')}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    ))}
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    ))}
                </Tabs>
            ) : null}
        </>
    );

}

const Tab = styled(BaseTab)(({ theme }) => ({
    color: theme.palette.text.disabled,
    cursor: "pointer",
    fontSize: "24px",
    fontWeight: "800",
    backgroundColor: "transparent",
    padding: "15px 12px",
    margin: "0px 20px",
    border: "none",
    borderRadius: "7px",
    position: "relative",
    "@media only screen and (max-width: 991px)": {
        fontSize: "16px",
        margin: "0px 15px",
    },
    span: {
        fontSize: "12px",
        fontWeight: "500",
    },
    "&:focus": {},
    [`&.${tabClasses.selected}`]: {
        color: theme.palette.text.primary,
        "&:before": {
            content: '""',
            background: theme.palette.primary.main,
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
            width: "100%",
            height: "6px",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
        },
    },
    [`&.${buttonClasses.disabled}`]: {
        opacity: 0.5,
        cursor: "not-allowed",
    },
}));

const TabPanel = styled(BaseTabPanel)(({ theme }) => ({
    // width: "100%",
    padding: "20px",
    borderRadius: "12px",
    opacity: 1,
    backgroundColor: theme.palette.background.paper,
    minHeight: "380px",
}));

const TabsList = styled(BaseTabsList)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    paddingLeft: "15px",
}));

export default withTheme(HallDetails);
