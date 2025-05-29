import { useQuery } from "@tanstack/react-query";
import { getSingleExpoAPI, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { boothDetails } from "app/shared-components/components/expoPreview/booth/api/boothDetails";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import LocalCache from "src/utils/localCache";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { useTheme, useMediaQuery } from "@mui/material";
import Divider from "@mui/material/Divider";
import { expoBoothResourcesUrl } from "src/utils/urlHelper";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { getTenantId, getTenantSlug } from "src/utils/tenantHelper";
import { useTranslation } from "react-i18next";
import BoothChat from "./BoothChat";
import BoothLayoutManager from "app/shared-components/components/expoPreview/booth/BoothLayoutMap";
import { useSelector } from "react-redux";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { checkExpoRegistrationStatus } from "../../api/check-expo-reg-status";
import FuseLoading from "@fuse/core/FuseLoading";
import { isBoothManager, isSpeaker } from "src/utils/isSpeakerBoothManager";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getEvent } from "../../api/event-details-api";
import { getAttendeeDetailsAPI } from "src/app/main/expo-management/manage/attendees/apis/Get-Attendees-Api";
import { GetBoothManagers } from "../../api/getBoothManagers";
import { checkUsers, getUsers } from "../../api/users-details-api";
import { searchBySchId } from "src/utils/schedule.helper";
import React from "react";
import { useDebounce } from "@fuse/hooks";

