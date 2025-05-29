import FusePageSimple from "@fuse/core/FusePageSimple";
import { blue, green } from "@mui/material/colors";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import exampleSearchResponse from './exampleSearchResponse';
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";
import { GetSingleExpo } from "../api/get-single-expo";
import { useNavigate } from "react-router";

/**
 * The classic search page.
 */
function ExpoSearchBox() {
  const navigate = useNavigate();
  const { t } = useTranslation('general');
  const [searchText, setSearchText] = useState(""); // State to store input value
  const [isErrorText, setIsErrorText] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);


  const handleInputChange = (event) => {
    setSearchText(event.target.value); // Update state when input changes
    if (event.target.value.trim() === "") {
      setIsErrorText(false);
    }
    setIsButtonDisabled(event.target.value.trim() === '');
  };

  const handleButtonClick = async () => {
    const trimmedSearchText = searchText.trim();

    if (!trimmedSearchText) {
      setIsErrorText(true); // Handle empty input gracefully
      return;
    }
    const expo = await GetSingleExpo(trimmedSearchText)
    if (expo?.expo?.id === undefined) {
      setIsErrorText(true);
    }
    else {
      setIsErrorText(false);
      navigate('/tenant-' + expo.expo.expTenantId + '/events/' + expo.expo.expCode);
    }
  };

  
  const container = {
    show: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <>
      <div className="flex w-full h-[52px] sm:h-[54px] items-center me-0 p-2 border-0 mt-0 relative z-10">
        <Paper
          className="flex h-[52px] sm:h-[54px] w-full items-center rounded-[70px] ps-16 pe-16 sm:pe-0  shadow-[0_0px_6px_0px_rgba(0,0,0,0.20)] flex-col sm:flex-row"
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          <div className="flex-1 flex items-center w-full mt-[8px] sm:mt-0">
            <FuseSvgIcon color="action" className="me-8">
              heroicons-outline:search
            </FuseSvgIcon>
            <Input
              placeholder={t('search_text')}
              disableUnderline
              fullWidth
              inputProps={{
                "aria-label": "Search",
              }}
              value={searchText} // Bind state to input value
              onChange={handleInputChange}
            />
          </div>
          <Button
            className="ms-10 me-2 rounded-[10px] sm:rounded-[30px] min-w-[153px] sm:min-w-[129px] min-h-[45px] sm:min-h-[50px] font-medium uppercase mt-[32px] sm:mt-0 text-[14px] "
            variant="contained"
            color="primary"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
          >
            {t('search_join_expo')}
          </Button>
        </Paper>
      </div>
      {isErrorText && (
        <div className=" mt-[100px] sm:mt-[50px]">
          <Typography
            color="primary.main"
            className="font-semibold italic text-center text-[14px] leading-[24px] sm:text-[20px] sm:leading-[30px] block"
          >
            {t('search_not_found_text')}
          </Typography>
        </div>
      )}
    </>
  );
}

export default ExpoSearchBox;
