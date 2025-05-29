import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { getOrders } from "../api/get-order-api";
import { defaultExpoImageUrl, defaultUserImageUrl, expoImageUrl } from "src/utils/urlHelper";
import { formatDate } from "src/utils/dateformatter";
import { tenantPrefix } from "src/utils/tenantHelper";
import { getCurrency } from "src/utils/currency";

type eventCardProps = {
  data: any,
  is_registered_event?: boolean
}

function EventCard({data, is_registered_event = false} : eventCardProps) {
  const { t } = useTranslation("user-dashboard");
  const [imgSrc, setImgSrc] = useState(data?.expImage);
  const [timeLeft, setTimeLeft] = useState("");
  const [isBadge, setIsBadge] = useState(false);
  const [badgeColor, setBadgeColor] = useState("secondary.main");
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('')

  const calculateDuration = (time) => {
    const now: any = new Date();
    const end: any = new Date(time);
    return end - now;
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = calculateDuration(data?.expRegistrationEndDate);
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        let badgeColor = "secondary.main";
        if (difference <= 0) {
          badgeColor = "4f46e5";
        } else if (difference < 24 * 60 * 60 * 1000) {
          badgeColor = "#FE8C3A";
        }

        setBadgeColor(badgeColor);

        if (days > 0) {
          setIsBadge(true);
          return t("uD_registrationEndsIn_text", {
            value: days,
            type: days > 1 ? t("uD_days_text") : t("uD_day_text"),
          });
        } else if (hours > 0) {
          setIsBadge(true);
          return t("uD_registrationEndsIn_text", {
            value: hours,
            type: hours > 1 ? t("uD_hours_text") : t("uD_hour_text"),
          });
        } else if (minutes > 0) {
          setIsBadge(true);
          return t("uD_registrationEndsIn_text", {
            value: minutes,
            type: minutes > 1 ? t("uD_minutes_text") : t("uD_minute_text"),
          });
        } else {
          setIsBadge(true);
          return t("uD_lessThanMinute");
        }
      }
      setIsBadge(false);
      // setBadgeColor("red");
      // return t("uD_registratinEnded_text");
    };


    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);
    return () => clearInterval(timer);
  }, [data?.expRegistrationEndDate, t]);

  useEffect(() => {
    fetchCurrency();
  }, []);


  const fetchCurrency = async () => {
    const currency = await getCurrency();
    setCurrency(currency)
  }

  // const formatDate = (timestamp: string): string => {
  //   const date = new Date(timestamp);
  //   const day = date.getUTCDate().toString().padStart(2, "0");
  //   const month = date.toLocaleString("en", { month: "short" });
  //   const year = date.getUTCFullYear();

  //   return `${day} ${month} ${year}`;
  // };


  const handleViewLink = (id: string) => {
    navigate(`/${tenantPrefix + data?.expTenantId}/events/` + id);
  };

  return (
    <>
      <div onClick={() => handleViewLink(data?.expCode)} style={{ cursor: 'pointer' }} >
        <Card
          className="relative"
          sx={{
            maxWidth: { xs: "400", md: "300" },
            borderRadius: "10px",
            boxShadow: "none",
          }}

        >
          <Button
            className="mb-0 rounded-[4px] font-medium capitalize min-h-[19px] px-[4px] py-0 leading-0 h-[inherit] min-w-0 text-[10px] absolute left-10 top-10 z-10"
            variant="contained"
            sx={{
              color: "#fff",
              backgroundColor: "#1F1F1F",
              "&:hover": {
                color: "#fff",
                backgroundColor: "#1F1F1F",
              },
            }}
          >
            {t(data?.expType)}
          </Button>
          <CardMedia
            sx={{ height: 175 }}
            image={(data?.expImage === "default.webp" ? defaultExpoImageUrl(data?.expImage) : expoImageUrl(data?.expImage, data?.expTenantId))}
            title={data?.expName}
            onError={() => setImgSrc(defaultUserImageUrl('default.webp'))}
          />
          <CardContent className="!p-[12px] relative">
            {isBadge &&
              <Badge
                className="absolute top-[-22px] left-0 right-0 m-auto text-[10px] font-semibold py-4 px-8 rounded-t-lg"
                sx={{
                  backgroundColor: badgeColor,
                  maxWidth: "fit-content",
                  color: "common.white",
                }}
              >
                {/* <MailIcon /> */}
                {timeLeft}
              </Badge>
            }

            <Typography
              component="div"
              color="text.primary"
              className="font-bold mb-6 text-[14px] md:text-[16px] line-clamp-2 min-h-[44px] cursor-pointer"
              onClick={() => handleViewLink(data?.id)}
            >
              {data?.expName}
            </Typography>
            <Typography
              color="text.primary"
              variant="body1"
              // color="text.secondary"
              component="div"
              className="font-medium mb-6 text-[12px] line-clamp-1"
            >
              {/* {t("uD_ExpoBy_text") + " " + getBrand()} */}
            </Typography>

            <div className="flex items-center mb-24">
              <Typography
                variant="caption"
                color="text.primary"
                component="span"
                className="font-normal mb-0 text-[12px]"
              >
                {t("uD_date_text")}
              </Typography>
              <span className="ms-4 me-6">:</span>
              <Typography
                color="text.primary"
                component="span"
                className=" font-semibold text-[12px] lg:text-[14px] line-clamp-1"
              >
                {formatDate(data?.expStartDate)} -{" "}
                {formatDate(data?.expEndDate)}
              </Typography>
            </div>
            {
              !is_registered_event && (
                <Box className="flex justify-between items-center ">
              <Typography
                color="text.primary"
                component="span"
                className=" font-bold text-[16px] lg:text-[22px] "
                noWrap
              >
                {data?.expIsPaid
                  ? `${currency} ${data?.expPrice}`
                  : t("uD_free_text")}
              </Typography>
            </Box>
              ) 
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default EventCard;
