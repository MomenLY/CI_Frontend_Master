import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "react-i18next";
import { getCurrency } from "src/utils/currency";
import { expoFormatDate } from "src/utils/dateformatter";
import { getTimeZoneSettings } from "src/utils/getSettings";
import moment from "moment";

type SingleExpoContent = {
  expName: string;
  creator: string;
  startDate: string;
  endDate: string;
  image: any;
  description: string;
  expCode: string;
  expPrice: number;
  handleEdit?: () => void;
  fromAddAttendee: boolean;
  availableSeats: number;
  isSeatsUnlimited: boolean;
};

function ImageDetails({ isSeatsUnlimited, fromAddAttendee = false, availableSeats = 0, expName, creator, startDate, endDate, description, image, expCode, expPrice, handleEdit }: SingleExpoContent) {
  const { t } = useTranslation('agenda');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    const currency = await getCurrency();
    setCurrency(currency)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  const [formattedStartDate, setFormattedStartDate] = useState<string | Date | null>(null);
  const [formattedEndDate, setFormattedEndDate] = useState<string | Date | null>(null);

  useEffect(() => {
    const formatDates = async () => {
      const timeZone = await getTimeZoneSettings();
      // Check if timeZone is valid
      // if (!timeZone || !moment.tz.zone(timeZone)) {
      //   console.error("Invalid timezone:", timeZone);
      //   return;
      // }
      const start = expoFormatDate(startDate, true, false, false, timeZone, false);
      const end = expoFormatDate(endDate, true, true, true, timeZone, false);
      setFormattedStartDate(start);
      setFormattedEndDate(end);
    };
    formatDates();
  }, [startDate, endDate]);

  return (
    <>
      <Card
        className="flex flex-col sm:flex-row"
        sx={{
          boxShadow: "0px 1px 5px 1px rgba(0,0,0,0.2)",
          margin: "0px",
          padding: "20px",
        }}
      >
        <CardMedia
          component="img"
          className="mb-20 sm:mb-0 sm:mr-20"
          sx={{ maxWidth: 320, maxHeight: 200, width: "100%", borderRadius: "8px", flexShrink: 0 }}
          image={image}
          alt="Live from space album cover"
        />
        <CardContent className="relative !p-0 justify-center flex flex-col" sx={{ flexGrow: 1 }}>
          {handleEdit ? <IconButton aria-label="edit" className="absolute right-[-15px] top-[-15px]" onClick={handleEdit}>
            <FuseSvgIcon className="text-24 p-0" size={15} color="primary">
              feather:edit
            </FuseSvgIcon>
          </IconButton> : ''}
          {isSeatsUnlimited ? (
            <div className="absolute right-[-5px] top-[160px] p-2 rounded-lg">
              <p className="py-5 px-8 font-bold text-[#FFA500]">
                {t('agendaContent_seatsAvailable')}
              </p>
            </div>
          ) : (fromAddAttendee && availableSeats >= 0) && (
            <div className="absolute right-[-5px] top-[160px] p-2 rounded-lg">
              <p className={`py-5 px-8 font-bold ${availableSeats > 5 ? "text-[#FFA500]" : "text-red-500"}`}>
                {availableSeats === 0
                  ? t('agendaContent_noMoreSeatsAvailable')
                  : `${t('agendaContent_availableText')}: ${availableSeats}`}
              </p>
            </div>
          )}

          <Typography
            component="div"
            variant=""
            className="font-bold mb-6 text-[16px] line-clamp-2"
          >
            {expName}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            component="div"
            className="mb-10 line-clamp-1"
          >
            {t("agenda_expo_by_text")} {creator}
          </Typography>
          <div className="mb-10 flex items-center">
            <Typography
              variant="caption"
              color="text.secondary"
              component="span"
            >
              {t("agenda_expo_date_text")}
            </Typography>
            <span className="ms-4 me-6">:</span>
            <Typography
              variant=""
              color="text.secondary"
              component="span"
              className="font-semibold text-[12px] lg:text-[14px] line-clamp-1"
            >
              {formattedStartDate} - {formattedEndDate}
            </Typography>
          </div>

          <div className="mb-10 flex items-center">
            <Typography
              variant="caption"
              color="text.secondary"
              component="span"
            >
              {t("agenda_expo_code")}
            </Typography>
            <span className="ms-4 me-6">:</span>
            <Typography
              variant=""
              color="text.secondary"
              component="span"
              className="font-semibold text-[12px] lg:text-[14px] line-clamp-1"
            >
              {expCode}
            </Typography>
          </div>

          <div className="mb-10 flex items-center">
            <Typography
              variant="caption"
              color="text.secondary"
              component="span"
            >
              {t("agenda_expo_price")}
            </Typography>
            <span className="ms-4 me-6">:</span>
            <Typography
              variant=""
              color="text.secondary"
              component="span"
              className="font-semibold text-[12px] lg:text-[14px] line-clamp-1"
            >
              {Number(expPrice) === 0 ? t("agenda_expo_free_text") : `${currency} ${expPrice}`}
            </Typography>
          </div>
        </CardContent>
      </Card >
    </>
  );
}

export default ImageDetails;
