import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { expoLayoutUrl } from "src/utils/urlHelper";
import { getExpoJson } from "../booth/apis.ts/get-expo-json";
import { useQuery } from "@tanstack/react-query";
import LayoutMapping from "app/shared-components/components/expoPreview/booth/LayoutMapping";

// CSS-in-JS styled component
const AspectRatioContainer = styled("div")(({ theme, aspectRatio }) => ({
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

function ImageModal({ expo, open, handleClose, showEachBooth, setShowEachBooth }) {
  
  // Second query to fetch additional expo data
  const {
    data: expoJson,
    error: additionalError,
    isLoading: isLoadingExpoJson,
    isError: isAdditionalError,
  } = useQuery({
    queryKey: ["expoData", expo?.expCode], // Unique key for the second query
    queryFn: () => getExpoJson(expo?.expCode), // Fetch function for additional data
    enabled: !!expo?.expCode, // Prevents the query from running if id is falsy
    staleTime: 0,
    retry: 2, // Retry the request up to 2 times if it fails
    refetchOnWindowFocus: false, // Avoid refetching when the window is focused
  });

  return (
    <Dialog
      open={open}
      fullScreen
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose;
        }
      }}
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
        <div className="relative">
          <AspectRatioContainer aspectRatio="16by9">
            {showEachBooth && (
              <Button
                onClick={() => setShowEachBooth(false)}
                className="mx-4 rounded-[10px] font-medium uppercase absolute top-[20px] left-[20px] z-10"
                variant="contained"
                color="primary"
                to=""
              >
                <span className="">Back</span>
              </Button>
            )}

            <img
              className=""
              src={expoLayoutUrl(`${expo?.expLayoutId}.webp`)}
              alt="Modal Content"
            />

            {expoJson && (
              <LayoutMapping
                showEachBooth={showEachBooth}
                setShowEachBooth={setShowEachBooth}
                expo={expo}
                expoJson={expoJson}
              />
            )}
          </AspectRatioContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageModal;
