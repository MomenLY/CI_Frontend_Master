import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

const WarningMessage = ({ open, handleClose, onProceed }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "620px",
          maxWidth: "620px",
          borderRadius: "10px",
          //   minHeight: "450px",
          margin: "10px",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: { xs: "15px 15px !important", md: "25px 30px !important" },
          //   backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <div className="flex-1 flex items-center">
          <span className="me-10 flex">
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.1 13.5H9.9V8.1H8.1V13.5ZM9 6.3C9.255 6.3 9.46875 6.21375 9.64125 6.04125C9.81375 5.86875 9.9 5.655 9.9 5.4C9.9 5.145 9.81375 4.93125 9.64125 4.75875C9.46875 4.58625 9.255 4.5 9 4.5C8.745 4.5 8.53125 4.58625 8.35875 4.75875C8.18625 4.93125 8.1 5.145 8.1 5.4C8.1 5.655 8.18625 5.86875 8.35875 6.04125C8.53125 6.21375 8.745 6.3 9 6.3ZM9 18C7.755 18 6.585 17.7638 5.49 17.2913C4.395 16.8188 3.4425 16.1775 2.6325 15.3675C1.8225 14.5575 1.18125 13.605 0.70875 12.51C0.23625 11.415 0 10.245 0 9C0 7.755 0.23625 6.585 0.70875 5.49C1.18125 4.395 1.8225 3.4425 2.6325 2.6325C3.4425 1.8225 4.395 1.18125 5.49 0.70875C6.585 0.23625 7.755 0 9 0C10.245 0 11.415 0.23625 12.51 0.70875C13.605 1.18125 14.5575 1.8225 15.3675 2.6325C16.1775 3.4425 16.8188 4.395 17.2913 5.49C17.7638 6.585 18 7.755 18 9C18 10.245 17.7638 11.415 17.2913 12.51C16.8188 13.605 16.1775 14.5575 15.3675 15.3675C14.5575 16.1775 13.605 16.8188 12.51 17.2913C11.415 17.7638 10.245 18 9 18ZM9 16.2C11.01 16.2 12.7125 15.5025 14.1075 14.1075C15.5025 12.7125 16.2 11.01 16.2 9C16.2 6.99 15.5025 5.2875 14.1075 3.8925C12.7125 2.4975 11.01 1.8 9 1.8C6.99 1.8 5.2875 2.4975 3.8925 3.8925C2.4975 5.2875 1.8 6.99 1.8 9C1.8 11.01 2.4975 12.7125 3.8925 14.1075C5.2875 15.5025 6.99 16.2 9 16.2Z"
                fill="#FB5050"
              />
            </svg>
          </span>
          <Typography
            color="error"
            className="font-semibold text-[18px] leading-[20px] block mb-0 truncate"
          >
            Warning Message
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
          padding: { xs: "10px 15px !important", md: "10px 30px !important" },
          //   backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          className="font-normal text-[13px] leading-[28px] block"
        >
          Please note that all required fields must be filled to save your data.
          If you proceed without completing them, any data on this tab will be
          discarded.
        </Typography>
        <ul className="ps-20" style={{ listStyleType: 'disc', color: 'rgba(122, 122, 122, 1)' }}>
          <li>
            <Typography
              variant="caption"
              color="text.disabled"
              className="font-normal text-[13px] leading-[28px] block"
            >
              Click{" "}
              <a className="font-bold !no-underline !text-[#6f43d6]" href="">
                Proceed
              </a>{" "}
              to discard the data on this tab.
            </Typography>
          </li>
          <li>
            <Typography
              variant="caption"
              color="text.disabled"
              className="font-normal text-[13px] leading-[28px] block"
            >
              Click{" "}
              <a className="font-bold !no-underline !text-[#6f43d6]" href="">
              Cancel
              </a>{" "}
              to stay on this tab and complete all required fields."
            </Typography>
          </li>
        </ul>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "20px !important",
          //   boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex gap-16 justify-end">
          <Button
            className="min-w-[92px] min-h-[41px] font-medium rounded-lg uppercase"
            variant="outlined"
            color="primary"
            onClick={handleClose}
            //   onClick={handleOpen}
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
            className="min-w-[68px] min-h-[41px] font-medium rounded-lg uppercase"
            variant="contained"
            color="primary"
            onClick={onProceed}
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
            PROCEED
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default WarningMessage;
