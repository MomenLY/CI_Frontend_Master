import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import Testimonial from "../home/Testimonial";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { TextFormatSharp } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function Terms({ terms }) {
    const {t} = useTranslation('user-dashboard')

    return (

        <>
            <Box component="div" sx={{ padding: { xs: "10px 0 ", md: "20px 0" } }}>
                <Typography
                    color="text.primary"
                    variant=""
                    className="font-semibold text-[18px] lg:text-[20px] block mb-28 line-clamp-1"
                >
                   {t("uD_termAndConditions")}
                </Typography>

                <div className="pb-10 flex ">
                    <Typography
                        color="text.primary"
                        variant=""
                        className="font-medium  text-[16px] lg:text-[18px] block leading-7 lg:leading-8"
                    >
                    </Typography>
                    <div className="font-medium  text-[16px] lg:text-[18px] block leading-7 lg:leading-8" dangerouslySetInnerHTML={{ __html: terms }}></div>
                </div>
            </Box>
        </>
    );

}

export default Terms;
