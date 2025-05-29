
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import moment from "moment";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Divider from "@mui/material/Divider";
import { useTranslation } from "react-i18next";

function FuseCountdown(props) {
  const { onComplete, endDate = moment().add(15, "days"), className, size = "md" } = props;
  const { t } = useTranslation('user-dashboard');

  const sizeClasses = {
    lg: {
      numberText: "text-[24px] lg:text-[28px] leading-[24px] lg:leading-[28px]",
      labelText: "text-[14px] leading-[14px] capitalize",
      padding: "px-12 md:px-24",
    },
    md: {
      numberText: "text-[20px] lg:text-[24px] leading-[20px] lg:leading-[24px]",
      labelText: "text-[12px] leading-[12px] capitalize",
      padding: "px-10 md:px-20",
    },
    sm: {
      numberText: "text-[16px] lg:text-[18px] leading-[16px] lg:leading-[18px]",
      labelText: "text-[9px] leading-[9px] ",
      padding: "px-8 md:px-16",
    },
  };

  const [endDateVal] = useState(
    moment.isMoment(endDate) ? endDate : moment(endDate)
  );
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef(null);

  const complete = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const tick = useCallback(() => {
    const currDate = moment();
    const diff = endDateVal.diff(currDate, "seconds");

    if (diff < 0) {
      complete();
      return;
    }

    const timeLeft = moment.duration(diff, "seconds");
    setCountdown({
      days: String(Number(timeLeft.asDays().toFixed(0))).padStart(2, "0"),
      hours: String(timeLeft.hours()).padStart(2, "0"),
      minutes: String(timeLeft.minutes()).padStart(2, "0"),
      seconds: String(timeLeft.seconds()).padStart(2, "0"),
    });
  }, [complete, endDateVal]);


  useEffect(() => {
    intervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tick]);

  return (
    <div className={clsx("flex items-center", className)}>
      <div className={`flex flex-col items-center justify-center ${sizeClasses[size].padding}`}>
        <Typography
          color="common.black"
          variant="h4"
          className={clsx("font-semibold block mb-4", sizeClasses[size].numberText)}
        >
          {countdown.days}
        </Typography>
        <Typography
          color="text.disabled"
          variant="caption"
          className={clsx("font-[500] block mb-0", sizeClasses[size].labelText)}
        >
          {t('timer_days')}
        </Typography>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className={`flex flex-col items-center justify-center ${sizeClasses[size].padding}`}>
        <Typography
          color="common.black"
          variant="h4"
          className={clsx("font-semibold block mb-4", sizeClasses[size].numberText)}
        >
          {countdown.hours}
        </Typography>
        <Typography
          color="text.disabled"
          variant="caption"
          className={clsx("font-[500] block mb-0", sizeClasses[size].labelText)}
        >
          {t('timer_hours')}
        </Typography>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className={`flex flex-col items-center justify-center ${sizeClasses[size].padding}`}>
        <Typography
          color="common.black"
          variant="h4"
          className={clsx("font-semibold block mb-4", sizeClasses[size].numberText)}
        >
          {countdown.minutes}
        </Typography>
        <Typography
          color="text.disabled"
          variant="caption"
          className={clsx("font-[500] block mb-0", sizeClasses[size].labelText)}
        >
          {t('timer_minutes')}
        </Typography>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className={`flex flex-col items-center justify-center ${sizeClasses[size].padding}`}>
        <Typography
          color="common.black"
          variant="h4"
          className={clsx("font-semibold block mb-4", sizeClasses[size].numberText)}
        >
          {countdown.seconds}
        </Typography>
        <Typography
          color="text.disabled"
          variant="caption"
          className={clsx("font-[500] block mb-0", sizeClasses[size].labelText)}
        >
          {t('timer_seconds')}
        </Typography>
      </div>
    </div>
  );
}

export default memo(FuseCountdown);
