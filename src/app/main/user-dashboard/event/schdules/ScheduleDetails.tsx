// import { DialogContent, Typography } from "@mui/material";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import { useSelector } from "react-redux";
// import { selectUser } from "src/app/auth/user/store/userSlice";
// import VideoPopup from "../VideoPopup";
// import { scheduleSpeakers } from "../../api/get-schedule-speakers";
// import { useQuery } from "@tanstack/react-query";
// import { useTranslation } from "react-i18next";
// import { useEffect, useState, useCallback } from "react";
// import { useNavigate, useParams } from "react-router";
// import { getEvent } from "../../api/event-details-api";
// import LocalCache from "src/utils/localCache";
// import { cacheIndex } from "app/shared-components/cache/cacheIndex";
// import { getAttendeeDetailsAPI } from "src/app/main/expo-management/manage/attendees/apis/Get-Attendees-Api";
// import { checkUsers } from "../../api/users-details-api";
// import { getTenantSlug } from "src/utils/tenantHelper";
// import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
// import { useAppDispatch } from "app/store/hooks";
// import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
// import { useSearchParams } from "react-router-dom";

// const ScheduleDetails = ({ expo, schedule, isEnded }) => {
//   const { t } = useTranslation("user-dashboard");
//   const user = useSelector(selectUser);
//   const routeParams = useParams();
//   const navigate = useNavigate();
//   const [userID, setUserID] = useState();
//   const [userRoleID, setUserRoleID] = useState();
//   const [attendees, setAttendees] = useState([]);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const [isDataReady, setIsDataReady] = useState(false);
//   const [usersLoaded, setUsersLoaded] = useState(false);
//   const dispatch = useAppDispatch();
//   const [searchParams] = useSearchParams();
//   const scheduleId = searchParams.get("schedule");
//   const [speakerData, setSpeakerData] = useState([]);

//   const [showVideoPopup] = useState(schedule?.schType === "Streaming");

//   const {
//     data: speakers,
//     error: speakersError,
//     isLoading: isLoadingSpeakers,
//     isError: isSpeakersError,
//   } = useQuery({
//     queryKey: ["scheduleSpeakers", schedule?.schId],
//     queryFn: () => scheduleSpeakers(schedule?.schId),
//     enabled: !!schedule?.schId,
//     staleTime: 0,
//     retry: 2,
//     refetchOnWindowFocus: false,
//   });

//   // Derive `isSpeaker` based on fetched data
//   const isSpeakerValue = !!speakers?.schedule_ssUserId?.some(
//     (speakerId) => speakerId === user?.uuid
//   );

//   const getInitialDetails = useCallback(async (id) => {
//     try {
//       const expoDetails = await getEvent(id);
//       if (expoDetails?.schedules.length > 0) {
//         const Selectedschedule = expoDetails.schedules.filter((_schedule) => _schedule.id === schedule.schId);
//         if (Selectedschedule.length > 0) {
//           const speakers = Selectedschedule[0].ssUserId;
//           setSpeakerData(speakers);

//           const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
//           if (!expoDetails || !userData) return;

//           const attendeesData = await getAttendeeDetailsAPI({ expoId: expoDetails.expo.id });
//           setUserID((prev) => (prev !== userData.uuid ? userData.uuid : prev));
//           setUserRoleID((prev) => (prev !== userData.roleId ? userData.roleId : prev));

//           if (attendeesData.data.length > 0) {
//             setAttendees((prev) => (prev.length !== attendeesData.data.length ? attendeesData.data : prev));
//             setUsersLoaded(true);
//           }

//           if (userData.role !== "admin") {
//             checkUserDetails(userData.uuid, expoDetails.expo.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching initial details:", error);
//     }
//   }, [schedule?.schId]);

//   const checkUserDetails = async (userId, expoId) => {
//     try {
//       const userDetails = await checkUsers(userId, expoId);
//       if (userDetails.total === 0) {
//         navigate(`/${getTenantSlug(routeParams)}/events/` + routeParams.id);
//       }
//     } catch (error) {
//       console.error("Error checking user details:", error);
//     }
//   };

//   useEffect(() => {
//     if (routeParams.id) {
//       getInitialDetails(routeParams.id);
//     }
//   }, [routeParams.id, getInitialDetails]);

//   useEffect(() => {
//     if (isRedirecting) return;

