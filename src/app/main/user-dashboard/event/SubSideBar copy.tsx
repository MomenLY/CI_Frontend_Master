import React, { useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { useNavigate } from "react-router";
import Modal from "./Modal";
import { generateChatToken } from "../api/generate-chat-token";
import LocalCache from "src/utils/localCache";
import AttendeesListModal from "./AttendeesListModal";
import PollPopup from "../../../shared-components/polls/PollPopup";
// import FestivalIcon from "@mui/icons-material/festival";

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

function SubSIdeBar(props) {
  const {onClick, onClickUsers,socket} = props;
  const navigate = useNavigate();
  const [openPollModal, setOpenPollModal] = useState(false);
  const handleClosePollModal = () => {
    setOpenPollModal(false);
  };
  return (
    <Root>
      <Box
        sx={{
          background: (theme) => theme.palette.primary.main,
          height: "100%",
          position: "fixed",
          width: "60px",
          zIndex: 2,
        }}
      >
        <nav aria-label="main mailbox folders">
          <List className="space-y-28 py-[45px]">
            {/* <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <FuseSvgIcon className="text-48" size={24} color="common.white">
                    material-outline:festival
                  </FuseSvgIcon>
                </ListItemIcon>
              </ListItemButton>
            </ListItem> */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => onClickUsers()}>
                <ListItemIcon>
                  <FuseSvgIcon className="text-48" size={24} color="common.white">
                    material-outline:group
                  </FuseSvgIcon>
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => onClick('modalChat')}>
                <FuseSvgIcon className="text-48" size={24} color="common.white">
                  material-outline:chat
                </FuseSvgIcon>
              </ListItemButton>
            </ListItem>
            {/* <ListItem disablePadding>
              <ListItemButton>
                <FuseSvgIcon className="text-48" size={24} color="common.white">
                  feather:help-circle
                </FuseSvgIcon>
              </ListItemButton>
            </ListItem> */}
          </List>
          <PollPopup socket={socket} open={openPollModal} handleClose={handleClosePollModal}/>
        </nav>
      </Box>

      
    </Root>
  );
}

export default SubSIdeBar;
