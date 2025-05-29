import React, { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Controller, useForm } from "react-hook-form";
import WYSIWYGEditorSub from "app/shared-components/WYSIWYGEditorSub";
import { io } from "socket.io-client";
import moment from "moment";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSingleExpoAPI, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { getQuestionBySubId, getQuestions, sendAnswer } from "./apis";
import { userImageUrl, userImageUrlWithTenant } from 'src/utils/urlHelper';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
interface QaModalProps {
  open: boolean;
  handleClose: () => void;
  setActiveIndex: any;
  expo: any;
  checkSession:boolean;
  question:any
}

const QaModal: React.FC<QaModalProps> = ({question, checkSession,open, handleClose, setActiveIndex, expo }) => {
  const { handleSubmit, formState, control } = useForm({
    mode: "onChange",
  });
  const socket = useMemo(() => io(import.meta.env.VITE_DB_URL), []); // Use import.meta.env
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([question]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [replyTime, setReplyTime] = useState("")
  const { t } = useTranslation('questionAnswer');
  const messagesEndRef = useRef(null);
  const routeParams = useParams();
  const [expoDetails, setExpoDetails] = useState(null)
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    getInitialDetails()
    setQuestions(question);
    const timeout = setTimeout(scrollToBottom, 500);
    return () => clearTimeout(timeout);
  }, [open, setQuestions]); // Run whenever these states change




  // useEffect(() => {
  //   getInitialDetails()

  //   // Try logging the connection status
  // }, []);

  // useEffect(() => {
  
  // }, [checkSession]); // Add expo?.id as a dependency

  const getInitialDetails = async () => {
    const userData = await LocalCache.getItem(
      cacheIndex.userData,
      getUserSession.bind(this)
    );
    setUserDetails(userData.data);
    let expoDetails = await LocalCache.getItem(
      cacheIndex.expoDetails + "_" + routeParams.id,
      getSingleExpoAPI.bind(this, routeParams.id)
    );
    const expos = expoDetails.data.expo;
    setExpoDetails(expos)
  };
  useEffect(() => {

    // Listen for new questions from users
    socket.on("newQuestion", (data) => {
      const queryParams = new URLSearchParams(location.search);
      const schedule = queryParams.get("schedule");
      if (data.data.res.SubId == schedule) {
        setQuestions((prev) => [...prev, data.data.res]);
      }

    });
    // Cleanup the socket when the component is unmounted
    return () => {
      socket.off("newQuestion");  
    };
  }, []);
  const sendAnswerToUser = async () => {
    setIsLoading(true)
    // Check if a question is selected and an answer is provided
    if (selectedQuestion && answer) {
      // Find the index of the selected question in the questions array
      const questionIndex = questions.findIndex(
        (q) => q.id === selectedQuestion
      );
      if (questionIndex !== -1) {
        const adminImage = userDetails?.userImage || "";
        // Extract userId and questionId from the selected question
        const { userId, questionId } = questions[questionIndex];
        const adminName = userDetails?.displayName; // Get the admin's name
        const repliedAt = new Date().toLocaleString(); // Get the current timestamp
        // Emit the answer to the server with relevant details

        try {
          // Call the API to submit the answer
          const response = await sendAnswer(selectedQuestion, answer, adminName, adminImage);
          socket.emit("sendAnswer", response);
          // Handle the API response if necessary
          // Update the question with the answer in the local state
          const updatedQuestions = questions.map((q, index) =>
            index === questionIndex
              ? { ...q, answer ,repliedAt} // Add the admin's answer to the selected question object
              : q
          );

          setQuestions(updatedQuestions); // Update state with the new questions array
          setAnswer(""); // Clear the answer input field after sending
          setSelectedQuestion(null); // Reset the selected question after sending the answer
          setIsLoading(false)
        } catch (error) {
          setIsLoading(false)
          console.error("Error submitting answer to API:", error);
          alert("Failed to submit the answer. Please try again."); // Notify the user of the error
        }
      }
    } else {
      alert("Please select a question and write an answer."); // Prompt user if validation fails
    }
  };


  const handleQuestionClick = (q: any) => {
    setIsVisible(true);
    setSelectedQuestion(q.id);
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
        <div className="messages flex flex-col gap-[28px] w-full">
          {/* List of questions */}
          {questions.map((q, index) => (
            <div className="flex gap-6 items-end w-full" key={index}>
              {/* {userImageUrlWithTenant(q?.adminImage,expo?.expTenantId)} */}
              <Avatar
                alt="Remy Sharp"
                src={userImageUrlWithTenant(q?.adminImage, expo?.expTenantId)}
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
                  borderColor:
                    selectedQuestion === q.id
                      ? (theme) => theme.palette.primary.main
                      : "transparent",
                }}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Typography
                    color="text.primary"
                    className="font-semibold text-[12px] leading-[14px]"
                  >
                    {q.userName}
                  </Typography>
                  <Typography
                    color="text.disabled"
                    className="font-normal text-[10px] leading-[12px]"
                  >
                    {q.submittedAt &&
                      moment(q.submittedAt).format("HH:mm, DD MMM YY")}
                  </Typography>
                </div>

                <Typography
                  color="text.primary"
                  className="font-regular text-[14px] leading-[22px] block my-6"
                >
                  {q.question}
                </Typography>


                {q.answer && (

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

                        src={userImageUrl(userDetails?.userImage)}
                        // src={userDetails?.userImage}
                        sx={{ width: "16px", height: "16px", marginRight: "5px" }}
                      />

                      <Typography
                        color="primary.main"
                        // variant="span"
                        className="font-semibold text-[12px] leading-[14px]"
                      >
                        {userDetails?.displayName}
                      </Typography>
                      <Typography
                        color="text.disabled"
                        // variant="span"
                        className="font-normal text-[10px] leading-[12px]"
                      >
                        {replyTime &&
                          moment(replyTime).format("HH:mm, DD MMM YY")}

                      </Typography>
                    </div>
                    <Typography
                      color="text.primary"
                      // variant="p"
                      className="font-[500] text-[14px] leading-[22px] block my-6"
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: q.answer }}

                      ></div>
                    </Typography>
                  </Box>)}
                {!q.answer && selectedQuestion !== q.id && (
                  <Link
                    onClick={() => handleQuestionClick(q)}
                    className="font-regular text-[12px] leading-[12px] cursor-pointer"
                    sx={{ textDecoration: "none !important" }}
                  >
                    {t('QA_reply_btn')}
                  </Link>)}

                {selectedQuestion === q.id && (
                  <Box
                    sx={{
                      background: (theme) => theme.palette.background.paper,
                      boxShadow: "0px 1px 5px 1px rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      padding: "15px",
                      marginTop: "15px",
                    }}
                  >
                    <div className="flex items-center gap-10 w-full ">
                      <span className=" cursor-pointer inline-flex" >
                        <svg

                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="mask0_55_82"
                            style={{ maskType: "alpha" }}
                            maskUnits="userSpaceOnUse"
                            x={0}
                            y={0}
                            width={18}
                            height={18}
                          >
                            <rect width={18} height={18} fill="#D9D9D9" />
                          </mask>
                          <g mask="url(#mask0_55_82)">
                            <path
                              d="M14.25 14.2377V11.2377C14.25 10.6127 14.0313 10.0814 13.5938 9.64392C13.1562 9.20642 12.625 8.98767 12 8.98767H5.11875L7.81875 11.6877L6.75 12.7377L2.25 8.23767L6.75 3.73767L7.81875 4.78767L5.11875 7.48767H12C13.0375 7.48767 13.9219 7.8533 14.6531 8.58455C15.3844 9.3158 15.75 10.2002 15.75 11.2377V14.2377H14.25Z"
                              fill="#1C1B1F"
                            />
                          </g>
                        </svg>
                      </span>

                      <Typography
                        color="text.primary"
                        // variant="p"
                        className="font-[400] text-[14px] leading-[22px] block my-6"
                      >
                        <span className="font-[600]"> {q.username} </span>{" "}
                        ({q.userEmail})
                      </Typography>
                    </div>
                    <Controller
                      render={({ field }) => (
                        <WYSIWYGEditorSub
                          value={field.value} // Pass the Controller's `value`
                          onChange={(editorState) => {
                            setAnswer(editorState);
                            field.onChange(editorState); // Pass the `onChange` method from Controller
                          }}
                          className="!overflow-visible mt-8 mb-16"
                        />
                      )}
                      name="message" // Name for the field to be controlled by react-hook-form
                      control={control}
                      defaultValue="" // Ensure initial value is set
                    />

                    <div className="flex items-center min-h-[50px]">
                      <div className="flex-1 items-center flex ">
                        {isLoading === true ? <CircularProgress size={25} color='inherit' /> :
                          <Button
                            disabled={answer == ""}
                            className=""
                            variant="contained"
                            color="secondary"
                            onClick={sendAnswerToUser}
                          >

                            {t('QA_send_btn')}
                          </Button>}
                      </div>
                      <div className="cursor-pointer inline-flex">
                        <FuseSvgIcon
                          onClick={() => {
                            setIsVisible(false);
                            setSelectedQuestion(null);
                          }}
                          className="text-48"
                          size={20}
                          color="error"
                        >
                          feather:trash
                        </FuseSvgIcon>
                      </div>
                    </div>
                  </Box>
                )}
              </Box>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QaModal;
