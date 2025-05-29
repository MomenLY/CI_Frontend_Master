import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";

const Root = styled("div")(({ theme }) => ({
  // padding: theme.spacing(2),
  background: "linear-gradient(90deg, #4ED5EE, #6F43D6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "inline-block",
}));

type HomeBannerType ={
  title?: string;
  fancyTitle?: string;
}

function HomeBanner({title,fancyTitle}: HomeBannerType) {
  return (
    <>
      <div className="pt-24 md:pt-40 ">
        <Box
          className="flex flex-col justify-end"
          sx={{
            minHeight: { xs: "350px", md: "425px" },
            padding: { xs: "20px", md: "60px" },
            backgroundImage: `url('/assets/images/banner-bg.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-start max-w-[400px]">
            {title && <Typography
              className="font-normal line-clamp-2"
              color="common.white"
              style={{ textTransform: 'uppercase' }}
              sx={{
                fontSize: { xs: "22px", md: "30px" },
                lineHeight: { xs: "35px", md: "42px" },
              }}
            >
              {title}
            </Typography>}
            <Root>
              {fancyTitle &&<Typography
                variant="div"
                className="font-bold mt-0 mb-24 block"
                style={{ textTransform: 'uppercase' }}
                sx={{
                  fontSize: { xs: "38px", md: "48px" },
                  lineHeight: { xs: "50px", md: "60px" },
                }}
              >
                {fancyTitle}
              </Typography>}
            </Root>
            {/* <Button
              sx={{
                borderRadius: "8px",
                borderColor: "common.white",
                backgroundColor: "transparent",
                color: "common.white",
                minWidth: "145px",
                minHeight: "46px",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "common.white",
                  backgroundColor: "common.white",
                  color: "common.black",
                },
              }}
              variant="outlined"
              size="medium"
            >
              Talk to us
            </Button> */}
          </div>
        </Box>
      </div>

      {/* <div className="pt-24 md:pt-40 ">
        <Box
          component=""
          className="flex flex-col justify-end"
          sx={{
            minHeight: { xs: "350px", md: "425px" },
            padding: { xs: "20px", md: "60px" },
            backgroundImage: `url('/assets/images/banner-bg.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col items-start max-w-[400px]">
            <Typography
              className="font-normal line-clamp-2"
              color="background.paper"
              sx={{
                fontSize: { xs: "22px", md: "30px" },
                lineHeight: { xs: "35px", md: "42px" },
              }}
            >
              THE BEST INTERPRETING AGENCY FOR YOUR
            </Typography>
            <Root>
              <Typography
                variant="div"
                className="font-bold mt-0 mb-24 block"
                sx={{
                  fontSize: { xs: "38px", md: "48px" },
                  lineHeight: { xs: "50px", md: "60px" },
                }}
              >
                EVENT
              </Typography>
            </Root>
            <Button
              sx={{
                borderRadius: "8px",
                borderColor: "background.paper",
                backgroundColor: "transparent",
                color: "background.paper",
                minWidth: "140px",
                borderWidth: "2px",
              }}
              variant="outlined"
              size="medium"
            >
              Talk to us
            </Button>
          </div>
        </Box>
      </div> */}
    </>
  );
}

export default HomeBanner;
