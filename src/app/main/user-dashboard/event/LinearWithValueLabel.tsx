import React from "react";
import ReactDOM from "react-dom";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiLinearProgress-bar": {
      backgroundColor: theme.palette.primary.main,
      borderRadius: "6px",
    },
  },
}));

function LinearProgressWithLabel({ value }) {
  const classes = useStyles(); // Use the styles in the component

  return (
    <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
      <Box sx={{ width: "100%", mr: 0 }}>
        <LinearProgress
          className={classes.root} // Apply the styles here
          sx={{ height: "50px", borderRadius: "6px" }}
          variant="determinate"
          value={value}
        />
      </Box>
      <Box sx={{ minWidth: 35, position: "absolute", right: "15px" }}>
        <Typography
          variant="subtitle1"
          className="fw-500 "
          color="background.paper"
        >{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function LinearWithValueLabel() {
  const [progress, setProgress] = React.useState(0);

  return (
    <>
      <Box sx={{ width: "100%", position: "relative" }}>
        <FormControl className="w-full">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            className=""
          >
            <div className=" relative w-full mb-10">
              <LinearProgressWithLabel value={80} />
              <FormControlLabel
                className="absolute top-0 left-4 ps-10 bottom-0 my-auto"
                value="disabled"
                disabled
                control={
                  <Radio
                    sx={{
                      color: "background.paper",
                      "&.Mui-checked": {
                        color: "background.paper",
                      },
                      "&.Mui-disabled": {
                        color: "background.paper",
                      },
                    }}
                  />
                }
                label="A. Delmen"
                sx={{
                  color: "red",
                  "& .MuiTypography-root": {
                    fontSize: "18px",
                    lineHeight: "18px",
                    fontWeight: "400",
                    "&.Mui-disabled": {
                      color: "background.paper",
                    },
                  },
                }}
              />
            </div>

            <div className=" relative w-full mb-10">
              <LinearProgressWithLabel value={50} />

              <FormControlLabel
                className="absolute top-0 left-4 ps-10 bottom-0 my-auto"
                value="disabled"
                disabled
                control={
                  <Radio
                    sx={{
                      color: "background.paper",
                      "&.Mui-checked": {
                        color: "background.paper",
                      },
                      "&.Mui-disabled": {
                        color: "background.paper",
                      },
                    }}
                  />
                }
                label="B. Mauris"
                sx={{
                    color: "red",
                    "& .MuiTypography-root": {
                      fontSize: "18px",
                      lineHeight: "18px",
                      fontWeight: "400",
                      "&.Mui-disabled": {
                        color: "background.paper",
                      },
                    },
                  }}
              />
            </div>
          </RadioGroup>
        </FormControl>
      </Box>
    </>
  );
}

export default LinearWithValueLabel;
