import React from "react";
import Box from "@mui/material/Box";
import { Button, Container } from "@mui/material";
import Typography from "@mui/material/Typography";
import Header from "../common/Header";
import ExpoSearchBox from "./ExpoSearchBox";
import { useTranslation } from "react-i18next";

// import QrcodePopup from "./QrcodePopup";

const eventHead = "New Events";
function ExpoCode() {
  const { t } = useTranslation('general');

  return (
    <>

      <Header />

      {/* <div className='unpublish mt-0'>
        <h5 className='ms-16' style={{ width: '100%' }}>Please collect your expo code from your email and search here</h5>
      </div> */}

      <Box

        sx={{
          position: "relative", // To position the ::before element relative to this Box
          padding: { xs: "150px 18px 20px 18px", md: "200px 18px 40px 18px" },
          backgroundColor: "#F1F5F9",

          height: "100%",
          display: "flex",
          justifyContent: "center",
          // alignItems: "center",
          "&::before": {
            content: '""', // Required for pseudo-elements
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%", // Set width of the box
            height: "100%", // Set height of the box
            maxHeight: "50%",
            // backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
            zIndex: 1, // Ensures it appears above the background but below content
            backgroundImage: "url('assets/images/expo-bg.svg')",
            backgroundPosition: "bottom",
            // backgroundSize: "contain",
            backgroundSize: { xs: "cover", sm: "contain" },
            backgroundRepeat: "no-repeat",
          },
        }}
      >
        <div className="flex flex-col max-w-[605px] w-full items-center">

          <Typography
            color="text.primary"
            className="font-semibold  text-[24px] sm:text-[32px] block leading-7 lg:leading-8 mb-[28px] sm:mb-[45px]"
          >
            {t('gen_enter_your_expo_code_text')}
          </Typography>

          <ExpoSearchBox />
        </div>
      </Box>
    </>
  );
}

export default ExpoCode;
