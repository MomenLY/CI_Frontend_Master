import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import AttendeesListModal from "./AttendeesListModal";
// import AttendeesChatFullModal from "./AttendeesChatFullModal";
// import QaModal from "./QaModal";
import LocalCache from "src/utils/localCache";
import PollPopup from "../../../shared-components/polls/PollPopup";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { checkAdminStatus, checkSeesionStatus, checkSpeakerStatus } from "../../../shared-components/poll/pollRollPrivillage";
import { useLocation, useNavigate, useParams } from "react-router";
import QaModal from "../../../shared-components/question-answer/question-answer-admin";
import QaModalUser from "../../../shared-components/question-answer/question-answer-user";
import { Avatar, Button, Tooltip, darken } from "@mui/material";
import { getQuestionBySubId, getQuestionByUserId } from "app/shared-components/question-answer/apis";
import { useTranslation } from "react-i18next";
import { userImageUrl } from "src/utils/urlHelper";
import UserMenuList from "../home/userMenuList";
import { useUsersSelector } from "../../users/UsersSlice";
import ExpoInfo from "../home/ExpoInfo";
// Define the type for list items
interface ListItemType {
  tooltip: string;
  icon?: string;  // Make icon optional
}


const Root = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: "100%",
  position: "relative",
  flex: "1 1 auto",
  width: "100%",
  height: "auto",
  backgroundColor: theme.palette.background.default,
}));

