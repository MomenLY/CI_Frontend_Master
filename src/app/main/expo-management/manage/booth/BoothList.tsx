import React, { useRef, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Grid from "@mui/material/Grid";
import BoothForm from "./forms/BoothForm";
import WarningMessage from "./WarningMessge";

const CustomTab = styled(Tab)(({ theme }) => ({
  "&.MuiTab-root": {
    color: theme.palette.text.primary,
    opacity: "0.4",
  },
  "&.Mui-selected": {
    color: theme.palette.text.primary,
    opacity: "1",
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BoothList({ json, expoDetails }) {
  const [value, setValue] = useState(0);          // Current tab value
  const [openWarning, setOpenWarning] = useState(false); // State to control warning dialog
  const [pendingTab, setPendingTab] = useState(null);    // State to store the tab user wants to switch to
  const boothRefs = useRef([]);

  const handleChange = async (event, newValue) => {
    if (newValue !== value) {
       // Call the function in the current BoothForm
       let response = false;
    if (boothRefs.current[value] && boothRefs.current[value].handleWarningMessageShowing) {
      response = await boothRefs.current[value].handleWarningMessageShowing();
    }
      // Check the condition in the current BoothForm before switching
      if (response) {
        setValue(newValue);  // Condition met, switch tabs
      } else {
        setPendingTab(newValue);  // Condition not met, show warning
        setOpenWarning(true);
      }
    }
  };

  const handleProceed = () => {
    setValue(pendingTab); // Switch to the new tab
    setOpenWarning(false); // Close the dialog
    setPendingTab(null);   // Clear pending tab
  };

  const handleCancel = () => {
    setOpenWarning(false); // Close the dialog without switching tabs
    setPendingTab(null);   // Clear pending tab
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ maxWidth: "100vw" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="scrollable auto tabs example"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-scrollButtons": {
              display: "flex !important",
            },
          }}
        >
          {
            json?.booth?.map((booth, index) => (
              <CustomTab 
                key={index}
                label={booth[`booth_${index + 1}`]?.componentName}
                {...a11yProps(index)} 
              />
            ))
          }
        </Tabs>
      </Box>
      {
        json && (json?.booth?.map((booth, index) => (
          <CustomTabPanel key={index} value={value} index={index}>
            <BoothForm ref={el => boothRefs.current[index] = el} setOpenWarning={setOpenWarning} key={index} indexNumber={index} expoDetails={expoDetails} boothDetails={booth[`booth_${index + 1}`]} />
          </CustomTabPanel>
        )))
      }
      
      {/* WarningMessage Dialog */}
      <WarningMessage 
        open={openWarning} 
        handleClose={handleCancel} 
        onProceed={handleProceed}  // Pass the proceed action
      />
    </Box>
  );
}
