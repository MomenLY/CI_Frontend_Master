import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import LinearWithValue from "./LinearWithValue";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { useTranslation } from "react-i18next";
const pollSubmission = ({ socket, expo}) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [userID, setUserID] = useState("");
  const { t } = useTranslation('polls');
	const dispatch = useAppDispatch();
  useEffect(() => {
    getInitialDetails();
  }, []);

  const getInitialDetails = async () => {
    const userData = await LocalCache.getItem(
      cacheIndex.userData,
      getUserSession.bind(this)
    );
    setUserDetails(userData.data);
    setUserID(userData.uuid);
  };

  useEffect(() => {
    socket.emit("request_polls");
    socket.on("polls_updated", (updatedPolls) => {

      if (updatedPolls.length == 0) {
        handleClose()
        // dispatch(showMessage({ message: 'poll ends' }));
      }else if(expo?.expCode == updatedPolls[0].expoId){
        setOpen(true);
      }
     
      setPolls(updatedPolls); // Update state with new poll data
    });
    return () => {
      socket.off("polls_updated");
    };
  }, [socket]);

  const handleVote = (pollId, optionIndex) => {
    const currentVote = userVotes[pollId];
    if (currentVote !== undefined && currentVote !== optionIndex) {
      // If the user changes vote, handle it here if needed
    }

    // Emit vote to the server
    socket.emit("vote", {
      pollId: pollId,
      optionIndex: optionIndex,
      userId: userID,
      username: userDetails?.displayName,
      userImage: userDetails?.userImage,
    });

    // Update user's vote locally
    setUserVotes((prev) => ({ ...prev, [pollId]: optionIndex }));
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClose;
          }
        }}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", sm: "680px" },
            minHeight: "450px",
            maxHeight: { xs: "calc(100vh - 60px)", sm: "auto" },
            margin: { xs: "0", sm: "10px" },
            borderRadius: { xs: "0", sm: "12px" },
            top: { xs: "0", sm: "auto" },
            position: { xs: "absolute", sm: "relative" },
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: isMobile ? "transparent" : "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <DialogTitle>
          <div className="mb-0 pe-20">
            <Typography
              color="text.primary"
              className="font-semibold text-[20px] block mb-0 truncate"
            >
                 {t('poll_heading')}
            </Typography>
          </div>

          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <FuseSvgIcon className="text-48" size={28} color="action">
              feather:x
            </FuseSvgIcon>
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "32px 30px !important",
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          {polls.map((poll) => (
            <span key={poll.id}>
              <Typography
                color="text.primary"
                variant="body1"
                className="text-[14px] leading-[24px] md:text-[16px] md:leading-[28px] font-600 block mb-[15px] "
              >
                {poll.question}
              </Typography>
              <LinearWithValue
                polls={poll}
                handleVote={(optionIndex) => handleVote(poll.id, optionIndex)}
                userVote={userVotes[poll.id]}
              />
            </span>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default pollSubmission;
