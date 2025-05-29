import React from "react";
import Avatar from "@mui/material/Avatar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import UserItem from "./UserItem";


const AttendeesListModal = (props) => {
  const [fillColor, setFillColor] = React.useState("#D8DBDE");

  const changeColor = () => {
    setFillColor(fillColor === "#D8DBDE" ? "#f7ca69" : "#D8DBDE");
  };

  const users = [
    {
      name: "Nithin",
      imageSrc: "http://localhost:3000/assets/images/avatars/brian-hughes.jpg",
    },
    {
      name: "Nithin",
      imageSrc: "http://localhost:3000/assets/images/avatars/brian-hughes.jpg",
    }
  ];

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        disableBackdropClick
        disableEscapeKeyDown
        BackdropProps={{ style: { display: "none" } }}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100vh",
            position: "absolute",
            left: { xs: "inherit", sm: "80px" },
            maxWidth: { xs: "100%", sm: "330px" },
            top: { xs: 0, sm: "auto" },
            margin: 0,
            borderRadius: { xs: "0", sm: "12px" },
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: "16px !important",
            // backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <div className="mb-0 pe-20">
            <Typography
              color="text.primary"
              variant=""
              className="font-semibold text-[16px] block mb-0 truncate"
            >
              Attendees
            </Typography>
          </div>

          <IconButton
            aria-label="close"
            //onClick={handleClose}
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
            padding: "16px !important",
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <div className="space-y-20">
            {users.map((user, index) => (
              <UserItem key={index} name={user.name} imageSrc={user.imageSrc} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendeesListModal;
