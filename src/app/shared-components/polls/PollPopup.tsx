import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import LinearWithValueLabel from "../../main/user-dashboard/event/LinearWithValueLabel";
import LinearWithValue from "./LinearWithValue";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import PollReview from "./pollReview";

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';



interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  expoId: any;
  subId: any
}

interface PollPopupProps {
  socket: any; // You may want to replace 'any' with the proper type from socket.io-client if using that library
}

const PollPopup = ({ open, handleClose, socket, expo, setActiveIndex }) => {
  // const [open, setOpen] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [launchPoll, setLaunchPoll] = useState(false)
  const [deletePollStatus, setDeletePollStatus] = useState(false)
  const { t } = useTranslation('polls');
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const schema = z.object({
    question: z.string().nonempty(t("poll_question_message")),
    options: z
      .array(z.string().nonempty(t("poll_option_message")))
      .min(2, t("poll_check_options")), // Ensures there are at least two non-empty options
  });
  const { control, formState: { errors }, handleSubmit, reset, setValue, getValues } = useForm({
    mode: 'onSubmit', // Validation is triggered only when the form is submitted
    resolver: zodResolver(schema),
    defaultValues: {
      question: '',
      options: ["", ""],
    }
  });
  useEffect(() => {
    socket.emit("request_polls");
    socket.on("polls_updated", (polls: Poll[]) => {
      setPolls(polls);
    });
  }, [socket]);

  // const handleCreatePoll = () => {
  //   const validOptions = options.filter(option => option.trim() !== ""); // Filter out empty options
  //   if (validOptions.length < 2) {
  //     alert("Please provide at least two options.");
  //     return;
  //   }

  //   const poll: Poll = {
  //     id: Date.now(),
  //     question,
  //     options: validOptions.map((option) => ({ label: option, votes: 0 })),
  //   };
  //   socket.emit("create_poll", poll);
  //   setLaunchPoll(true)
  //   setQuestion("");
  //   setOptions(["", ""]); // Reset options to two empty fields

  // };
  const onSubmit = (data: any) => {
    const queryParams = new URLSearchParams(location.search);
    const schedule = queryParams.get("schedule");
    const poll: Poll = {
      id: Date.now(),
      expoId: expo?.expCode,
      question: data.question,
      subId: schedule,
      options: data.options.map((option: string) => ({ label: option, votes: 0 })),
    };
    socket.emit("create_poll", poll);
    setLaunchPoll(true);
    reset(); // Reset form after submission
  };
  const handleDeletePoll = (pollId: number) => {
    socket.emit("delete_poll", pollId);
  };

  const handleOptionChange = (index: number, value: string, options: string[], onChange: (value: string[]) => void) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions); // This triggers the validation
  }

  const addOption = (options: string[]) => {
    if (options.length < 10) { // Check if the number of options is less than 10
      setValue('options', [...options, ""]); // Add a new empty option
    }
  };

  const deleteOption = (index: number) => {
    // Get the latest options from the state
    const currentOptions = getValues('options');

    if (currentOptions.length > 2) {
      // Filter out the option at the specified index
      const newOptions = currentOptions.filter((_, idx) => {
        const result = idx !== index; // This is the condition you are checking
        return result;
      });
      setValue('options', newOptions); // Update the options array in the state
    } else {
      alert('You must have at least two options.');
    }
  };




  const handleOpenModalChat = async (modal) => {
    if (modal == true) {
      socket.on("polls_updated", (polls: Poll[]) => {

        setPolls(polls);
      });
      setLaunchPoll(false)
      handleClose()
      reset()
    }
  };
  return (

    <div>
      <>
        {/* {
          polls.length > 0 && */}

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
              maxHeight: { xs: "calc(100vh - 40px)", sm: "auto" },
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
                // variant=""
                className="font-semibold text-[20px] block mb-0 truncate"
              >
                {t('poll_heading')}
              </Typography>
            </div>

            <IconButton
              aria-label="close"
              onClick={() => { handleClose(), setActiveIndex(0), reset(), setLaunchPoll(false) }}
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
          {polls.length == 0 ?

            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent
                sx={{
                  padding: "32px 30px !important",
                  backgroundColor: (theme) => theme.palette.background.default,
                  maxHeight: "calc(100vh - 200px)",
                  minHeight: "calc(100vh - 200px)",
                }}
              >
                <div className="mb-[10px] w-full ">
                  <Typography
                    color="primary"
                    variant="h3"
                    className="text-[16px] leading-[12px] font-600 block mb-[10px] "
                  >
                    {t('poll_question_label')}
                  </Typography>
                  <Box component="form" noValidate autoComplete="off">
                    <div className="w-full mb-10">

                      <Controller
                        name="question"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderWidth: "2px",
                              },
                            }}
                            {...field}
                            label={t("poll_question_placeholder")}
                            variant="standard"
                            fullWidth
                            error={!!errors.question}
                            helperText={errors.question?.message}
                          />
                        )}
                      />

                    </div>

                    <div className="mb-20">
                      {polls.length === 0 && (
                        // Inside the render function of options Controller
                        <Controller
                          name="options"
                          control={control}
                          render={({ field: { value: options, onChange } }) => (
                            <>
                              {options.map((option, index) => (
                                <div className="flex items-end gap-20" key={index}>
                                  <Typography
                                    color="common.black"
                                    variant="h3"
                                    className="text-[18px] leading-[22px] font-400 block mb-[0]"
                                  >
                                    {String.fromCharCode(65 + index)}.
                                  </Typography>
                                  <TextField
                                    onChange={(e) => handleOptionChange(index, e.target.value, options, onChange)}
                                    id={`option-${index}`}
                                    label={`${t('poll_option_label')} ${String.fromCharCode(65 + index)}`}

                                    variant="standard"
                                    fullWidth
                                    sx={{
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: "2px",
                                      },
                                      "& .MuiInputLabel-root": {
                                        lineHeight: "40px",
                                      },
                                    }}
                                    error={!!errors.options?.[index]}
                                    helperText={errors.options?.[index]?.message}
                                  />

                                  {options.length > 2 && (
                                    <IconButton onClick={() => deleteOption(index)}>
                                      <FuseSvgIcon size={20}>feather:trash</FuseSvgIcon>
                                    </IconButton>
                                  )}
                                </div>
                              ))}


                              <div className="mt-20 text-right">
                                <Button
                                  className="m-0 rounded-[10px] font-medium uppercase "
                                  variant="contained"
                                  color="primary"
                                  disabled={options.length >= 10}
                                  onClick={() => addOption(options)}>

                                  <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                                  <span className="sm:flex mx-4">{t('poll_option_btn')}</span>
                                </Button>
                              </div>
                            </>
                          )}
                        />
                      )}
                    </div>
                  </Box>
                </div>
              </DialogContent>


              <DialogActions
                sx={{
                  padding: "20px !important",
                  boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2)",
                }}
              >
                <Button
                  className="min-w-[100px] min-h-[42px] font-600 text-[14px] rounded-lg capitalize"
                  variant="outlined"
                  color="primary"
                  onClick={() => { handleClose(), setActiveIndex(0), reset(), setLaunchPoll(false) }}
                  sx={{
                    border: "none",
                    "&:hover": {
                      border: "none",
                    },
                  }}
                >
                  {t('poll_cancel')}
                </Button>

                <Button
                  type="submit"
                  className="min-w-[150px] min-h-[42px] font-600 text-[14px] rounded-lg capitalize"
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderColor: "primary.main",
                    border: "2px solid",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "primary.main",
                      color: "background.paper",
                    },
                  }}
                >
                  {t('poll_launch_btn')}
                </Button>


              </DialogActions>
            </form> :
            <PollReview expo={expo}
              setActiveIndex={setActiveIndex}
              onClick={(modal) => handleOpenModalChat(modal)}
              socket={socket} />}

        </Dialog>
        {/* } */}
      </>

    </div>
  );
};

export default PollPopup;