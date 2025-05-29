import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { expoBillboardResoucesUrl } from "src/utils/urlHelper";

// CSS-in-JS styled component
const AspectRatioContainer = styled("div")(({ theme, aspectRatio }) => ({
  // height: { xs: 'auto', md: '100%', },
  // padding: { xs: '30px 0',  md: '0', },
  position: "relative",
  display: "block",
  width: "100%",
  height: "100%",
  padding: "0",
  overflow: "hidden",
  borderRadius: "8px",

  // Handle responsive styles using the theme's breakpoints
  [theme.breakpoints.down("lg")]: {
    height: "auto",
    padding: "0",
  },

  "&::before": {
    display: "block",
    content: '""',
    paddingTop: aspectRatio === "16by9" ? "56.25%" : "42.8571%", // Support multiple ratios
  },
  "& img, svg, video": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    border: 0,
  },
}));

function ImageModal({ expTenantId, imageUrl, open, handleClose }) {
  const isVideo = imageUrl?.endsWith(".mp4") || imageUrl?.endsWith(".webm");
  return (
    <Dialog
      open={open}
      fullScreen
      onClose={handleClose}
      disableBackdropClick
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          width: "calc(100vw - 100px)",
          maxWidth: "1100px",
          //   height: "calc(100vh - 100px)",
          maxHeight: "620px",
          borderRadius: "8px",
          overflow: "hidden",
          padding: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      {/* <DialogTitle sx={{ padding: "16px !important" }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}

          sx={(theme) => ({
            position: "absolute",
            right: 0,
            top: 0,
             // color: (theme) => theme.palette.grey[500],
            color: theme.palette.common.white, // Accessing the theme correctly
          })} 
        >
          <FuseSvgIcon className="text-48" size={24} color="common.white">
            feather:x
          </FuseSvgIcon>
        </IconButton>
      </DialogTitle> */}

<DialogContent className="!ps-0 !py-[0px] !pt-[40px] md:!pt-[60px] !pe-[40px] md:!pe-[20px] bg-transparent rounded-8 overflow-hidden">
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: "0",
            top: "20px",
            color: theme.palette.common.white,
          })}
        >
          <FuseSvgIcon className="text-48" size={24} color="common.white">
            feather:x
          </FuseSvgIcon>
        </IconButton>
        <AspectRatioContainer aspectRatio="16by9">

          {isVideo ? (
            <video
              className="w-full h-full object-cover bg-[#000] opacity-100"
              controls src={expoBillboardResoucesUrl(imageUrl, expTenantId)}
              autoPlay
              muted
              loop
            ></video>

          ) : (
            <img
              srcSet={expoBillboardResoucesUrl(imageUrl, expTenantId)}
              alt="Modal Content"
            />
          )}
        </AspectRatioContainer>
      </DialogContent>
    </Dialog>
  );
}

export default ImageModal;
