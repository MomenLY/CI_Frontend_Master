import FuseCountdown from "@fuse/core/FuseCountdown";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Box, Typography } from "@mui/material";
import { checkDate } from "src/utils/dateformatter";
import ScheduleDetails from "./ScheduleDetails";
import { useEffect, useState } from "react";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";

const SchedulePopup = ({
  schCounterEnd,
  schCounter,
  schName,
  schDateTime,
  expo,
  t,
  schedule,
}) => {
  const [isTimeReached, setIsTimeReached] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const dispatch = useAppDispatch()

  useEffect(() => {
    const scheduledTime = new Date(schedule?.eventStartDateTime);
    const currentTime = new Date();

    if (currentTime >= scheduledTime) {
      setIsTimeReached(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsTimeReached(true);
    }, scheduledTime - currentTime);

    // Clean up timeout when the component unmounts or when the scheduled time is reached
    return () => {
      clearTimeout(timeoutId);
    };
  }, [schedule]);

  useEffect(() => {
    if (isTimeReached) {
      const HALF_HOUR_MS = 30 * 60 * 1000;
      const scheduledEndTime = new Date(schedule?.eventEndDateTime);
      const currentTime = new Date();
      const timeDifferenceEnd = Math.abs(scheduledEndTime - currentTime);

      if ( timeDifferenceEnd < HALF_HOUR_MS) {
        setIsEnded(true);
      }
    }
  }, [isTimeReached]);
  const renderStatusMessage = () => {
    if (checkDate(schCounterEnd, "lessThan", false)) {
      return t("uD_Expo_modal_expo_ended");
    }
    if (
      checkDate(schCounter, "greaterThanOrEqual", false) &&
      checkDate(schCounter, "greaterThan", false)
    ) {
      return t("uD_Expo_modal_expo_starts_in");
    }
    return t("uD_Expo_modal_expo_started");
  };

  return isTimeReached ? (
    <ScheduleDetails expo={expo} schedule={schedule} isEnded={isEnded} />
  ) : (
    <Box component="div" sx={{ padding: { xs: "20px 30px", md: "28px 38px" } }}>
      {/* Status Message and Countdown */}
      <div className="mb-[40px]">
        <Typography
          color="common.black"
          className="font-semibold text-[16px] lg:text-[18px] block mb-[16px] text-center"
        >
          {renderStatusMessage()}
        </Typography>
        {checkDate(schCounter, "greaterThanOrEqual", false) && (
          <Box
            sx={{
              margin: "auto",
              overflowX: "auto",
              width: "max-content",
              maxWidth: "368px",
              zIndex: "2",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "500",
              boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.20)",
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.secondary",
            }}
          >
            <FuseCountdown endDate={schCounter} />
          </Box>
        )}
      </div>

      {/* Expo Details */}
      <div className="mb-[40px]">
        {schName && (
          <Typography
            color="common.black"
            className="font-semibold text-[18px] lg:text-[20px] block mb-[16px] text-center"
          >
            {schName}
          </Typography>
        )}
        {schDateTime && (
          <Typography
            color="text.primary"
            className="font-normal text-[18px] lg:text-[20px] block mb-0 text-center"
          >
            {schDateTime}
          </Typography>
        )}
      </div>

      {/* Expo Venue */}
      {expo.expVenue && (
        <div className="pb-10 flex items-center flex-col">
          <FuseSvgIcon className="text-48 mb-10" size={20} color="primary.main">
            feather:map-pin
          </FuseSvgIcon>
          <div className="text-center">
            <Typography
              color="text.primary"
              className="font-semibold text-[16px] lg:text-[18px] block mb-8"
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
    </Box>
  );
};

export default SchedulePopup;
