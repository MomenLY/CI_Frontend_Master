import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { Button } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { subscribe } from "../api/subscribe";
import { useTranslation } from "react-i18next";
import { checkUsersPaymentStatus } from "../api/users-details-api";
import HorizontalLinearStepper1 from "./HorizontalLinearStepper1";
import { getTenantSlug } from "src/utils/tenantHelper";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, ThreadsIcon, ThreadsShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from "react-share";
import { getEvent } from "../api/event-details-api";

type Expo = {
    id: string;
    expName: string;
    expDescription: string;
    expStartDate: string;
    expEndDate: string;
    expIsPaid: boolean;
    expType: string;
    expPrice: number;
    expVenue: string;
    firstName: string;
    lastName: string;
    userImage: string;
    expAddress: string;
    expTermsConditionIsEnabled: boolean;
    expTermsAndConditions: string;
    expIsRegistrationEnabled: boolean;
    expBanerImage: string;
    expCode: string;
    expCreator: string;
    expRegistrationEndDate: string;
    expRegistrationStartDate: string;
    expIsSeatsUnlimited: boolean;
    expMaxSeats: number;
    expoId: string;
    expTenantId: string;
    expRegistrationEndType: string;
};

function PaymentSuccess() {
    const [expo, setExpo] = useState<Expo | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [shareContent, setShareContent] = useState("");
    const location = useLocation();
    const { id } = useParams();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderid');
    const [paymentSuccess, setPaymentSuccess] = useState("");
    const urlParams = new URLSearchParams(window.location.search);
    const { t } = useTranslation('registration');
    const navigate = useNavigate();
    const type = urlParams.get('type');
    const [count, setCount] = useState(5);
    const routeParams = useParams();
    const [showShareOptions, setShowShareOptions] = useState(false);
    const shareRef = useRef(null);


    useEffect(() => {
        if (type) {
            setPaymentSuccess(t('reg_successful'));
        } else {
            initPaymentStatus();
        }

    }, []);

    const initPaymentStatus = async () => {
        if (count > 0) { // Decrement until count reaches 0
            setCount(count - 1);
            setTimeout(async () => {
                const paymentStatus = await checkUsersPaymentStatus(orderId);
                if (paymentStatus.data === 'unpaid') {
                    if (count <= 0) {
                        navigate(`/${getTenantSlug(routeParams)}/events/:id/payment-cancel`); // Update this as per your route
                    } else {
                        initPaymentStatus();
                    }
                }
                if (paymentStatus.data === 'paid') {
                    setPaymentSuccess(t('reg_payment_successful'));
                }
            }, 1000);
        } else {
            alert("Please contact admin for further details");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShareOptions(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleShare = () => {
        setShowShareOptions((prev) => !prev);
    };
    useEffect(() => {
        const fetchDetails = async () => {
            const expoDetails = await getEvent(id);
            setExpo(expoDetails?.expo);
            setShareUrl(`${import.meta.env.VITE_TENANT_URL}/${routeParams.tenant_id}/events/${routeParams?.id}`);
            setShareContent(t('shareContent'));
        };

        fetchDetails();
    }, [id]);

    const subcription = async (payload) => {
        const response = await subscribe(payload);
    }

    const handleCheckout = async () => {
        navigate(`/${getTenantSlug(routeParams)}/events/${id}`);
    }

    return (
        <>

            <Box
                className="p-20 md:p-60 "
                sx={{
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: "1",
                }}
            >
                <Box
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
                            {type ? t('reg_successfull') : t('reg_payment_successfull')}
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
                                    {t('reg_Congratulation')}
                                </Typography>
                                <Typography
                                    color="text.disabled"
                                    component="p"
                                    className="text-[12px] font-[400]  leading-[20px]  "
                                >
                                    {t('reg_complete_text')}
                                </Typography>

                                <div className="flex items-center flex-col justify-center mt-[30px]">
                                    <div className="flex items-center justify-center">
                                        <span className="text-[#5046E5] cursor-pointer me-[8px]" onClick={handleShare} >
                                            <FuseSvgIcon size={24}>material-outline:share</FuseSvgIcon>
                                        </span>
                                        <Typography
                                            color="primary"
                                            component="p"
                                            className="text-[16px] font-[600]  leading-[20px]  "
                                            onClick={handleShare}
                                        >
                                            Share
                                        </Typography>
                                    </div>

                                    {
                                        showShareOptions &&
                                        <div className=" bg-white p-[15px] rounded-md flex flex-col gap-3">

                                            {/* <div className="flex justify-between ">
                                                <p>{t('shareViaText')}</p>
                                                <button
                                                    onClick={() => setShowShareOptions(false)}
                                                    className=""
                                                >
                                                    <FuseSvgIcon size={16}>material-outline:close</FuseSvgIcon>
                                                </button>
                                            </div>

                                            <hr className="border-gray-300 mt-5" /> */}

                                            {/* Share Buttons Row */}
                                            <div className="flex gap-5 mt-5">
                                                {/* Facebook */}
                                                <FacebookShareButton url={shareUrl} title={shareContent}>
                                                    <FacebookIcon size={32} round />
                                                </FacebookShareButton>

                                                {/* Twitter */}
                                                <TwitterShareButton url={shareUrl} title={shareContent}>
                                                    <TwitterIcon size={32} round />
                                                </TwitterShareButton>

                                                {/* WhatsApp */}
                                                <WhatsappShareButton url={shareUrl} title={shareContent}>
                                                    <WhatsappIcon size={32} round />
                                                </WhatsappShareButton>

                                                {/* Threads */}
                                                <ThreadsShareButton url={shareUrl} title={shareContent}>
                                                    <ThreadsIcon round size={32} />
                                                </ThreadsShareButton>

                                                <LinkedinShareButton url={shareUrl} title={shareContent}>
                                                    <LinkedinIcon round size={32} />
                                                </LinkedinShareButton>
                                            </div>
                                        </div>
                                    }
                                </div>
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
                                onClick={handleCheckout}
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
                                {t('reg_next_button_text')}
                            </Button>
                        </div>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default PaymentSuccess;
