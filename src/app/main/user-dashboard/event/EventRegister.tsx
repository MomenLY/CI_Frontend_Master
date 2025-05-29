import React, { useEffect, useState } from "react";
import HomeBanner from "../home/HomeBanner";
import { Box, Breadcrumbs, Container, Grid, TextField, Typography } from "@mui/material";
import HomeList from "../home/HomeList";
import Footer from "../common/Footer";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "src/utils/localCache";
import { useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import { Link } from "react-router-dom";
import SubBanner from "../home/SubBaner";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Header from "../common/Header";
import Testimonial from "../home/Testimonial";
import Agenda from "./Agenda";
import Speakers from "./Speakers";
// import { Button } from "@mui/base";
import { Button } from "@mui/material";
import HorizontalLinearStepper from "./HorizontalLinearStepper";

type Expo = {
    expName: string,
    expDescription: string,
    expStartDate: Date,
    expEndDate: Date,
    expIsPaid: boolean,
    expPrice: number,
    expVenue: string,
    firstName: string,
    lastName: string,
    userImage: string,
}

type Speakers = {
    speakers: [],
}

function EventRegister() {
    const [expo, setExpo] = useState<Expo | null>(null);
    const [speaker, setSpeaker] = useState<Speakers | null>(null);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const routeParams = useParams();
    useEffect(() => {
        getInitialDetails(routeParams.id);
    }, [])

    useEffect(() => {
        (speaker !== null && speaker?.length !== 0) ? setIsSpeaker(true) : setIsSpeaker(false);
    }, [speaker])

    const getInitialDetails = async (id) => {
        const expoDetails = await getEvent(id);
        setExpo(expoDetails.expo);
        setSpeaker(expoDetails.speakers);
    }


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
                            <HorizontalLinearStepper />
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
                            {/* start inner content */}
                            <div className="py-16 text-center">
                                <Typography
                                    color="text.primary"
                                    component="h2"
                                    className="text-[16px] md:text-[18px] font-semibold  leading-[24px] md:leading-[26px] "
                                >
                                    Select your role
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.disabled"
                                    className="font-normal  block"
                                >
                                    Fill the form to reset your password
                                </Typography>
                            </div>

                            <TextField
                                id="outlined-multiline-static"
                                label="Address"
                                // multiline
                                // rows={5}
                                defaultValue=""
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: "2px",
                                    },
                                }}
                            />

                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            id="outlined-select-currency"
                                            select
                                            label="Expire Date"
                                            defaultValue=""
                                            helperText=""
                                        ></TextField>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            id="outlined-multiline-static"
                                            label="CVV"
                                            // multiline
                                            // rows={5}
                                            defaultValue=""
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderWidth: "2px",
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <TextField
                                id="outlined-multiline-static"
                                label="Address"
                                defaultValue=""
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: "2px",
                                    },
                                }}
                            />

                            <TextField
                                id="outlined-multiline-static"
                                label="Address"
                                // multiline
                                // rows={5}
                                defaultValue=""
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: "2px",
                                    },
                                }}
                            />

                            <TextField
                                id="outlined-multiline-static"
                                label="Address"
                                // multiline
                                // rows={5}
                                defaultValue=""
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: "2px",
                                    },
                                }}
                            />

                            {/* end inner content */}

                            {/* start congratulation */}
                            {/* <Box className="py-32 text-center" sx={{}}>
                <img
                  src="assets/images/done.png"
                  alt="done"
                  style={{
                    maxWidth: "130px",
                    width: "100%",
                  }}
                />

                <Typography
                  color="text.primary"
                  component="h2"
                  className="text-[24px] md:text-[38px] font-[800]  leading-[40px] md:leading-[48px] italic mb-12"
                >
                  Congratulation!
                </Typography>
                <Typography
                  color="text.disabled"
                  component="p"
                  className="text-[12px] font-[400]  leading-[20px]  "
                >
                  Your registration was sucessful! You will receive an email
                  shortly
                </Typography>
              </Box> */}
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

export default EventRegister;
