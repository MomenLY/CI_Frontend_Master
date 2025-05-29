import React, { useEffect, useState } from "react";
import HomeBanner from "../home/HomeBanner";
import { Box, Breadcrumbs, Container, Grid, Typography, CircularProgress } from "@mui/material";
import HomeList from "../home/HomeList";
import Footer from "../common/Footer";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "src/utils/localCache";
import { useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import { Link } from "react-router-dom";
import SubBanner from "../home/SubBaner";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Testimonial from "../home/Testimonial";
import Agenda from "./Agenda";
import Speakers from "./Speakers";
import Address from "./Address";
import Terms from "./Terms";
import {
  bannerImageUrl,
  defaultBannerImageUrl,
  logoImageUrl,
} from "src/utils/urlHelper";
import { getAttendeeDetailsAPI } from "../../expo-management/manage/attendees/apis/Get-Attendees-Api";
import { QrCodeAPI } from "../api/qr-code-api";
import { useTranslation } from "react-i18next";
import { SettingsApi } from "../../settings/SettingsApi";
import { getSettings } from "src/utils/settingsLibrary";
import { getTenantId, getTenantSlug } from "src/utils/tenantHelper";
import Error404Page from "../../404/Error404Page";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { checkUsers } from "../api/users-details-api";
import FuseLoading from "@fuse/core/FuseLoading";
import { Helmet } from "react-helmet-async";

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

function EventDetails() {
  const [expo, setExpo] = useState<Expo | null>(null);
  const [speaker, setSpeaker] = useState<any[]>(null);
  const [schedules, setSchedules] = useState<any[]>(null);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isSchedules, setIsSchedules] = useState(false);
  const [orderQrCode, setOrderQrCode] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [tenantName, setTenantName] = useState("");
  const routeParams = useParams();
  const { t } = useTranslation("user-dashboard");
  const tenant_id = getTenantId(routeParams);
  const routerparams = useParams();
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  useEffect(() => {
    setIsLoading(true)
    const init = async () => {
      const basicData = await getSettings("basic", tenant_id);
      if (basicData) {
        const imgSrc = logoImageUrl(basicData?.settings?.logo, tenant_id);
        setLogoUrl(imgSrc);
      }
    };
    init();
    getInitialDetails(routeParams.id);
  }, []);

  const getInitialDetails = async (id) => {
    const expoDetails = await getEvent(id);
    setExpo(expoDetails.expo);
    setSpeaker(expoDetails.speakers);
    setSchedules(expoDetails.schedules);
    setTenantName(expoDetails.expo.expTenantId);
  };

  useEffect(() => {
    if (expo?.id) {
      orderDetails();
    }
  }, [expo?.id]);

  const orderDetails = async () => {
    const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
    if (userData?.uuid !== null && userData?.uuid !== undefined) {
      try {
        const response = await checkUsers(userData?.uuid, expo?.id);
        if (response && response.data) {
          checkCurrentUserParticipation(response.data);
        }
      } catch (err) {
        console.error("Error fetching attendee details:", err);
      }
    } else {
      setIsLoading(false);
    }
  };

  const checkCurrentUserParticipation = async (participants: any[]) => {
    const userData = await LocalCache.getItem("userData");
    // Set loading true before checking participation
    if (userData && userData.uuid) {
      const isUserParticipant = participants.some((participant) => {
        return participant.epUserId === userData.uuid;
      });
      if (isUserParticipant) {
        const _data = {
          epUserId: userData?.uuid,
          epExpoId: expo?.id,
          attType: expo?.expType,
          type: 'attendance'
        };
        try {
          const qrCode = await QrCodeAPI({ data: _data });
          setOrderQrCode(qrCode);
        } catch (err: any) {
          console.log(err.response.data, "error");
        } finally {
          setIsLoading(false); // Ensure loading is false after operation
        }
      } else {
        setIsLoading(false); // Ensure loading is false if user is not a participant
      }
    }
  };

  useEffect(() => {
    setIsSpeaker(speaker !== null && speaker?.length !== 0);
  }, [speaker]);

  useEffect(() => {
    setIsSchedules(schedules !== null && schedules?.length !== 0);
  }, [schedules]);

  return (
    <>
      {expo == null || expo?.id ? (
        <>

          <Helmet>
            <title>{expo?.expName}</title>
            {/* <meta property="og:title" content={expo?.expName} />
            <meta property="og:description" content={expo?.expDescription} />
            <meta property="og:image" content={logoUrl} />
            <meta property="og:url" content={`${import.meta.env.VITE_TENANT_URL}${getTenantSlug(routerparams)}/events/` + expo?.expCode} />
            <meta property="og:type" content="website" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" /> */}
          </Helmet>


          <Box
            sx={{
              padding: {
                xs: "90px 0 0 0",
                md: "90px 0 40px 0",
              },
            }}
          >
            <Container className="max-w-[1160px] w-full px-20 lg:px-0 m-auto">



              <>
                <Breadcrumbs
                  className="md:pt-[20px]"
                  separator={
                    <FuseSvgIcon size={20}>
                      heroicons-solid:chevron-right
                    </FuseSvgIcon>
                  }
                  aria-label="breadcrumb"
                >
                  <Link
                    className="font-medium hover:underline !text-[#FE6092]"
                    key="1"
                    to={(tenant_id !== undefined && tenant_id != null ? ("/?t=" + tenant_id) : "/")}
                  >
                    {t("uD_menu_home_text")}
                  </Link>
                  <Typography
                    className="font-medium  max-w-[130px]"
                    noWrap
                    key=""
                    color="text.primary"
                  >
                    {expo?.expName}
                  </Typography>
                </Breadcrumbs>

                <SubBanner
                  qrCode={orderQrCode}
                  banner={
                    expo?.expBanerImage === "default.webp"
                      ? defaultBannerImageUrl("default.webp")
                      : bannerImageUrl(expo?.expBanerImage, tenantName)
                  }
                  description={expo?.expName}
                  startDate={expo?.expStartDate}
                  endDate={isLoading == false ? expo?.expEndDate : null}
                  isPaid={expo?.expIsPaid}
                  price={expo?.expPrice}
                  isRegistration={expo?.expIsRegistrationEnabled}
                  expCode={expo?.expCode}
                  expRegistrationStartDate={expo?.expRegistrationStartDate}
                  expRegistrationEndDate={expo?.expRegistrationEndDate}
                  expIsSeatsUnlimited={expo?.expIsSeatsUnlimited}
                  expMaxSeats={expo?.expMaxSeats}
                  expoId={expo?.id}
                  expoTenantId={expo?.expTenantId}
                  expoSpeakers={speaker}
                  expName={expo?.expName}
                  expRegistrationEndType={expo?.expRegistrationEndType}
                  expDescription={expo?.expDescription}
                />

                <Box component="div" sx={{ padding: { xs: "40px 0 ", md: "" } }}>
                  <Typography
                    color="text"
                    className="font-bold text-[20px] block mb-28"
                  >
                    {t("uD_About_text")}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="font-normal text-[16px] block"
                  >
                    {expo?.expDescription}
                  </Typography>
                </Box>
                {expo?.expVenue && expo?.expAddress && (
                  <Address venue={expo?.expVenue} address={expo?.expAddress} />
                )}

                {isSpeaker && (
                  <Speakers speakers={speaker} tenantName={tenantName} />
                )}

                {isSchedules && (
                  <Agenda
                    schedules={schedules}
                    qrCode={orderQrCode}
                    expCode={expo?.expCode}
                  />
                )}

                {expo?.expTermsConditionIsEnabled &&
                  expo?.expTermsAndConditions && (
                    <Terms terms={expo?.expTermsAndConditions} />
                  )}
              </>

            </Container>
          </Box>
        </>
      ) : (
        <Error404Page />
      )}
    </>
  );
}

export default EventDetails;