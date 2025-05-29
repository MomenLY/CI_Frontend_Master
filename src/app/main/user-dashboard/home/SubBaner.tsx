import React, { useEffect, useRef, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";
import { useNavigate, useParams } from "react-router";
import { checkDate, expoFormatDate, expoFormatDateCheck, formatDate, getTimer } from "src/utils/dateformatter";
import QRCodeModal from "../common/QRCodeModal";
import { useTranslation } from "react-i18next";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import FuseCountdown from "@fuse/core/FuseCountdown";
import { checkUsersCount } from "../api/users-details-api";
import { getTenantSlug } from "src/utils/tenantHelper";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSettings, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { getUserDetailsAPI } from "../../users/apis/userAPI";
import { GetUserAPI } from "../../users/apis/Get-User-Api";
import { GetBoothManagers } from "../api/getBoothManagers";
import { getTimeZoneSettings } from "src/utils/getSettings";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  ThreadsShareButton,
  ThreadsIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';
import { getEvent } from "../api/event-details-api";

function SubBanner({
  qrCode,
  banner,
  description,
  startDate,
  endDate,
  isPaid,
  price,
  isRegistration,
  expCode,
  expRegistrationStartDate,
  expRegistrationEndDate,
  expIsSeatsUnlimited,
  expMaxSeats,
  expoId,
  expoTenantId,
  expoSpeakers,
  expRegistrationEndType,
  expName,
  expDescription
}) {
  const [openedTab, setOpenedTab] = React.useState(null);
  const [warningText, setWarningText] = useState("");
  const [timeZone1, setTimeZone1] = useState("");
  const [warningTextColor, setWarningTextColor] = useState("#FB9E13");
  const [isWarning, setIsWarning] = useState(false);
  const [isJoin, setIsJoin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isTimer, setIsTimer] = useState(false);
  const routerparams = useParams();
  const [boothManagers, setBoothManagers] = useState();
  const [userData, setUserData] = useState();
  const [speakerRoleId, setSpeakerRoleId] = useState();
  const [boothManagerRoleId, setBoothManagerRoleId] = useState();
  const routeParams = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('user-dashboard');
  const [organiserRoleId, setOrganiserRoleId] = useState();
  const [formattedStartDate, setFormattedStartDate] = useState<string | Date | null>(null);
  const [formattedEndDate, setFormattedEndDate] = useState<string | Date | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    const formatDates = async () => {
      const timeZone = await getTimeZoneSettings();
      setTimeZone1(timeZone);
      const start = expoFormatDate(startDate, true, false, false, timeZone, false);
      const end = expoFormatDate(endDate, true, true, true, timeZone, false);
      setFormattedStartDate(start);
      setFormattedEndDate(end);
    };
    formatDates();
  }, [startDate, endDate]);

  const handleShare = () => {
    setShowShareOptions((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleExpoRegistration = async () => {
      if (endDate == null) {
        return
      }
      if (expRegistrationEndType == 'Immediate') {
        expRegistrationEndDate = startDate;
      }
      if (qrCode) {
        if (checkDate(endDate, "lessThan")) { // event ended condition
          setWarningText('uD_Expo_warning_expo_ended');
          setWarningTextColor("#FB9E13");
          setIsWarning(true);
          setIsTimer(false);
          setIsRegister(false);
        } else if (checkDate(startDate, "lessThanOrEqual") && checkDate(endDate, "greaterThanOrEqual")) {
          setIsWarning(false);
          setIsTimer(false);
          setIsRegister(false);
          setIsJoin(true);
        } else if (checkDate(expoFormatDateCheck(expRegistrationStartDate, timeZone1), "lessThanOrEqual") && checkDate(expoFormatDateCheck(expRegistrationEndDate, timeZone1), "greaterThanOrEqual")) { // event start date checking condition{//(checkDate(startDate, "lessThan")) {
          setIsWarning(false);
          setIsTimer(checkDate(startDate, "greaterThan"));
          setIsRegister(false);
          setIsJoin(false);
        } else if (checkDate(expoFormatDateCheck(expRegistrationStartDate, timeZone1), "greaterThanOrEqual")) {
          setIsWarning(false);
          setIsTimer(false);
          setIsRegister(false);
          setIsJoin(true);
        } else {
          setWarningText('uD_Expo_warning_expo_not_started');
          setIsWarning(true);
          setIsTimer(true);
          setIsRegister(false);
          setIsJoin(false);
        }
      } else {
        if (userData?.roleId === boothManagerRoleId || userData?.roleId === speakerRoleId || userData?.roleId === organiserRoleId) {
          if (checkDate(startDate, "lessThanOrEqual") && checkDate(endDate, "greaterThanOrEqual")) {
            if ((expoSpeakers.some((speaker: any) => speaker._id === userData?.uuid)) || (boothManagers?.some((boothManager: any) => boothManager === userData?.uuid)) || userData?.roleId === organiserRoleId) {
              setIsWarning(false);
              setIsTimer(false);
              setIsRegister(false);
              setIsJoin(true);
            } else {
              setIsWarning(false);
              setIsTimer(false);
              setIsRegister(false);
              setIsJoin(false);
            }
          } else
            if (checkDate(endDate, "lessThan")) {
              setWarningText('uD_Expo_warning_expo_ended');
              setWarningTextColor("#FB9E13");
              setIsWarning(true);
              setIsTimer(false);
              setIsRegister(false);
              setIsJoin(false);
            } else {
              setIsWarning(false);
              setIsTimer(true);
              setIsRegister(false);
              setIsJoin(false);
            }
        } else {
          // } else {
          if (checkDate(endDate, "lessThan")) { // event ended condition
            setWarningText('uD_Expo_warning_expo_ended');
            setWarningTextColor("#FB9E13");
            setIsWarning(true);
            setIsTimer(false);
            setIsRegister(false);
            setIsJoin(false);
          } else if (checkDate(expoFormatDateCheck(expRegistrationEndDate, timeZone1), "lessThan")) { // event registration end condition
            setWarningText('uD_Expo_warning_registration_closed');
            setWarningTextColor("#FB9E13");
            setIsWarning(true);
            setIsTimer(false);
            setIsRegister(false);
          } else if (!isRegistration) {
            setWarningText('uD_Expo_warning_temporary_closed');
            setWarningTextColor("#FB9E13");
            setIsWarning(true);
            setIsTimer(false);
            setIsRegister(false);
            setIsJoin(false);
          } else if (checkDate(expoFormatDateCheck(expRegistrationStartDate, timeZone1), "lessThanOrEqual") && checkDate(expoFormatDateCheck(expRegistrationEndDate, timeZone1), "greaterThanOrEqual")) {
            if (!expIsSeatsUnlimited) {
              const totalRegistrations = await checkUserCount(expoId);
              if (totalRegistrations >= expMaxSeats) {
                setWarningText('uD_Expo_warning_seats_full');
                setWarningTextColor("#EF4444");
                setIsWarning(true);
                setIsRegister(false);
              } else {
                setIsWarning(false);
                setIsJoin(false);
                setIsRegister(true);
                setIsTimer(false);
              }
            } else {
              setIsWarning(false);
              setIsJoin(false);
              setIsRegister(true);
              setIsTimer(checkDate(startDate, "greaterThan"));
            }
          }
        }
      }
    };

    handleExpoRegistration();
  }, [endDate, qrCode, userData, boothManagerRoleId, speakerRoleId]);

  useEffect(() => {
    fetchandCheckRole();
  }, []);

  const fetchandCheckRole = async () => {
    const expoDetails = await getEvent(routeParams.id);
    if (!expoDetails) return;
    await LocalCache.setItem(`expoDetails_${expoDetails.expo.id}`, expoDetails?.data)
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    // let boothManagerRoleId = settings?.boothManagerRoleId;
    let speakerRoleId = settings?.speakerRoleId;
    setSpeakerRoleId(speakerRoleId);
    let organiserRoleId = import.meta.env.VITE_ORGANISER_ROLE_ID;
    setOrganiserRoleId(organiserRoleId)
    let boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
    setBoothManagerRoleId(boothManagerRoleId);
    const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null))
    if (userData) {
      setUserData(userData);
    }
    const boothManagers = await GetBoothManagers(routeParams.id)
    setBoothManagers(boothManagers.boothManagers)
  }

  const checkUserCount = async (expoId) => {
    const userDetails = await checkUsersCount(expoId);
    return userDetails.total;
  }

  const handleRegister = () => {
    navigate("proceed-to-pay");
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleJoin = () => {
    const url = `/${getTenantSlug(routerparams)}/events/join/` + expCode; // Replace with your desired URL

    if (openedTab && !openedTab.closed) {
      openedTab.focus();
    } else {
      const newTab = window.open(url, "_blank");
      setOpenedTab(newTab);
    }
  };

  const shareContent = `🌟 ${expName} 🌟\n\n${expDescription}\n\n🔗 ${t('clickHereToSeeMoreAboutExpo')}`;
  const shareUrl = `${import.meta.env.VITE_TENANT_URL}/${getTenantSlug(routerparams)}/events/` + expCode;

  return (
    <>
      <div className="pt-16 md:pt-24 relative">
        <Box
          className="flex flex-col relative"
          sx={{
            minHeight: { xs: "350px", md: "425px" },
            padding: { xs: "60px 25px 25px 25px", md: "60px" },
            backgroundImage: `url('/assets/images/details-bg.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundPosition: "center",
            position: "relative",
            ...(expoId ? { // Conditionally set background image and gradient
              backgroundImage: `url('${banner}')`,
              '&:before': {
                content: '""',
                background: "linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(252, 176, 69, 0) 100%)",
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                opacity: 0,
                animation: 'fadeIn 1s forwards', // Use keyframes for automatic fade-in
              }
            } : {
              background: "linear-gradient(90deg, rgba(0, 0, 0, .51) 0%, rgba(0, 0, 0, .51) 100%)"
            }),
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}

        >
          <div className="absolute top-[10px] md:top-[24px] right-[24px] flex items-center gap-[30px]">
            {/* Share Button (Always Visible) */}
            <div>
              <span className="text-white cursor-pointer" onClick={handleShare}>
                <FuseSvgIcon size={32}>material-outline:share</FuseSvgIcon>
              </span>
            </div>

            {/* QR Code (Conditionally Rendered) */}
            {qrCode && (
              <div className="cursor-pointer" onClick={handleClickOpen}>
                <img src="assets/images/qr-code.svg" className="w-[30px] h-[30px]" alt="QR Code" />
              </div>
            )}
          </div>

          {/* <img
            src="assets/images/qr-code.svg"
            className="w-[30px] h-[30px]"
            alt=""
          /> */}
          {/* </div>
          )} */}

          {
            showShareOptions &&
            <div className="absolute top-[50px] md:top-[70px] right-[24px] bg-white p-[15px] shadow-md rounded-md flex flex-col gap-3">
              {/* Close Button Row */}
              <div className="flex justify-between ">
                <p>{t('shareViaText')}</p>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className=""
                >
                  <FuseSvgIcon size={16}>material-outline:close</FuseSvgIcon>
                </button>
              </div>

              {/* Divider */}
              <hr className="border-gray-300 mt-5" />

              {/* Share Buttons Row */}
              <div className="flex gap-3 mt-5">
                {/* Facebook */}
                <FacebookShareButton url={shareUrl} title={shareContent}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                {/* Twitter */}
                <TwitterShareButton url={shareUrl} title={shareContent}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>

                {/* WhatsApp */}
                <WhatsappShareButton url={shareUrl} title={shareContent}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                {/* Threads */}
                <ThreadsShareButton url={shareUrl} title={shareContent}>
                  <ThreadsIcon round size={32} />
                </ThreadsShareButton>

                <LinkedinShareButton url={shareUrl} title={expName}>
                  <LinkedinIcon round size={32} />
                </LinkedinShareButton>
              </div>
            </div>
          }
          <div className="flex flex-col flex-1 items-start h-full max-w-[500px] relative">

            <div className="flex-1">
              <Typography
                className="font-semibold mb-10 line-clamp-2"
                color="common.white"
                sx={{
                  fontSize: { xs: "24px", md: "28px", lg: "32px", },
                  lineHeight: { xs: "34px", md: "38px", lg: "42px" },
                }}

              >
                {description ? description : ""}
              </Typography>
              <Typography
                className="font-normal mb-10 md:mb-16 line-clamp-1"
                color="text.disabled"
                sx={{
                  fontSize: { xs: "14px", md: "16px", lg: "18px" },
                  lineHeight: { xs: "20px", md: "24px", lg: "28px" },
                }}
              >
                {/* {expCreator ? expCreator : ""} */}
              </Typography>
              {
                endDate !== null &&
                <Typography
                  className="font-bold mb-10 md:mb-24 line-clamp-1"
                  color="common.white"
                  sx={{
                    fontSize: { xs: "14px", md: "18px", lg: "24px" },
                    lineHeight: { xs: "22px", md: "26px", lg: "34px" },
                  }}
                >
                  {formattedStartDate} - {formattedEndDate}
                </Typography>
              }

            </div>
            {(isJoin) && (
              <Button
                onClick={handleJoin}
                sx={{
                  borderRadius: "8px",
                  borderColor: "common.white",
                  backgroundColor: "transparent",
                  color: "common.white",
                  minWidth: "120px",
                  fontSize: { xs: "14px", md: "20px" },
                  borderWidth: "2px",
                  minHeight: { xs: "46px", md: "57px" },
                  fontWeight: "bold",
                  marginTop: "20px",
                  "&:hover": {
                    borderColor: "common.white",
                    backgroundColor: "common.white",
                    color: "common.black",
                  },
                }}
                variant="outlined"
                size="medium"
              >
                {t("uD_Join_button_text")}
              </Button>
            )
            }
            {(isRegister) &&
              (
                <div className="flex flex-col items-start">
                  <Typography
                    className="font-bold mb-4"
                    color="common.white"
                    sx={{
                      fontSize: { xs: "16px", md: "24px" },
                      lineHeight: { xs: "21px", md: "34px" },
                    }}
                  >
                    {isPaid ? `€ ${price} /-` : t("uD_free_text")}
                  </Typography>
                  <Button
                    onClick={handleRegister}
                    sx={{
                      borderRadius: "8px",
                      borderColor: "common.white",
                      backgroundColor: "transparent",
                      color: "common.white",
                      minWidth: "120px",
                      fontSize: { xs: "14px", md: "20px" },
                      borderWidth: "2px",
                      minHeight: { xs: "46px", md: "57px" },
                      fontWeight: "bold",
                      marginTop: "20px",
                      "&:hover": {
                        borderColor: "common.white",
                        backgroundColor: "common.white",
                        color: "common.black",
                      },
                    }}
                    variant="outlined"
                    size="medium"
                  >
                    {isPaid ? t("uD_Buy_button_text") : t("uD_register_text")}
                  </Button>
                </div>
              )
            }
          </div>
          {
            isTimer && (
              <div className="mt-20 sm:mt-0 sm:absolute bottom-[20px] right-[24px] cursor-pointer ml-auto z-10">
                <Typography
                  className="font-semibold text-[14px] leading-[28px] mb-4"
                  color="common.white"
                >
                  {t('uD_Expo_start_alert')}
                </Typography>
                <Box
                  sx={{
                    // margin: "auto",
                    overflowX: "auto",
                    width: "max-content",
                    maxWidth: "368px",
                    zIndex: "2",
                    padding: "12px 8px",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.20)",
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    color: "text.secondary",
                  }}
                >
                  <FuseCountdown size="sm" endDate={getTimer(startDate)} />
                </Box>
              </div>
            )}
        </Box >


        {(isWarning) &&
          <Box
            className="py-[20px] flex items-start"
            sx={{
              color: warningTextColor,
              fontSize: "14px",
              fontWeight: "600",
              lineHeight: "21px",
              display: "flex",
              alignItems: "self-end",
            }}
          >
            <FuseSvgIcon className="text-24 me-4" size={24} >
              material-outline:info
            </FuseSvgIcon>
            {t(warningText)}

          </Box>
        }

        <QRCodeModal
          expTitle={description}
          startDate={expoFormatDate(startDate, true, false, false, timeZone1, false)}
          endDate={expoFormatDate(endDate, true, false, false, timeZone1, false)}
          qrCode={qrCode}
          open={open}
          ModalClose={handleClose}
        />
      </div >
    </>
  );
}

export default SubBanner;
