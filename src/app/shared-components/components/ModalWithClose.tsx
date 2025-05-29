import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ImageUpload from "./ImageUpload";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
// import CloseIcon from '@mui/icons-material/Close';
import { Box } from "@mui/material";

const ModalWithClose = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "456px", // Customize the width here
          },
        }}
      >
        <DialogTitle>
          {/* Modal Title */}

          <div className="mb-0 pe-20">
            <Typography
              color="text.primary"
              variant=""
              className="font-semibold text-[18px] block mb-8 truncate"
            >
              Add Speaker
            </Typography>
            <Typography
              color="text.disabled"
              variant=""
              className="font-regular text-[11px] block mb-0 truncate"
            >
             Please have a quick look below
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
            {/* <CloseIcon /> */}
            <FuseSvgIcon className="text-48" size={24} color="action">
              feather:x
            </FuseSvgIcon>
          </IconButton>
        </DialogTitle>
        {/* <DialogContent dividers> */}
        <DialogContent
          sx={{
            padding: "15px 30px !important",
          }}
        >
          {/* <div className="mb-20">
            <Typography
              color="text.primary"
              variant=""
              className="font-semibold text-[18px] block mb-8"
            >
              Add Speaker
            </Typography>
            <Typography
              color="text.disabled"
              variant=""
              className="font-regular text-[11px] block mb-8"
            >
              Add Speaker
            </Typography>
          </div> */}

          <ImageUpload />

          <div className="mt-24 mb-0 w-full ">
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                className="w-full"
                id="outlined-basic"
                label="Name"
                variant="outlined"
              />
             <TextField
                className="w-full"
                id="outlined-basic"
                label="Email"
                variant="outlined"
              />
            </Box>
          </div>
     
     
        </DialogContent>

        <DialogActions
          sx={{
            padding: "20px !important",
          }}
        >
          <Button
            className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
            variant="outlined"
            color="primary"
            onClick={handleClose}
            sx={{
              borderColor: "primary.main",
              border: "1px solid",
              "&:hover": {
                border: "1px solid",
                borderColor: "primary.main",
                backgroundColor: "primary.main",
                color: "background.paper",
              },
            }}
          >
            CANCEL
          </Button>

          <Button
            className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
            variant="contained"
            color="primary"
            sx={{
              // borderWidth: 2,
              border: "1px solid",
              borderColor: "primary.main",
              backgroundColor: "primary.main",
              color: "background.paper",
              "&:hover": {
                border: "1px solid",
                borderColor: "primary.main",
                backgroundColor: "primary.main",
                color: "background.paper",
                opacity: "0.8",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModalWithClose;