const Root = styled("div")(({ theme }) => ({}));
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
  expLayoutId: string
}
type Schedules = {
  schedules: [],
}
function Booth() {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState(); // Track dialog type
  const [boothResources, setBoothResources] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const iconSize = isSmallScreen ? 22 : 30;
  const dispatch = useAppDispatch();
  const routeParams = useParams();
  const tenant_id_without_slug = getTenantId(routeParams);
  const { t } = useTranslation("booth");
  const { booth_id, id, tenant_id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser)
  const [expo, setExpo] = useState<Expo | null>(null);
  const [userID, setUserID] = useState();
  const [userRole, setUserRole] = useState("");
  const [userRoleID, setUserRoleID] = useState();
  const [users, setUsers] = React.useState([]);
  const [isExpo, setIsExpo] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState(null)
  const [usersLoaded, setUsersLoaded] = useState(false); // Track when users are loaded
  const [attendees, setAttendees] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [boothId, setBoothId] = useState<String | null>();
  const [isDataReady, setIsDataReady] = useState(false);
  const {
    data: registrationStatus,
    error: registrationError,
    isLoading: isLoadingRegistration,
  } = useQuery({
    queryKey: ["expoRegistrationStatus", id],
    queryFn: async () => await checkExpoRegistrationStatus(id),
    enabled: !!id,
    staleTime: 0,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  if (registrationStatus) {
    if (!registrationStatus?.expoCheckUserRegistrationStatus && user?.role !== "admin") {
      navigate(`/${tenant_id}/events/${id}`);
      dispatch(
        showMessage({
          message: t("booth_not_registered_error_message"),
          variant: "error",
        }))
    }
  }

  if (registrationError) {
    navigate(`/${tenant_id}/events/${id}`);
    dispatch(
      showMessage({
        message: t("booth_internal_server_error"),
        variant: "error",
      }))
  }

  // Handle dialog open
  const handleOpen = (type) => {
    setDialogType(type);
    if (type === "download") {
    }
    setOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
  };

  const {
    data: booth,
    error: boothError,
    isLoading: isLoadingBooth,
  } = useQuery({
    queryKey: ["boothDetails", booth_id],
    queryFn: async () => {
      const details = await boothDetails(booth_id);
      return details?.booth;
    },
    staleTime: 300000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const {
    data: expoDetails,
    error: expoError,
    isLoading: isLoadingExpo,
  } = useQuery({
    queryKey: ["expoDetails", id], // Unique key for caching
    queryFn: async () => {
      const cachedData = await LocalCache.getItem(`expoDetails_${id}`);
      if (cachedData !== undefined && cachedData !== null) {
        await LocalCache.setItem(`expoDetails_${id}`, cachedData.data);
        return cachedData.data.expo
      } else {
        const _expo_Details = await getSingleExpoAPI(id);
        await LocalCache.setItem(`expoDetails_${id}`, _expo_Details.data);
        return _expo_Details.data.expo;
      }
    },
    enabled: !!id, // Only run the query if id is available
    staleTime: 0, // Keep the data fresh for 5 minutes
    retry: 2, // Retry the request up to 2 times if it fails
    refetchOnWindowFocus: false, // Avoid refetching when the window is focused
  });

  const [data, setData] = useState({
    layout: expoDetails?.expLayoutId,
    data: booth,
    booth: `booth_${booth?.data?.boothOrder}`,
  });

  useEffect(() => {
    if (expoDetails !== undefined && expoDetails !== null) {
      setData({
        layout: expoDetails?.expLayoutId,
        data: booth,
        booth: `booth_${booth?.boothOrder}`,
      });
      if (booth) {
        setBoothResources(booth?.boothResources?.files);
      }
    }
  }, [expoDetails, booth]);

  const downloadBoothResources = async (url_partial) => {
    const url = expoBoothResourcesUrl(url_partial, tenant_id_without_slug);

    // Fetch the file as a Blob
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {},
      });
      const blob = await response.blob();

      // Create a temporary link element
      const link = document.createElement("a");
      const blobUrl = window.URL.createObjectURL(blob);

      link.href = blobUrl;
      link.setAttribute("download", url_partial); // Specify the file name

      // Append link to the body (not visible) and trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Release the object URL

      dispatch(
        showMessage({
          message: t("booth_resources_download_shortly_message"),
          variant: "success",
        })
      );
    } catch (error) {
      dispatch(
        showMessage({
          message: t("booth_resources_download_error_message"),
          variant: "error",
        })
      );
    }
  };

  const getInitialDetails = (async (id) => {
    try {
      const _expoDetails = await getEvent(id);
      const boothId = routeParams.booth_id;
      if (boothId !== undefined || boothId !== null) {
        setBoothId(boothId);
      }
      const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
      if (!_expoDetails || !userData) return;

      const attendeesData = await getAttendeeDetailsAPI({ expoId: _expoDetails.expo.id });
      setExpo((prev) => (prev?.id !== _expoDetails.expo.id ? _expoDetails.expo : prev));
      setUserID((prev) => (prev !== userData.uuid ? userData.uuid : prev));
      setUserRoleID((prev) => (prev !== userData.roleId ? userData.roleId : prev));
      setSchedules((prev) => (prev.length !== _expoDetails.schedules.length ? _expoDetails.schedules : prev));
      setIsExpo(true);

      if (attendeesData.data.length >= 0) {
        setAttendees((prev) => (prev.length !== attendeesData.data.length ? attendeesData.data : prev));
        setUsersLoaded(true);
      }

      if (userData.role !== "admin") {
        checkUserDetails(userData.uuid, _expoDetails.expo.id);
      }

      const queryParams = new URLSearchParams(location.search);
      setScheduleId(queryParams.get("schedule") || null);
    } catch (error) {
      console.error("Error fetching initial details:", error);
    }
  });

  useEffect(() => {
    getInitialDetails(routeParams.id);
  }, [expoDetails, getInitialDetails, boothId]);

  const checkUserDetails = async (userId, expoId) => {
    const userDetails = await checkUsers(userId, expoId);
    if (userDetails.total == 0) {
      navigate(`/${getTenantSlug(routeParams)}/events/` + routeParams.id);
    }
  }

  const getUsersDetails = async (id) => {
    const usersDetails = await getUsers(id);
    if (usersDetails) {
      setUsers(usersDetails);
    }
  }

  useEffect(() => {
    if (isRedirecting) return;
    if (
      expo &&
      userRoleID &&
      Array.isArray(attendees) &&
      usersLoaded && booth
    ) {
      setIsDataReady(true);
    }
  }, [expo, attendees, userRoleID, userID, usersLoaded, isRedirecting, booth]);

  useEffect(() => {
    if (isRedirecting || !isDataReady) return;

    const organiserRoleID = import.meta.env.VITE_ORGANISER_ROLE_ID?.trim();
    const isUserAttendee = attendees?.some((user) => user.epUserId === userID);
    const isUserBoothManager = isBoothManager(booth, userID, routeParams.booth_id, false, []);
    const isUserOrganiser = userRoleID?.trim() === organiserRoleID;

    if (!(isUserBoothManager || isUserAttendee || isUserOrganiser)) {
      setIsRedirecting(true);
      setTimeout(() => handleRedirection(), 100);
    }
  }, [isDataReady, isRedirecting]);

  const handleRedirection = () => {
    dispatch(showMessage({
      message: t('noAccessToThisBooth'),
      variant: "warning"
    }));

    setTimeout(() => {
      window.location.replace(`/${getTenantSlug(routeParams)}/events/join/${expo?.expCode}`);
    }, 1500);
  }

  if (isLoadingBooth && isLoadingExpo) {
    return (
      <FuseLoading />
    )
  }

  return (
    <Root>
      <Box
        className="min-h-screen min-w-screen relative"
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <Button
          className="min-w-[initial] max-h-[initial] rounded-[50%] p-0 w-[42px] h-[42px] md:w-[54px] md:h-[54px] absolute left-[15px] top-[15px] md:left-[30px] md:top-[30px] cursor-pointer"
          sx={{
            backgroundColor: "background.default",
            boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.12) !important",
          }}
          variant="contained"
          onClick={() => navigate(`/${tenant_id}/events/join/${id}`)}
        >
          <FuseSvgIcon size={iconSize} color="primary">
            material-outline:arrow_back_ios
          </FuseSvgIcon>
        </Button>

        <div className="w-full h-full object-contain flex items-center justify-center">
          {booth?.boothCode && expo?.expLayoutId && (
            <BoothLayoutManager data={data} />
          )}
        </div>

        <div className="flex items-center justify-center absolute right-[15px] bottom-[15px] md:right-[30px] md:bottom-[30px] space-x-[14px]">
          {/* Download Button */}
          <Button
            onClick={() => handleOpen("download")}
            className={`min-w-[initial] max-h-[initial] rounded-[50%] p-0 w-[42px] h-[42px] md:w-[54px] md:h-[54px] cursor-pointer`}
            sx={{
              backgroundColor:
                dialogType === "download" ? "#6F43D6" : "#FFFFFF",
              color: dialogType === "download" ? "#FFFFFF" : "#6F43D6",
              boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.12) !important",
              "&:hover": {
                backgroundColor:
                  dialogType === "download" ? "#5B36B3" : "#F0F0F0",
              },
              "&:active": {
                backgroundColor:
                  dialogType === "download" ? "#4A2D91" : "#E0E0E0",
              },
            }}
            variant="contained"
          >
            <FuseSvgIcon size={iconSize}>
              material-outline:file_download
            </FuseSvgIcon>
          </Button>

          {/* Chat Button */}
          <Button
            onClick={() => handleOpen("chat")}
            className={`min-w-[initial] max-h-[initial] rounded-[50%] p-0 w-[42px] h-[42px] md:w-[54px] md:h-[54px] cursor-pointer`}
            sx={{
              backgroundColor: dialogType === "chat" ? "#6F43D6" : "#FFFFFF",
              color: dialogType === "chat" ? "#FFFFFF" : "#6F43D6",
              boxShadow: "0px 4px 10px 0px rgba(0,0,0,0.12) !important",
              "&:hover": {
                backgroundColor: dialogType === "chat" ? "#5B36B3" : "#F0F0F0",
              },
              "&:active": {
                backgroundColor: dialogType === "chat" ? "#4A2D91" : "#E0E0E0",
              },
            }}
            variant="contained"
          >
            <FuseSvgIcon size={iconSize}>feather:message-square</FuseSvgIcon>
          </Button>
        </div>
      </Box>

      {/* Dialog Box */}
      <Dialog
        open={open}
        onClose={handleClose}
        BackdropProps={{ style: { display: "none" } }}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100vh",
            position: "absolute",
            right: { xs: "inherit", sm: "30px" },
            maxWidth: { xs: "100%", sm: "380px" },
            maxHeight: { xs: "calc(100vh - 70px)", sm: "calc(100vh - 140px)" },
            top: { xs: 0, sm: "30px" },
            margin: 0,
            borderRadius: { xs: "0", sm: "12px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: "16px !important",
          }}
        >
          <div className="mb-0 pe-20">
            <Typography
              color="text.primary"
              variant="h6"
              className="font-semibold text-[16px] block mb-0 truncate"
            >
              {dialogType === "chat" ? "Chats" : "Assets"}
            </Typography>
          </div>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "0 !important",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <div className="space-y-20 flex flex-col h-full">
            {dialogType === "chat" ? (
              // chat content
              <BoothChat expo={expoDetails} booth_manager_id={booth?.boothManager?.id} booth_id={booth_id} />
            ) : (
              // download content
              <div>
                {boothResources?.length > 0 ? (
                  boothResources?.map((user, index) => (
                    <div key={index} className="">
                      {" "}
                      {/* Added key prop here */}
                      <div className="flex items-center p-[16px]">
                        <div className="flex items-center flex-1 overflow-hidden pe-20">
                          {/* Icon */}
                          <span className="cursor-pointer me-10">
                            <FuseSvgIcon size={24} color="#808080">
                              feather:file
                            </FuseSvgIcon>
                          </span>
                          {/* Filename */}
                          <Typography
                            component="span"
                            className="font-normal text-[14px] block mb-0 truncate whitespace-nowrap"
                          >
                            {user?.name}
                          </Typography>
                        </div>

                        {/* Download Icon */}
                        <span
                          onClick={() => downloadBoothResources(user?.link)}
                          className="cursor-pointer"
                        >
                          <FuseSvgIcon size={24} color="primary">
                            material-outline:file_download
                          </FuseSvgIcon>
                        </span>
                      </div>
                      {/* Divider */}
                      <Divider className="my-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-[16px] flex items-center justify-center align-middle justify-items-center h-full w-full">
                    No resources found.
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>

        {/* {dialogType === "chat" && (
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        )} */}
      </Dialog>
    </Root>
  );
}

export default Booth;
