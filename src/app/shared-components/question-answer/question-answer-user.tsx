import React, { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    CircularProgress,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { io } from 'socket.io-client';
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import moment from "moment";
import { askQuestion, getQuestionByUserId } from "./apis";
import { useParams } from "react-router";
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
// const socket = useMemo(() => io(import.meta.env.VITE_DB_URL), []); // Use import.meta.env
import { userImageUrl, userImageUrlWithTenant } from 'src/utils/urlHelper';
import { useTranslation } from "react-i18next";
// Define props interface
interface QaModalProps {
    open: boolean;
    handleClose: () => void;
    userId: any;
    expo: any;
    setActiveIndex: any;
    questionSub: any;
}

const QaModal: React.FC<QaModalProps> = ({ questionSub, open, handleClose, userId, expo, setActiveIndex }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [question, setQuestion] = useState('');
    const [receivedAnswers, setReceivedAnswers] = useState([]);
    const [questions, setQuestions] = useState([questionSub]); // To store the list of questions and their IDs
    const [answers, setAnswers] = useState({}); // To store answers with questionId
    const routeParams = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [userDetails, setUserDetails] = useState(null);
    const [expoDetails, setExpoDetails] = useState(null)
    const { t } = useTranslation('questionAnswer');
    const messagesEndRef = useRef(null);
    // Ensure that socket initialization is only done once
    const socket = useMemo(() => io(import.meta.env.VITE_DB_URL), []); // Use import.meta.env

    // const socket = useMemo(() => io(import.meta.env.VITE_DB_URL), []); // Use import.meta.env 
    useEffect(() => {
        socket.on("connect", () => console.log("Connected to server with ID:", socket.id));

    }, [socket]);

    useEffect(() => {
        const handleReceiveAnswer = (data) => {

            // Update the answers state by finding the matching question and appending the answer
            setQuestions(prevQuestions =>
                prevQuestions.map(question =>
                    question.id === data.data.id
                        ? { ...question, answer: data.data.answer, adminName: data.data.adminName, adminImage: data.data.adminImage, repliedAt: data?.data?.repliedAt }  // Update the answer field for the matching question
                        : question
                )
            );
        };

        socket.on('receiveAnswer', handleReceiveAnswer);

        return () => {
            socket.off('receiveAnswer', handleReceiveAnswer);
        };
    }, [socket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        getInitialDetails()
        setQuestions(questionSub);
        const timeout = setTimeout(scrollToBottom, 500);
        return () => clearTimeout(timeout);
    }, [open, setQuestions]); // Run whenever these states change



    useEffect(() => {
        getInitialDetails()
        // Try logging the connection status
    }, []);
    useEffect(() => {
        getInitialDetails()
        // Try logging the connection status
    }, [open]);
    const getInitialDetails = async () => {
        const userData = await LocalCache.getItem(
            cacheIndex.userData,
            getUserSession.bind(this)
        );
        setUserDetails(userData);
        let expoDetails = await LocalCache.getItem(
            cacheIndex.expoDetails + "_" + routeParams.id,
            getSingleExpoAPI.bind(this, routeParams.id)
        );
        const expos = expoDetails.data.expo;
        setExpoDetails(expos)
    };



    const submitQuestion = async () => {
        try {
            setIsLoading(true); // Set loading to true when submission starts
            const username = userDetails?.data?.displayName || "Anonymous"; // Fallback if displayName is not available
            const userImage = userDetails?.data?.userImage || ""; // Optional: Fallback to empty string if no image
            const userEmail = userDetails?.data?.email || "anonymous@example.com"; // Fallback email
            const expoCode = expoDetails?.expCode; // Expo code, could be dynamic if needed
            const queryParams = new URLSearchParams(location.search);
            const schedule = queryParams.get("schedule");

            // Prepare the question data
            const questionData = {
                expoCode,
                question, // Assuming `question` is coming from the input field
                userId: userDetails?.uuid, // Assuming userId is available in userDetails
                userName: username,
                userImage: userImage,
                userEmail: userEmail,
                subId: schedule
            };

            // Call the askQuestion function to submit the question
            const res = await askQuestion(questionData);
            socket.emit('askQuestion', { res });

            // If the response is successful, add the question to the state
            if (res?.question) {
                setQuestions(prevQuestions => [...prevQuestions, res]); // Append new question
            } else {
                console.error("Failed to submit the question.");
            }
            setQuestion(''); // Clear the input field after submitting
        } catch (error) {
            console.error("Error submitting the question:", error);
        } finally {
            setIsLoading(false); // Set loading to false after the submission is complete
        }
    };

    return (
        <Dialog
            className="md:left-[40px] bottom-[60px] md:bottom-0"
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick") {
                    handleClose();
                }
            }}
            BackdropProps={{ style: { display: "none" } }}
            PaperProps={{
                sx: {
                    width: { xs: "calc(100vw)", md: "600px", lg: "800px" },
                    Height: "100vh",
                    maxHeight: { xs: "calc(100vh - 60px)", sm: "100vh" },
                    minHeight: { xs: "calc(100vh - 60px)", sm: "100vh" },
                    maxWidth: "100%",
                    position: "absolute",
                    top: { xs: 0, sm: "auto" },
                    left: { xs: "inherit", sm: "20px" },
                    margin: 0,
                    borderRadius: { xs: "0", md: "0 10px 10px 0" },
                },
            }}
        >
            <DialogTitle
                sx={{
                    padding: "16px !important",
                }}
            >
                <Typography
                    color="text.primary"
                    className="font-semibold text-[16px] block mb-0 truncate"
                >
                    {t('QA_heading')}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={() => { handleClose(), setActiveIndex(0) }}
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
                    padding: "60px 38px 60px 32px !important",
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <div className="flex items-end min-h-full flex-col-reverse gap-[28px] w-full">
                    {/* List of questions */}
                    {questions.slice().reverse().map((q, index) => {

                        return (
                            <div className="flex gap-6 items-end w-full" key={index}>
                                <Avatar
                                    alt="Remy Sharp"
                                    src={userImageUrl(q?.userImage)}
                                    // src={q.userImage}
                                    sx={{ width: 32, height: 32 }}
                                />
                                <Box
                                    sx={{
                                        background: (theme) => theme.palette.background.paper,
                                        borderRadius: "12px 12px 12px 0",
                                        padding: "12px",
                                        border: "1px solid",
                                        flex: 1,
                                        borderColor: isVisible
                                            ? (theme) => theme.palette.primary.main
                                            : "transparent",
                                    }}
                                >

                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Typography
                                            color="text.primary"
                                            // variant="span"
                                            className="font-semibold text-[10px] leading-[12px]"
                                        >
                                            {q?.userName}
                                        </Typography>
                                        <Typography
                                            color="text.disabled"
                                            // variant="span"
                                            className="font-normal text-[9px] leading-[12px]"
                                        >
                                            {q.submittedAt &&
                                                moment(q.submittedAt).format("HH:mm, DD MMM YY")}
                                        </Typography>
                                    </div>

                                    <Typography
                                        color="text.primary"
                                        className="font-regular text-[12px] leading-[18px] block my-6"
                                    >
                                        {q.question}
                                    </Typography>


                                    {q?.answer !== null && q?.answer !== "" && q?.answer !== undefined &&
                                        <Box
                                            sx={{
                                                border: (theme) =>
                                                    `1px solid ${theme.palette.primary.main} !important`,
                                                borderRadius: "12px",
                                                padding: "12px",
                                                marginTop: "15px",
                                            }}
                                        >
                                            <div className="flex items-center space-x-2 mb-[10px]">

                                                <Avatar
                                                    alt="Remy Sharp"
                                                    src={userImageUrlWithTenant(q?.adminImage, expo?.expTenantId)}
                                                    // src={userImageUrl(q?.adminImage)}
                                                    sx={{ width: "16px", height: "16px", marginRight: "5px" }}
                                                />

                                                <Typography
                                                    color="primary.main"
                                                    // variant="span"
                                                    className="font-semibold text-[10px] leading-[12px]"
                                                >
                                                    {q?.adminName}
                                                </Typography>
                                                <Typography
                                                    color="text.disabled"
                                                    // variant="span"
                                                    className="font-normal text-[9px] leading-[12px]"
                                                >
                                                    {q?.repliedAt && moment(q?.repliedAt).format('HH:mm, DD MMM YY')}
                                                </Typography>
                                            </div>
                                            <Typography
                                                color="text.primary"
                                                // variant="p"
                                                className="font-[500] text-[12px] leading-[18px] block my-6"
                                            >
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: q?.answer }}

                                                ></div>
                                            </Typography>
                                        </Box>}
                                </Box>
                            </div>
                        )
                    })}


                </div>
            </DialogContent>




            <DialogActions>
                <Box
                    className="flex w-full items-center"
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        placeholder={t('QA_inputMge')}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // Prevent the default form submission
                                submitQuestion(); // Call the submit function when Enter is pressed
                            }
                        }}
                        className="w-full !mb-0"
                        id="filled-multiline-flexible"
                        label=""
                        variant="filled"
                        fullWidth
                        sx={{
                            "& .MuiFilledInput-input": {
                                outline: "none",
                                border: "none",
                                // backgroundColor: "#F1F5F9",
                                padding: "5px 20px !important",
                            },
                            "& .MuiInputBase-root": {
                                outline: "none",
                                border: "none",
                                backgroundColor: "#F1F5F9",
                                borderRadius: "6px",
                                padding: "0 !important",
                                color: "#191A23",
                                fontSize: "12px",
                                height: "38px",
                            },
                            "& fieldset": {
                                border: "none",
                            },
                        }}
                    />

                    <>
                        <div className="min-w-[70px] max-w-[70px] flex items-center justify-center">
                            {isLoading === true ? <CircularProgress size={25} color='inherit' /> :

                                <Button
                                    disabled={question == ""}
                                    onClick={submitQuestion}
                                    sx={{
                                        backgroundColor: "background.paper",
                                        "&:hover": {
                                            backgroundColor: "background.paper",
                                        },
                                    }}
                                >
                                    <svg
                                        width="19"
                                        height="16"
                                        viewBox="0 0 19 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0 16V0L19 8L0 16ZM2 13L13.85 8L2 3V6.5L8 8L2 9.5V13Z"
                                            fill="#808080"
                                        />
                                    </svg>
                                </Button>}

                        </div>


                    </>


                </Box>
                <div ref={messagesEndRef} />
            </DialogActions>
        </Dialog>
    );
};

export default QaModal;
