import React, { useEffect, useState } from "react";
import HomeBanner from "./HomeBanner";
import { Box, Breadcrumbs, Container, Grid, TextField, Typography } from "@mui/material";
import HomeList from "./HomeList";
import Footer from "../common/Footer";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "src/utils/localCache";
import { useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import { Link } from "react-router-dom";
import SubBanner from "./SubBaner";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Header from "../common/Header";
import Testimonial from "./Testimonial";
import Agenda from "./Agenda";
import Speakers from "./Speakers";
// import { Button } from "@mui/base";
import { Button } from "@mui/material";
import axios from "app/store/axiosService";
import HorizontalLinearStepper1 from "./HorizontalLinearStepper1";

function PaymentCancel() {

    return (
        <>
            {/* <Header /> */}


            <Box
                component=""
                className="p-20 md:p-60 "
                sx={{
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: "1",
                }}
            >
                <Box
                    component=""
                    className="relative w-full max-w-[598px] mx-auto"
                    sx={{
                        backgroundColor: "background.paper",
                        minHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: "1",
                        borderRadius: "12px",
                        overflowY: "scroll",
                        overflowX: "hidden",
                        maxHeight: { xs: "calc(100vh - 60px)", md: "calc(100vh - 120px)" },
                    }}
                >
                    <Box className="p-20 md:p-60">
                        <Typography
                            color="text.primary"
                            component="h2"
                            className="text-3xl md:text-4xl font-semibold  leading-[32px] md:leading-[48px] text-center"
                        >
                            Reserve Your Slot
                        </Typography>

                        <div className="pt-24 md:pt-[50px]  pb-20">
                            <HorizontalLinearStepper1 step={2} />
                        </div>

                        <Box
                            className="sm:max-w-[400px] mx-auto mt-10 mb-60 space-y-20 pe-10 "
                            component="form"
                            sx={{
                                overflowY: "auto",
                                // maxHeght: { xs: "", md: "" },
                                // maxHeight: "calc(100vh - 420px)",

                                // minHeight: "calc(100vh - 220px)",
                                // maxHeight: "calc(100vh - 220px)",
                                "& .MuiTextField-root": { marginBottom: 0, width: "100%" },
                            }}
                        >


                            {/* start congratulation */}
                            <Box className="py-32 text-center" sx={{}}>
                                <img
                                    src="assets/images/done.png"
                                    alt="done"
                                    style={{
                                        maxWidth: "130px",
                                        width: "100%",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                    }}
                                />

                                <Typography
                                    color="text.primary"
                                    component="h2"
                                    className="text-[24px] md:text-[38px] font-[800]  leading-[40px] md:leading-[48px] italic mb-12"
                                >
                                    Payment Incomplete
                                </Typography>
                                <Typography
                                    color="text.disabled"
                                    component="p"
                                    className="text-[12px] font-[400]  leading-[20px]  "
                                >
                                    Your payment was incomplete. Please try again.
                                </Typography>
                            </Box>
                            {/* end congratulation */}
                        </Box>
                    </Box>

                    <Box
                        className=" z-99 fixed right-0 left-0  text-right shadow-[0_-1px_1px_0px_rgba(0,0,0,0.10)] "
                        sx={{
                            backgroundColor: "background.paper",
                            maxWidth: "598px",
                            margin: "auto",
                            bottom: "60px",
                            borderBottomRightRadius: "8px",
                            borderBottomLeftRadius: "8px",
                        }}
                    >
                        <div className="p-24">
                            <Button
                                className="min-w-[110px] min-h-[42px] rounded-lg"
                                variant="outlined"
                                color="primary"
                                sx={{
                                    // borderWidth: 2,
                                    borderColor: 'primary.main',
                                    border: "2px solid",
                                    "&:hover": {
                                        border: "2px solid",
                                        borderColor: 'primary.main',
                                        backgroundColor: "primary.main",
                                        color: "background.paper",
                                    },
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </Box>
                </Box>
            </Box>


            {/* <div>
        <Footer />
      </div> */}
        </>
    );
}

export default PaymentCancel;
