import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography } from '@mui/material';
import { fill } from 'lodash';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { expoFormatDate } from 'src/utils/dateformatter';
import { getTimeZoneSettings } from 'src/utils/getSettings';

interface Props {
    open: boolean;
    onClose: () => void;
    anchorEl: any;
    data: any;
    startDate: string;
    endDate: string
}

function ExpoInfo({ open, onClose, anchorEl, data, startDate, endDate }: Props) {
    const { t } = useTranslation('ExpoInfo');
    const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
    const [formattedStartDate, setFormattedStartDate] = useState<string | Date | null>(null);
    const [formattedEndDate, setFormattedEndDate] = useState<string | Date | null>(null);

    const updateDialogPosition = () => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            // const top = rect.top + window.scrollY + rect.height + 16;
            const left = rect.left + window.scrollX + rect.width - 380;
            setDialogPosition({ top });
        }
    };


    useEffect(() => {
        const formatDates = async () => {
            const timeZone = await getTimeZoneSettings();
            // Check if timeZone is valid
            // if (!timeZone || !moment.tz.zone(timeZone)) {
            //   console.error("Invalid timezone:", timeZone);
            //   return;
            // }
            const start = expoFormatDate(startDate, true, false, false, timeZone, false);
            const end = expoFormatDate(endDate, true, true, true, timeZone, false);
            setFormattedStartDate(start);
            setFormattedEndDate(end);
        };
        formatDates();
    }, [startDate, endDate]);

    useEffect(() => {
        // Update position initially
        updateDialogPosition();

        // Add resize event listener
        const handleResize = () => {
            updateDialogPosition();
        };

        window.addEventListener("resize", handleResize);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [anchorEl]);

    return (
        <div>
            <Dialog
                className={'sm:left-[70px]'}
                open={open}
                onClose={onClose}
                disableEscapeKeyDown
                BackdropProps={{ style: { display: "none" } }}
                PaperProps={{
                    sx: {
                        width: { xs: "100%", sm: "380px" },
                        maxWidth: { xs: "100%", sm: "380px" },
                        Height: "100vh",
                        maxHeight: { xs: "100vh", sm: "calc(100vh - 80px)" },
                        // minHeight: { xs: "calc(100vh - 60px)", sm: "100vh" },
                        position: "absolute",
                        // org
                        top: {
                            xs: "0",
                            sm: "inherit",
                        },
                        bottom: {
                            xs: "inherit",
                            sm: "20px",
                        },
                        // top: dialogPosition.top + "px",
                        // top: { 
                        //   xs: "0", 
                        //   sm: `${dialogPosition.top}px` 
                        // },
                        left: dialogPosition.left + "px",
                        margin: { xs: "auto", sm: "0" },
                        borderRadius: "12px",
                        boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
                    },
                }}
            >
                <DialogTitle sx={{ padding: "16px 28px !important" }}
                >
                    <Typography

                        color="text.primary"
                        className="font-semibold text-[18px]"
                    >
                        {t('expo_info')}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ position: "absolute", right: 8, top: 8, color: "black" }}
                    >
                        <FuseSvgIcon>feather:x</FuseSvgIcon>
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        padding: "20px 28px !important",
                        backgroundColor: (theme) => theme.palette.background.default,
                        position: "relative",
                        boxShadow: "none",
                    }}
                >
                    <Box

                    >
                        <Typography
                            color="text.primary"
                            className="font-semibold text-[18px]"
                        >{data?.expName.length >= 35 ? data?.expName.slice(0, 35) : data?.expName}</Typography>
                        <Typography
                            color="text.primary"
                            className="font-semibold text-[12px]"
                        >{t('expoInfo_startDate')}: {formattedStartDate}</Typography>
                        <Typography
                            color="text.primary"
                            className="font-semibold text-[12px]"
                        >{t('expoInfo_endDate')}: {formattedEndDate}</Typography>
                        <Typography
                            color="text.primary"
                            className="font-semibold text-[12px]"
                        >{t('expoInfo_expoCode')}: {data?.expCode}</Typography>
                        <Typography
                            color="text.primary"
                            className="font-semibold text-[12px]"
                        >{t('expoInfo_description')}: {data?.expDescription}</Typography>

                    </Box>
                    {/* <Divider className="my-[10px]" orientation="horizontal" flexItem /> */}
                </DialogContent>
            </Dialog></div>
    )
}

export default ExpoInfo