//     if (
//       expo &&
//       userRoleID &&
//       Array.isArray(attendees) &&
//       usersLoaded && 
//       schedule
//     ) {
//       setIsDataReady(true);
//     }
//   }, [expo, attendees, userRoleID, userID, usersLoaded, schedule, isRedirecting]);

//   useEffect(() => {
//     if (isRedirecting || !isDataReady) return;

//     const organiserRoleID = import.meta.env.VITE_ORGANISER_ROLE_ID?.trim();
//     const isUserAttendee = attendees?.some((user) => user.epUserId === userID);
//     const isUserSpeaker = speakerData.some((speaker) => speaker === userID);
//     const isUserOrganiser = userRoleID?.trim() === organiserRoleID;

//     if (!(isUserSpeaker || isUserAttendee || isUserOrganiser)) {
//       setIsRedirecting(true);
//       setTimeout(() => handleRedirection(), 100);
//     }
//   }, [isDataReady, isRedirecting, attendees, speakerData, userID, userRoleID]);

//   const handleRedirection = () => {
//     dispatch(
//       showMessage({
//         message: t('noAccessToThisSchedule'),
//         variant: "warning"
//       })
//     );

//     setTimeout(() => {
//       window.location.replace(`/${getTenantSlug(routeParams)}/events/join/${expo.expCode}`);
//     }, 1500);
//   };

//   return (
//     <DialogContent
//       sx={{
//         padding: { xs: "20px 15px !important" },
//         display: "flex",
//         justifyContent: 'center',
//         flexDirection: "column",
//         height: "100%",
//       }}
//     >
//       <div className="py-[20px] px-[10px]">
//         <Typography
//           color=""
//           variant="h3"
//           className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-600 mb-[16px]"
//         >
//           {isEnded && t("schedule_ended")}
//         </Typography>
//         <Typography
//           color=""
//           variant="h3"
//           className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-600 mb-[16px]"
//         >
//           {schedule?.event}
//         </Typography>
//         <Typography
//           color=""
//           variant="h4"
//           className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-400 mb-[12px]"
//         >
//           {`${schedule?.schStartDateTime}, ${schedule?.time}`}
//         </Typography>
//         <Typography
//           color=""
//           variant="h4"
//           className="text-[14px] leading-[22px] md:text-[18px] md:leading-[26px] font-400 mb-[40px]"
//         >
//           {schedule?.hours}
//         </Typography>

//         {/* showing Video Conference */}
//         {schedule?.schType === "Video Conference" && (
//           <>
//             <div className="flex items-center">
//               <svg
//                 className="me-10 min-w-[14px] min-h-[20px]"
//                 width="14"
//                 height="20"
//                 viewBox="0 0 14 20"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M7 20C5.23333 20 3.79167 19.7208 2.675 19.1625C1.55833 18.6042 1 17.8833 1 17C1 16.6 1.12083 16.2292 1.3625 15.8875C1.60417 15.5458 1.94167 15.25 2.375 15L3.95 16.475C3.8 16.5417 3.6375 16.6167 3.4625 16.7C3.2875 16.7833 3.15 16.8833 3.05 17C3.26667 17.2667 3.76667 17.5 4.55 17.7C5.33333 17.9 6.15 18 7 18C7.85 18 8.67083 17.9 9.4625 17.7C10.2542 17.5 10.7583 17.2667 10.975 17C10.8583 16.8667 10.7083 16.7583 10.525 16.675C10.3417 16.5917 10.1667 16.5167 10 16.45L11.55 14.95C12.0167 15.2167 12.375 15.5208 12.625 15.8625C12.875 16.2042 13 16.5833 13 17C13 17.8833 12.4417 18.6042 11.325 19.1625C10.2083 19.7208 8.76667 20 7 20ZM7.025 14.5C8.675 13.2833 9.91667 12.0625 10.75 10.8375C11.5833 9.6125 12 8.38333 12 7.15C12 5.45 11.4583 4.16667 10.375 3.3C9.29167 2.43333 8.16667 2 7 2C5.83333 2 4.70833 2.43333 3.625 3.3C2.54167 4.16667 2 5.45 2 7.15C2 8.26667 2.40833 9.42917 3.225 10.6375C4.04167 11.8458 5.30833 13.1333 7.025 14.5ZM7 17C4.65 15.2667 2.89583 13.5833 1.7375 11.95C0.579167 10.3167 0 8.71667 0 7.15C0 5.96667 0.2125 4.92917 0.6375 4.0375C1.0625 3.14583 1.60833 2.4 2.275 1.8C2.94167 1.2 3.69167 0.75 4.525 0.45C5.35833 0.15 6.18333 0 7 0C7.81667 0 8.64167 0.15 9.475 0.45C10.3083 0.75 11.0583 1.2 11.725 1.8C12.3917 2.4 12.9375 3.14583 13.3625 4.0375C13.7875 4.92917 14 5.96667 14 7.15C14 8.71667 13.4208 10.3167 12.2625 11.95C11.1042 13.5833 9.35 15.2667 7 17ZM7 9C7.55 9 8.02083 8.80417 8.4125 8.4125C8.80417 8.02083 9 7.55 9 7C9 6.45 8.80417 5.97917 8.4125 5.5875C8.02083 5.19583 7.55 5 7 5C6.45 5 5.97917 5.19583 5.5875 5.5875C5.19583 5.97917 5 6.45 5 7C5 7.55 5.19583 8.02083 5.5875 8.4125C5.97917 8.80417 6.45 9 7 9Z"
//                   fill="#5046E5"
//                 />
//               </svg>
//               <Typography
//                 variant="h4"
//                 className="text-[14px] leading-[22px] md:text-[16px] md:leading-[24px] font-500  mb-[0] underline text-[#5046E5] cursor-pointer"
//                 onClick={() =>
//                   window.open(schedule?.schParticipantLink, "_blank")
//                 }
//               >
//                 {isSpeakerValue
//                   ? schedule?.schSpeakerLink
//                   : schedule?.schParticipantLink}
//               </Typography>
//             </div>
//           </>
//         )}

