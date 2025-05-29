import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Box, Button, Card, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useState } from "react";
import { getCurrency } from "src/utils/currency";
import { useParams } from "react-router";
import { getAttendeeCountAPI } from "../expo-management/manage/attendees/apis/Get-AttendeeCount-Api";
import LocalCache from "src/utils/localCache";
import { seatLimit } from "src/utils/seatLimit";
import { getSingleExpo } from "../expo-management/apis/Get-Single-Expo-Api";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 0,
    // borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
}));

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  paymentStatus: string;
  paymentMode: string;
  price: number;
  transactionRemark: string;
};

interface AddAttendeeSuccessProps {
  userDetails: FormData | null;
  setAttendeeAddingSuccess: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setAutoUpload: (value: boolean) => void;
}

const AddAttendeeSuccess: React.FC<AddAttendeeSuccessProps> = ({
  userDetails,
  setAttendeeAddingSuccess,
  setIsLoading,
}) => {
  const location = useLocation();
  const { t } = useTranslation("attendees");
  const [currency, setCurrency] = useState('')
  const routeParams = useParams();
  const [expos, setExpos] = useState();
  const [isSeatFull, setIsSeatFull] = useState<boolean | true>(false);

  const handleClick = () => {
    setAttendeeAddingSuccess(false);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCurrency();
    getInitialDetails();
  }, []);

  const getInitialDetails = async () => {
    const expos = await getSingleExpo(routeParams.id);
    if (expos && expos.expo) {
      setExpos(expos.expo)
    }
    const isSeatsFull = await seatLimit(routeParams.id);
    setIsSeatFull(isSeatsFull);
  }

  const fetchCurrency = async () => {
    const currency = await getCurrency();
    setCurrency(currency)
  }

  return (
    <>
      <Box
        className="mb-[28px] mt-24"
        sx={{
          borderRadius: "6px",
          padding: "14px",
          // backgroundColor: (theme) => theme.palette.background.paper,
          backgroundColor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#21BD27",
          fontSize: "14px",
          fontWeight: "600",
          lineHeight: "21px",
        }}
      >
        <FuseSvgIcon className="text-24 me-4" size={24} color="">
          material-outline:info
        </FuseSvgIcon>
        {t("attendee_successfully_added")}
      </Box>

      {userDetails && (
        <div className="mb-[48px]">
          <Card
            className=""
            sx={{
              boxShadow: "0px 1px 5px 1px rgba(0,0,0,0.2)",
              margin: "0px",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <div className="mb-[32px]">
              <Typography
                variant="h4"
                className="text-[18px] font-semibold leading-[27px] mb-[20px]"
              >
                {t("addAttendee_basicDetailsHeading")}
              </Typography>
              <div className="space-y-20">
                <div className="mb-0 flex items-center">
                  <Typography
                    variant="caption"
                    color="common.black"
                    component="span"
                    className="text-[16px] font-normal leading-[26px] whitespace-nowrap"
                  >
                    {t("attendeeSuccess_name")}
                  </Typography>
                  <span className="ms-4 me-6">:</span>
                  <Typography
                    variant=""
                    color="common.black"
                    component="span"
                    className=" font-medium text-[16px] leading-[26px] ms-4 line-clamp-1"
                  >
                    {`${userDetails?.firstName} ${userDetails?.lastName}`}
                  </Typography>
                </div>
                <div className="mb-0 flex items-center">
                  <Typography
                    variant="caption"
                    color="common.black"
                    component="span"
                    className="text-[16px] font-normal leading-[26px] whitespace-nowrap"
                  >
                    {t("attendeeSuccess_email")}
                  </Typography>
                  <span className="ms-4 me-6">:</span>
                  <Typography
                    variant=""
                    color="common.black"
                    component="span"
                    className=" font-medium text-[16px] leading-[26px] ms-4 line-clamp-1"
                  >
                    {userDetails?.email}
                  </Typography>
                </div>
              </div>
            </div>

            {(expos && expos.expPrice !== 0) &&
              <div className="mb-[0px]">
                <Typography
                  variant="h4"
                  className="text-[18px] font-semibold leading-[27px] mb-[20px]"
                >
                  {t("addAttendee_paymentDetailsHeading")}
                </Typography>
                <div className="space-y-20">
                  <div className="mb-0 flex items-center">
                    <Typography
                      variant="caption"
                      color="common.black"
                      component="span"
                      className="text-[16px] font-normal leading-[26px] whitespace-nowrap"
                    >
                      {t("attendeeSuccess_paymentType")}
                    </Typography>
                    <span className="ms-4 me-6">:</span>
                    <Typography
                      variant=""
                      color="common.black"
                      component="span"
                      className=" font-medium text-[16px] leading-[26px] ms-4 line-clamp-1"
                    >
                      {userDetails?.paymentMode}
                    </Typography>
                  </div>
                  <div className="mb-0 flex items-center">
                    <Typography
                      variant="caption"
                      color="common.black"
                      component="span"
                      className="text-[16px] font-normal leading-[26px] whitespace-nowrap"
                    >
                      {t("attendee_addForm_price")}
                    </Typography>
                    <span className="ms-4 me-6">:</span>
                    <Typography
                      variant=""
                      color="common.black"
                      component="span"
                      className=" font-medium text-[16px] leading-[26px] ms-4 line-clamp-1"
                    >
                      {`${currency} ${userDetails?.price} /-`}
                    </Typography>
                  </div>
                  <div className="mb-0 flex items-center">
                    <Typography
                      variant="caption"
                      color="common.black"
                      component="span"
                      className="text-[16px] font-normal leading-[26px] whitespace-nowrap"
                    >
                      {t("attendee_addForm_transactionRemark")}
                    </Typography>
                    <span className="ms-4 me-6">:</span>
                    <Typography
                      variant=""
                      color="common.black"
                      component="span"
                      className=" font-medium text-[16px] leading-[26px] ms-4 line-clamp-1"
                    >
                      {userDetails?.transactionRemark ? userDetails?.transactionRemark : "-"}
                    </Typography>
                  </div>
                </div>
              </div>
            }
          </Card>
        </div>
      )}

      <div className="text-left">
        <Button
          className="mx-4 rounded-[10px] font-medium uppercase "
          variant="contained"
          color="primary"
          disabled={isSeatFull}
          onClick={handleClick}
          startIcon={<AddIcon />}
        >
          <span className=" ">{t("addAttendeeButtonText")}</span>
        </Button>
      </div>
    </>
  );
};

export default AddAttendeeSuccess;
