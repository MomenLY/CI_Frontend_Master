import { Button, Card, CardContent, CardMedia, Typography } from "@mui/material";
import DropdownMenu from "./DropdownMenu";
import { useTranslation } from "react-i18next";
import { expoFormatDate } from "src/utils/dateformatter";
import { useEffect, useState } from "react";
import { getTimeZoneSettings } from "src/utils/getSettings";
import moment from "moment";

type ImageListType = {
  onClick: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  handleStatusChange?: () => void;
  isItemActive?: boolean;
  name: string;
  image: any;
  description: string;
  startDate: any;
  endDate: any;
  createdBy: string;
  expoType: string;
};


function ImageList({ expoType, createdBy, onClick, name, image, startDate, endDate, description, handleEdit, handleDelete, handleStatusChange, isItemActive }: ImageListType) {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };
  const { t } = useTranslation('expoManagement');

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
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
      const end = expoFormatDate(endDate, true, false, false, timeZone, false);
      setFormattedStartDate(start);
      setFormattedEndDate(end);
    };
    formatDates();
  }, [startDate, endDate]);

  return (
    <>
      <Card
        className="flex flex-col sm:flex-row relative"
        sx={{
          boxShadow: "0px 1px 5px 1px rgba(0,0,0,0.1)",
          margin: "0",
          padding: "10px",
          '&:hover': {
            boxShadow: "0px 1px 5px 2px rgba(0,0,0,0.2)",
            cursor: 'pointer',
          }
        }}
      >
        <div className="absolute right-20 top-20 sm:right-28 sm:top-28 z-10">
          <DropdownMenu
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleStatusChange={handleStatusChange}
            isItemActive={isItemActive}
          />
        </div>
        <CardContent onClick={onClick}
          className="relative  !p-[10px] justify-center flex flex-col sm:mr-20"
          sx={{ flexGrow: 1 }}
        >
          <div className="flex item-center space-x-10">
            <Button
              className="mb-10 rounded-[4px] font-medium capitalize min-w-[45px] w-[fit-content] py-0 px-5 min-w-0 text-[10px] leading-[19px]"
              variant="contained"
              color="custom"
              size=""
            >
              {expoType}
            </Button>
            <Button
              className="mb-10 rounded-[4px] font-medium capitalize min-w-[45px] w-[fit-content] py-0 px-5  min-w-0 text-[10px] leading-[19px]"
              variant="contained"
              color={isItemActive === true ? 'primary' : 'warning'}
              size=""
            >
              {isItemActive === true ? t('expo_publishExpo_text') : t('expo_draftExpo_text')}
            </Button>
          </div>
          <Typography
            component="div"
            color="text.primary"
            className="font-bold mb-6 text-[16px] line-clamp-2 min-h-[44px]"
          >
            {name}
          </Typography>
          <Typography
            variant="body1"
            color="text.disabled"
            component="div"
            className="mb-10 line-clamp-1"
          >
            {t('expo_by')} {createdBy}
          </Typography>
          <Typography
            color="text.disabled"
            component="div"
            className="mb-10 line-clamp-2 leading-4 text-[10px] min-h-[32px]"
          >
            {description && description?.length > 25 ? `${description.slice(0, 25)}...` : description}
          </Typography>
          <div className="mb-0 flex items-center">
            <Typography
              variant="caption"
              color="text.disabled"
              component="span"
              className=""
            >
              {t('expo_date')}
            </Typography>
            <span className="ms-4 me-6">:</span>
            <Typography
              color="text.disabled"
              component="span"
              className=" font-semibold text-[12px] lg:text-[14px] line-clamp-1"
            >
              {formattedStartDate} - {formattedEndDate}
            </Typography>
          </div>
        </CardContent>

        <CardMedia
          component="img"
          className="sm:mb-0  mr-0  sm:block"
          sx={{
            maxWidth: { xs: "100%", sm: 166 },
            maxHeight: 200,
            width: "100%",
            borderRadius: "8px",
            flexShrink: 0,
          }}
          onClick={onClick}
          image={image}
          alt="event"
        />
      </Card>
    </>
  );
}

export default ImageList;