//         {/* showing offline schedule details */}
//         {expo.expVenue && schedule?.schType === "Offline" && (
//           <div className="pb-10 flex flex-row gap-10">
//             <FuseSvgIcon
//               className="text-48 mb-10"
//               size={20}
//               color="primary.main"
//             >
//               feather:map-pin
//             </FuseSvgIcon>
//             <div className=" align-middle">
//               <Typography
//                 color="text.primary"
//                 className="font-semibold text-[18px] lg:text-[18px] block mb-8"
//               >
//                 {expo.expVenue}
//               </Typography>
//               <Typography
//                 color="common.black"
//                 className="font-normal text-[16px] lg:text-[18px] block"
//               >
//                 {expo.expAddress}
//               </Typography>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Render VideoPopup only when schedule type is Streaming */}
//       {schedule?.schType === "Streaming" && <VideoPopup schedule={schedule} />}
//     </DialogContent>
//   );
// };

// export default ScheduleDetails;

import { DialogContent, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useSelector } from "react-redux";
import { selectUser } from "src/app/auth/user/store/userSlice";
import VideoPopup from "../VideoPopup";
import { scheduleSpeakers } from "../../api/get-schedule-speakers";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getEvent } from "../../api/event-details-api";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getAttendeeDetailsAPI } from "src/app/main/expo-management/manage/attendees/apis/Get-Attendees-Api";
import { checkUsers } from "../../api/users-details-api";
import { getTenantSlug } from "src/utils/tenantHelper";
import { isSpeaker } from "src/utils/isSpeakerBoothManager";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { useSearchParams } from "react-router-dom";