function SubSideBar(props) {
  const { scheduleId, onClick, onClickUsers, socket, expo, checkSessions, onClickChatClose, onClickUsersClose } = props;
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [openListModal, setOpenListModal] = useState<boolean>(false);
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [openQAModal, setOpenQAModal] = useState<boolean>(false);
  const [openPollModal, setOpenPollModal] = useState<boolean>(false);
  const [userRole, setUserRole] = useState("");
  const [checkIsAdmin, setCheckIsAdmin] = useState(null);
  const [checkIsSpeaker, setCheckIsSpeaker] = useState(null);
  const [checkSession, setCheckSession] = useState(null);
  const routeParams = useParams();
  const [userId, setUserID] = useState("");
  const [questions, setQuestions] = useState([]);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();
  const [questionsForUser, setQuestionsForUser] = useState([]);
  const [user, setUser] = useState();
  const state = useUsersSelector((state) => state.state.value);
  const [userData, setUserData] = useState<any>();
  const [isUserMenu, setIsUserMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeDownIndex, setActiveDownIndex] = useState<number | null>();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeUpIndex, setActiveUpIndex] = useState<number | null>()
  const { t } = useTranslation("user-dashboard");
  useEffect(() => {

    const fetchData = async () => {
      const checkAdmin = await checkAdminStatus(routeParams); // Pass routeParams
      const checkSpeaker = await checkSpeakerStatus(routeParams); // Pass routeParams
      const checkSession = await checkSeesionStatus(routeParams, location); // Pass routeParams

      setCheckIsAdmin(checkAdmin);
      setCheckIsSpeaker(checkSpeaker)
      // setCheckSession(checkSession);

    };

    fetchData();
  }, [routeParams]);

  useEffect(() => {
    getInitialDetails();
  }, [expo]);

  const getInitialDetails = async () => {
    socket.emit("request_polls");
    socket.on("polls_updated", (polls) => {
      if (polls.length > 0 && userData.role !== "enduser") {
        setOpenPollModal(true)
      }
    });
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
      if (user) {
        setUser(user);
        setUserData(user);
        setUserRole(user.role);
        setUserID(user.uuid);
      }
    };
    getUserDetails();
  }, [state]);

  const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setIsUserMenu(true);
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setIsUserMenu(false);
    setAnchorEl(null);
    setActiveDownIndex(null)
  };

  const handleExpoInfoClose = () => {
    setShowInfoModal(false);
    setAnchorEl(null);
    setActiveDownIndex(null);
  }

  const ListItemsUp: ListItemType[] = [
    { icon: "material-outline:arrow_back", tooltip: t("home") },
  ]

  const listItems: ListItemType[] = [
    { icon: "material-outline:arrow_back", tooltip: t("home") },
    { icon: "material-outline:festival", tooltip: t("Lobby") },
    { icon: "material-outline:group", tooltip: t("attendees") },
    { icon: "material-outline:chat", tooltip: t("chat") },
  ];

  const listItemsDown: ListItemType[] = [
    { icon: "material-outline:account_circle", tooltip: t("profile") },
    { icon: "material-outline:info", tooltip: "Info" }
  ]


  // Add the poll icon only if userRole is not "Admin"
  if (userRole !== "enduser" && checkIsAdmin && checkSessions) {
    if (checkIsSpeaker) {
      listItems.push({ icon: "material-outline:forum", tooltip: t("question_answer") },
        { icon: "material-outline:ballot", tooltip: t("poll") }

      );
    } else {
      listItems.push({ icon: "material-outline:forum", tooltip: t("question_answer") },
        { icon: "material-outline:ballot", tooltip: t("poll") }

      );
    }
  } else if (checkSessions) {
    listItems.push({ icon: "material-outline:forum", tooltip: t("question_answer") },
    );
  }
  // Add help icon at the end
  // listItems.push({ icon: "feather:help-circle", tooltip: t("info") });

  const handleItemClick = async (index: number) => {
    setActiveIndex(index);
    if (index === 0) {
      navigate(`/${routeParams?.tenant_id}/events/${routeParams?.id}`);
      onClickUsersClose();
      onClickChatClose();
      handleCloseQAModal();
      handleUserMenuClose();
    } else if (index === 1) {
      navigate(`/${routeParams?.tenant_id}/events/join/${routeParams?.id}`);
      onClickUsersClose();
      onClickChatClose();
      handleCloseQAModal();
      handleUserMenuClose();
    } else if (index === 2) {
      setOpenListModal(true);
      onClickUsers()
      onClickChatClose();
      handleCloseQAModal();
      handleUserMenuClose();
    } else if (index === 3) {
      setOpenChatModal(true);
      onClick('modalChat');
      onClickUsersClose();
      handleCloseQAModal();
      handleUserMenuClose();
    } else if (index === 4) {
      getAllQuestions()
      onClickUsersClose()
      onClickChatClose();
      handleUserMenuClose();
    } else if (index === 5 && userRole !== "enduser" && checkIsAdmin) {
      setOpenPollModal(true);
      onClickUsersClose();
      onClickChatClose();
      handleCloseQAModal();
      handleUserMenuClose();
    }
  };

  useEffect(() => {
    if (activeDownIndex !== null && activeDownIndex !== undefined) {
      handleDownItemClickFn(activeDownIndex);
    }
  }, [activeDownIndex]);

  useEffect(() => {
    if (activeUpIndex !== null && activeUpIndex !== undefined) {
      handleUpItemClickFn(activeUpIndex)
    }
  }, [activeUpIndex])

  const handleUpItemClickFn = (index: number) => {
    if (index === 0) {
      navigate(`/${routeParams?.tenant_id}/events/${routeParams?.id}`);
      onClickUsersClose();
      onClickChatClose();
      handleCloseQAModal();
      handleUserMenuClose();
    }
  }

  const handleDownItemClickFn = (index: number) => {
    if (index === 0) {
      setIsUserMenu(true);
      onClickChatClose();
      onClickUsersClose();
      handleCloseQAModal();
      handleExpoInfoClose();
    } else if (index === 1) {
      setShowInfoModal(true)
      onClickChatClose();
      onClickUsersClose();
      handleCloseQAModal();
      handleUserMenuClose();
    }
  }

  const handleCloseListModal = () => {
    setOpenListModal(false);
  };

  const handleCloseChatModal = () => {
    setOpenChatModal(false);
  };

  const handleCloseQAModal = () => {
    setOpenQAModal(false);
    setQuestions([])
    setQuestionsForUser([])
  };

  const handleClosePollModal = () => {
    setOpenPollModal(false);
  };
  const getAllQuestions = async () => {

    setIsLoading(true);
    try {
      const expoCode = expo?.expCode;
      const queryParams = new URLSearchParams(location.search);
      const schedule = queryParams.get("schedule");
      const res = await getQuestionBySubId(expoCode, scheduleId);

      setQuestions(res);
      const resForUser = await getQuestionByUserId(userId, expoCode, scheduleId);
      setQuestionsForUser(resForUser);

      const checkSession = await checkSeesionStatus(routeParams, location);
      setCheckSession(checkSession);
      setOpenQAModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching billboard details:", error);
      setIsLoading(false); // Handle loading in case of an error
    }
    // setQuestions(res?.allExpo);
  };

  return (
    <Root>
      <Box
        sx={{
          background: (theme) => theme.palette.primary.main,
          position: "fixed",
          width: { xs: "100%", sm: "60px" },
          height: { xs: "60px", sm: "100%" },
          zIndex: 99999999,
          bottom: 0,
          overflowX: { xs: "auto", sm: "hidden" },
          overflowY: "hidden",

        }}
      >
        <nav aria-label="main mailbox folders" className="flex flex-col h-full">
          {/* <List className="sspace-y-0 flex py-0 sm:py-[45px] flex-row sm:flex-col top-[-25px]">
            {ListItemsUp.map((item, index) => (
              <ListItem key={index} className="p-10">
                <ListItemButton
                  onClick={() => setActiveUpIndex(index)}
                  className={`flex justify-center rounded-full ${activeIndex === index ? "bg-white" : ""}`}
                  sx={{
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: activeIndex === index ? "common.white" : "primary.main",
                    },
                  }}
                >
                  <Tooltip
                    title={item.tooltip || ''}
                    placement="right"
                  >
                    <ListItemIcon className="min-w-[auto]" >
                      <FuseSvgIcon
                        size={24}
                        color={`${activeIndex === index ? "primary.main" : "common.white"}`}
                      >
                        {item.icon}
                      </FuseSvgIcon>
                    </ListItemIcon></Tooltip>
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
          <List className="sspace-y-0 flex py-0 flex-row sm:flex-col">
            {listItems.map((item, index) => (
              <ListItem key={index} className="p-10">
                <ListItemButton
                  onClick={() => handleItemClick(index)}
                  className={`flex justify-center rounded-full ${activeIndex === index ? "bg-white" : ""}`}
                  sx={{
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: activeIndex === index ? "common.white" : "primary.main",
                    },
                  }}
                >
                  <Tooltip
                    title={item.tooltip || ''}
                    placement="right"
                  >
                    <ListItemIcon className="min-w-[auto]" >
                      <FuseSvgIcon
                        size={24}
                        color={`${activeIndex === index ? "primary.main" : "common.white"}`}
                      >
                        {item.icon}
                      </FuseSvgIcon>
                    </ListItemIcon></Tooltip>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <div className="flex-grow"></div>
          <List className="sspace-y-0 flex py-0 sm:py-[45px] flex-row sm:flex-col">
            {
              listItemsDown.map((item, index) => (
                <ListItem key={index} className="p-10">
                  <ListItemButton
                    onClick={() => setActiveDownIndex(index)}
                    className={`flex justify-center rounded-full ${activeDownIndex === index ? "bg-white" : ""}`}
                    sx={{
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: activeDownIndex === index ? "common.white" : "primary.main",
                      },
                    }}
                  >
                    <Tooltip
                      title={item.tooltip || ''}
                      placement="right"
                    >
                      <ListItemIcon className="min-w-[auto]" >
                        <FuseSvgIcon
                          size={24}
                          color={`${activeDownIndex === index ? "primary.main" : "common.white"}`}
                        >
                          {item.icon}
                        </FuseSvgIcon>
                      </ListItemIcon></Tooltip>
                  </ListItemButton>
                </ListItem>
              ))
            }
          </List>
          {/* Modals for specific list items */}
          {/* <AttendeesListModal open={openListModal} handleClose={handleCloseListModal} /> */}
          {/* <AttendeesChatFullModal open={openChatModal} handleClose={handleCloseChatModal} /> */}

          {
            userRole !== "enduser" && checkIsAdmin ?
              <QaModal question={questions} checkSession={checkSession} expo={expo} setActiveIndex={setActiveIndex} open={openQAModal} handleClose={handleCloseQAModal} /> :
              <QaModalUser questionSub={questionsForUser} expo={expo} setActiveIndex={setActiveIndex} userId={userId} open={openQAModal} handleClose={handleCloseQAModal} />
          }

          <PollPopup setActiveIndex={setActiveIndex} expo={expo} socket={socket} open={openPollModal} handleClose={handleClosePollModal} />
          <UserMenuList userData={userData} anchorEl={anchorEl} open={isUserMenu} onClose={() => handleUserMenuClose()} inLobby={true} />
          <ExpoInfo startDate={expo?.expStartDate} endDate={expo?.expEndDate} open={showInfoModal} anchorEl={anchorEl} onClose={() => handleExpoInfoClose()} data={expo} />
        </nav>
      </Box>
    </Root>
  );
};

export default SubSideBar;
