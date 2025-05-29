import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
const AddLink = ({ open, handleClose, linkValue, setLinkValue, handleSave }) => {
  const [error, setError] = useState(false);
  const { t } = useTranslation('billboard');
  // Validate if the entered link is a valid URL
  const validateLink = (link) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol (optional)
      "((([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,})" + // domain name (e.g., example.com)
      "|(\\[[0-9a-fA-F:.]+\\]))" + // or IP address
      "(\\:[0-9]{1,5})?" + // port (optional)
      "(\\/[-a-zA-Z0-9()@:%_+.~#?&//=]*)?" + // path (optional)
      "(\\?[;&a-zA-Z0-9()@:%_+.~#?&//=]*)?" + // query string (optional)
      "(#[-a-zA-Z0-9()@:%_+.~#?&//=]*)?$", // fragment (optional)
      "i"
    );
    
    return urlPattern.test(link);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLinkValue(value);

    if (!value || !validateLink(value)) {
      setError(true);
    } else {
      setError(false);
    }
  };
  useEffect(() => {
    if (linkValue) {
      setError(!validateLink(linkValue));
    } else {
      setError(false); // No error if the input is empty
    }
  }, [linkValue]);
  
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
            width: "620px",
            padding: "24px 32px",
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: "0 !important",
          }}
        >
          <div className="mb-0 pe-20">
            <Typography
              color="text.primary"
              className="font-semibold text-[16px] block mb-0 truncate"
            >
               {t('billboard_table_head_link_text')}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              className="font-normal text-[11px] block"
            >
               {t('billboard_add_link_header')}
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
            <FuseSvgIcon className="text-48" size={24} color="action">
              feather:x
            </FuseSvgIcon>
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "30px 0 !important",
          }}
        >
          <div className="space-y-20">
            <Box
              component="form"
              sx={{
                "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                value={linkValue}
                onChange={handleInputChange}
                label=  {t('billboard_add_link_footer')}
                variant="outlined"
                fullWidth
                error={error}
                helperText={error ? t('billborad_validation_mge'): ""}
                
              />
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className="min-w-[68px] min-h-[41px] font-medium rounded-lg uppercase"
            variant="contained"
            color="primary"
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              backgroundColor: "primary.main",
              color: "background.paper",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.main",
                color: "background.paper",
                opacity: "0.8",
              },
            }}
            onClick={handleSave}
            disabled={!linkValue || error}
          >
         {t('billboard_save_btn')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddLink;