const ScheduleDetails = ({ expo, schedule, isEnded }) => {
  const { t } = useTranslation("user-dashboard");
  const user = useSelector(selectUser);
  const routeParams = useParams();
  const navigate = useNavigate();
  const [userID, setUserID] = useState();
  const [userRoleID, setUserRoleID] = useState();
  const [attendees, setAttendees] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false); // Track when users are loaded
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get("schedule");
  const [speakerData, setSpeakerData] = useState([]);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  const {
    data: speakers,
    error: speakersError,
    isLoading: isLoadingSpeakers,
    isError: isSpeakersError,
  } = useQuery({
    queryKey: ["scheduleSpeakers", schedule?.schId],
    queryFn: () => scheduleSpeakers(schedule?.schId),
    enabled: !!schedule?.schId,
    staleTime: 0,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Derive `isSpeaker` based on fetched data
  const isSpeaker = !!speakers?.schedule_ssUserId?.some(
    (speakerId) => speakerId === user?.uuid
  );

  // showing streaming

  const getInitialDetails = useCallback(async (id) => {
    try {
      const expoDetails = await getEvent(id);
      if (expoDetails?.schedules.length > 0) {
        const Selectedschedule = expoDetails.schedules.filter((_schedule) => _schedule.id === schedule.schId);
        if (Selectedschedule.length > 0) {
          const speakers = Selectedschedule[0].ssUserId;
          setSpeakerData(speakers);

          const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
          if (!expoDetails || !userData) return;

          const attendeesData = await getAttendeeDetailsAPI({ expoId: expoDetails.expo.id });
          // setExpo((prev) => (prev?.id !== expoDetails.expo.id ? expoDetails.expo : prev));
          setUserID((prev) => (prev !== userData.uuid ? userData.uuid : prev));
          setUserRoleID((prev) => (prev !== userData.roleId ? userData.roleId : prev));
          // setSchedules((prev) => (prev.length !== expoDetails.schedules.length ? expoDetails.schedules : prev));
          // setIsExpo(true);

          if (attendeesData.data.length > 0) {
            setAttendees((prev) => (prev.length !== attendeesData.data.length ? attendeesData.data : prev));
            setUsersLoaded(true);
          }

          if (userData.role !== "admin") {
            checkUserDetails(userData.uuid, expoDetails.expo.id);
          }
        }
      }

      const queryParams = new URLSearchParams(location.search);
    } catch (error) {
      console.error("Error fetching initial details:", error);
    }
  }, [schedule?.schId]);

  const checkUserDetails = async (userId, expoId) => {
    const userDetails = await checkUsers(userId, expoId);
    if (userDetails.total == 0) {
      navigate(`/${getTenantSlug(routeParams)}/events/` + routeParams.id);
    }
  }

  useEffect(() => {
    if (routeParams.id) {
      getInitialDetails(routeParams.id);
    }
  }, [expo, getInitialDetails, routeParams.id]);

  useEffect(() => {
    if (isRedirecting) return;
    if (
      expo &&
      userRoleID &&
      Array.isArray(attendees) &&
      usersLoaded && schedule
    ) {
      setIsDataReady(true);
    }
  }, [expo, attendees, speakerData, userRoleID, userID, usersLoaded, isRedirecting, schedule]);

  useEffect(() => {
    if (isRedirecting || !isDataReady) return;

    const organiserRoleID = import.meta.env.VITE_ORGANISER_ROLE_ID?.trim();
    const isUserAttendee = attendees?.some((user) => user.epUserId === userID);
    const isUserSpeaker = speakerData.some((speaker: any) => {
      return (speaker === userID);
    });
    const isUserOrganiser = userRoleID?.trim() === organiserRoleID;

    if (!(isUserSpeaker || isUserAttendee || isUserOrganiser)) {
      setIsRedirecting(true);
      setTimeout(() => handleRedirection(), 100);
    }

    // Set state to show VideoPopup instead of returning JSX

  }, [isDataReady, isRedirecting, attendees, speakerData, userID, userRoleID]);

  const handleRedirection = () => {
    dispatch(showMessage({
      message: t('noAccessToThisSchedule'),
      variant: "warning"
    }));

    setTimeout(() => {
      window.location.replace(`/${getTenantSlug(routeParams)}/events/join/${expo.expCode}`);
    }, 1500);
  }

  return (
    <DialogContent
      sx={{
        padding: { xs: "20px 15px !important" },
        display: "flex",
        justifyContent: 'center',
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div className="py-[20px] px-[10px]">
        <Typography
          color=""
          variant="h3"
          className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-600 mb-[16px]"
        >
          {isEnded && t("schedule_ended")}
        </Typography>
        <Typography
          color=""
          variant="h3"
          className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-600 mb-[16px]"
        >
          {schedule?.event}
        </Typography>
        <Typography
          color=""
          variant="h4"
          className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-400 mb-[12px]"
        >
          {`${schedule?.schStartDateTime}, ${schedule?.time}`}
        </Typography>
        <Typography
          color=""
          variant="h4"
          className="text-[14px] leading-[22px] md:text-[18px] md:leading-[26px] font-400 mb-[40px]"
        >
          {schedule?.hours}
        </Typography>

        {/* showing Video Conference */}
        {schedule?.schType === "Video Conference" && (
          <>
            <div className="flex items-center">
              <svg
                className="me-10 min-w-[14px] min-h-[20px]"
                width="14"
                height="20"
                viewBox="0 0 14 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 20C5.23333 20 3.79167 19.7208 2.675 19.1625C1.55833 18.6042 1 17.8833 1 17C1 16.6 1.12083 16.2292 1.3625 15.8875C1.60417 15.5458 1.94167 15.25 2.375 15L3.95 16.475C3.8 16.5417 3.6375 16.6167 3.4625 16.7C3.2875 16.7833 3.15 16.8833 3.05 17C3.26667 17.2667 3.76667 17.5 4.55 17.7C5.33333 17.9 6.15 18 7 18C7.85 18 8.67083 17.9 9.4625 17.7C10.2542 17.5 10.7583 17.2667 10.975 17C10.8583 16.8667 10.7083 16.7583 10.525 16.675C10.3417 16.5917 10.1667 16.5167 10 16.45L11.55 14.95C12.0167 15.2167 12.375 15.5208 12.625 15.8625C12.875 16.2042 13 16.5833 13 17C13 17.8833 12.4417 18.6042 11.325 19.1625C10.2083 19.7208 8.76667 20 7 20ZM7.025 14.5C8.675 13.2833 9.91667 12.0625 10.75 10.8375C11.5833 9.6125 12 8.38333 12 7.15C12 5.45 11.4583 4.16667 10.375 3.3C9.29167 2.43333 8.16667 2 7 2C5.83333 2 4.70833 2.43333 3.625 3.3C2.54167 4.16667 2 5.45 2 7.15C2 8.26667 2.40833 9.42917 3.225 10.6375C4.04167 11.8458 5.30833 13.1333 7.025 14.5ZM7 17C4.65 15.2667 2.89583 13.5833 1.7375 11.95C0.579167 10.3167 0 8.71667 0 7.15C0 5.96667 0.2125 4.92917 0.6375 4.0375C1.0625 3.14583 1.60833 2.4 2.275 1.8C2.94167 1.2 3.69167 0.75 4.525 0.45C5.35833 0.15 6.18333 0 7 0C7.81667 0 8.64167 0.15 9.475 0.45C10.3083 0.75 11.0583 1.2 11.725 1.8C12.3917 2.4 12.9375 3.14583 13.3625 4.0375C13.7875 4.92917 14 5.96667 14 7.15C14 8.71667 13.4208 10.3167 12.2625 11.95C11.1042 13.5833 9.35 15.2667 7 17ZM7 9C7.55 9 8.02083 8.80417 8.4125 8.4125C8.80417 8.02083 9 7.55 9 7C9 6.45 8.80417 5.97917 8.4125 5.5875C8.02083 5.19583 7.55 5 7 5C6.45 5 5.97917 5.19583 5.5875 5.5875C5.19583 5.97917 5 6.45 5 7C5 7.55 5.19583 8.02083 5.5875 8.4125C5.97917 8.80417 6.45 9 7 9Z"
                  fill="#5046E5"
                />
              </svg>
              <Typography
                variant="h4"
                className="text-[14px] leading-[22px] md:text-[16px] md:leading-[24px] font-500  mb-[0] underline text-[#5046E5] cursor-pointer"
                onClick={() =>
                  window.open(schedule?.schParticipantLink, "_blank")
                }
              >
                {isSpeaker
                  ? schedule?.schSpeakerLink
                  : schedule?.schParticipantLink}
              </Typography>
            </div>
          </>
        )}

        {/* showing offline schedule details */}
        {expo.expVenue && schedule?.schType === "Offline" && (
          <div className="pb-10 flex flex-row gap-10">
            <FuseSvgIcon
              className="text-48 mb-10"
              size={20}
              color="primary.main"
            >
              feather:map-pin
            </FuseSvgIcon>
            <div className=" align-middle">
              <Typography
                color="text.primary"
                className="font-semibold text-[18px] lg:text-[18px] block mb-8"
              >
                {expo.expVenue}
              </Typography>
              <Typography
                color="common.black"
                className="font-normal text-[16px] lg:text-[18px] block"
              >
                {expo.expAddress}
              </Typography>
            </div>
          </div>
        )}
      </div>
      {schedule?.schType === "Streaming" && <VideoPopup schedule={schedule} />}
    </DialogContent>
  );
};

export default ScheduleDetails;
