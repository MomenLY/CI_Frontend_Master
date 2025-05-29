import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

const QRCodeModal = ({expTitle,startDate, endDate, qrCode, open, ModalClose }) => {

  const { t } = useTranslation('user-dashboard');
    
  return (
    <Dialog
      open={open}
      onClose={ModalClose}
      PaperProps={{
        sx: {
          width: "426px",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "15px 30px !important",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <div className="mb-0 pe-20">
          <Typography
            color="text.primary"
            className="font-semibold text-[18px] block mb-8 truncate"
          >
            {/* Polls */}
          </Typography>
        </div>

        <IconButton
          aria-label="close"
          onClick={ModalClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FuseSvgIcon className="text-48" size={24} color="action">
            feather:x
          </FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "32px 30px !important",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <div className="mb-[16px] text-center">
          <Typography
            color="text.primary"
            variant="h3"
            className="text-[14px] leading-[24px] font-600 block mb-[0] "
          >
           {t("uD_QRCode_title_text")}
          </Typography>
          <Typography
            color="text.primary"
            className="text-[11px] leading-[16px] font-400 block mb-[0] "
          >
            {t("uD_QRCode_subtitle_text")}
          </Typography>
        </div>
        <div className="w-[220px] h-[220px] text-center mx-auto mb-[16px]">
          <img src={qrCode} alt="" />
        </div>
        <div className="mb-[0px] text-center">
          <div className="mb-[12px]">
            <Typography
              color="text.primary"
              variant="h3"
              className="text-[12px] leading-[24px] font-600 block mb-[0] "
            >
             {t("uD_QRCode_eventName_text")}
            </Typography>
            <Typography
              color="text.primary"
              className="text-[12px] leading-[20px] font-400 block mb-[0] "
            >
             {expTitle}
            </Typography>
          </div>
          <div className="mb-[12px]">
            <Typography
              color="text.primary"
              variant="h3"
              className="text-[12px] leading-[24px] font-600 block mb-[0] "
            >
               {t("uD_QRCode_eventDate_text")}
            </Typography>
            <Typography
              color="text.primary"
              className="text-[12px] leading-[20px] font-400 block mb-[0] "
            >
             {startDate} - {endDate}
            </Typography>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
