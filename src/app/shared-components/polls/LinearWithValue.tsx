import React, { useState, useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiLinearProgress-bar": {
      backgroundColor: "primary.main",
      borderRadius: "6px",
    },
  },
  disabledOption: {
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "not-allowed",
  },
  option: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
}));

function LinearProgressWithLabel({ value }) {
  const classes = useStyles();

  return (
    <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
      <Box sx={{ width: "100%", mr: 0, paddingLeft: "30px" }}>
        <LinearProgress
          className={classes.root}
          sx={{ height: "8px", borderRadius: "6px" }}
          variant="determinate"
          value={value}
        />
      </Box>
    </Box>
  );
}

function LinearWithValueLabel({ polls, handleVote, userVote }) {
  const { t } = useTranslation('polls');
  const [poll, setPolls] = useState([]);
  const totalVotes = polls.options.reduce((sum, option) => sum + option.votes, 0);
  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <FormControl className="w-full">
        <RadioGroup
          aria-labelledby="poll-radio-group"
          value={userVote !== undefined ? userVote : ""}
          name="radio-buttons-group"
        >
          {polls.options.map((option, index) => (
            <div key={index} className=" relative w-full mb-20">
              <FormControlLabel
                disabled={userVote === index} // Disable only the voted option
                style={{
                  // backgroundColor: userVote === index ? "#007bff" : "",
                  // color: userVote === index ? "#fff" : "",
                  cursor: userVote === index ? "auto" : "pointer", // Show not-allowed cursor for voted option
                }}
                onClick={() => {
                  if (userVote !== index) {
                    handleVote(index)
                  }
                }

                }
                value={index}
                control={<Radio />}
                label={` ${option.label}`}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "16px",
                    lineHeight: "16px",
                    fontWeight: "400",
                    maxWidth: "90%",
                    marginBottom: "10px",
                  },
                }}
              />
              <Box sx={{ position: "absolute", right: "0", bottom: "8px" }}>
                <Typography variant="subtitle1" color="text.primary">
                  {option.votes}  {t('poll_votes_label')}
                </Typography>
              </Box>
              <div className="mt-[-8px]">
                <LinearProgressWithLabel value={(option.votes / totalVotes) * 100 || 0} />
              </div>
            </div>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
}


export default LinearWithValueLabel;
