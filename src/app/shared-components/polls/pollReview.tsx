import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    TextField,
    Box,
    List,
    ListItem,
    Avatar,
    Card,
    CardContent,
} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
interface PollPopupProps {
    socket: any;
    onClick: any;
    expo: any;
    setActiveIndex:any;
}
import { useTranslation } from "react-i18next";
import { getUsers } from "../../main/user-dashboard/api/users-details-api"
import { userImageUrl ,userImageUrlWithTenant} from 'src/utils/urlHelper';
const PollReview: React.FC<PollPopupProps> = ({ onClick, socket, expo ,setActiveIndex}) => {

    const [open, setOpen] = useState(false);
    const [polls, setPolls] = useState([]);
    const [userVotes, setUserVotes] = useState({}); // Track user's votes per poll
    const [users, setUsers] = React.useState([]);
    const { t } = useTranslation('polls');
    const getUsersDetails = async (id) => {
        const usersDetails = await getUsers(id);
        setUsers(usersDetails);

    }
    useEffect(() => {
        if (expo?.id) {
            getUsersDetails(expo.id);
        }
    }, [expo?.id]); // Add expo?.id as a dependency

    useEffect(() => {
        // Listener for updated polls
        socket.emit("request_polls");
        const handlePollsUpdate = (polls) => {
            
            setPolls(polls);
        };
        socket.on("polls_updated", handlePollsUpdate);
        // Cleanup socket listener on component unmount
        return () => {
            socket.off("polls_updated", handlePollsUpdate);
        };

    }, [socket]);


    const handleDeletePoll = () => {
        socket.emit("delete_all_polls");
        setPolls([]);
        onClick(true)
        setActiveIndex(0)
    };

    return (

        <>     {polls.map((poll) => (
            <span key={poll.id}>
                <DialogContent

                    sx={{
                        padding: "32px 30px !important",
                        maxHeight: "calc(100vh - 220px)",
                        minHeight: "calc(100vh - 220px)",
                        backgroundColor: (theme) => theme.palette.background.default,
                    }}
                >
                    <div className="mb-[10px] w-full ">
                        <Typography
                            color="primary"
                            variant="h3"
                            className="text-[16px] leading-[18px] font-600 block mb-[20px]"
                        >
                            {t('poll_question_label')}
                        </Typography>
                        <Typography
                            color="text.primary"
                            className="text-[14px] leading-[24px] md:text-[16px] md:leading-[28px] font-600 block mb-[15px]"
                        >
                            {poll.question}
                        </Typography>

                        <Typography
                            color="text.primary"
                            variant="body2"
                            className="text-[14px] leading-[24px] md:text-[16px] md:leading-[28px] font-400 block mb-[0px]"
                        >
                            {users?.length} of {poll?.userVotes?.length > 0 ? poll?.userVotes?.length : 0} {t('poll_voting_label')}
                        </Typography>
                        {poll.options.map((option, index) => (
                            <Card key={index}
                                sx={{
                                    // minWidth: 200
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: 0,
                                    margin: "20px 0",
                                    boxShadow: "none",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1,
                                        padding: "18px",
                                        borderRadius: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: (theme) => theme.palette.background.paper,
                                        boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2)",
                                    }}
                                >

                                    <FormControlLabel
                                        value={option.label}
                                        control={<Radio checked={true} />}
                                        label={`${option.label}`}
                                    />
                                    <Button
                                        className="mb-0 rounded-[6px] font-medium capitalize py-0 px-2 min-h-[24px] h-[inherit] text-[12px] whitespace-nowrap"
                                        variant="contained"
                                        sx={{
                                            color: "#000",
                                            backgroundColor: "#D9D9D9",
                                            "&:hover": {
                                                backgroundColor: "#D9D9D9",
                                            },
                                        }}
                                    >
                                        {option.votes}  {t('poll_votes_label')}
                                    </Button>
                                </Box>
                                {poll?.userVotes?.length > 0 &&
                                    poll?.userVotes
                                        .filter((userVote) => userVote.optionIndex === index) // Filter for users who voted for this option
                                        .map((user, index) => (
                                            <CardContent key={index}
                                                sx={{ overflowY: "auto", flex: 1, padding: "0 !important", maxHeight: "200px" }}
                                            >
                                                <Box className="p-20">

                                                    <div key={index} className="flex items-center py-10">
                                                        <Avatar
                                                            sx={{
                                                                background: (theme) => theme.palette.background.default,
                                                                color: (theme) => theme.palette.text.secondary,
                                                                width: "28px",
                                                                height: "28px",
                                                                marginRight: "10px",
                                                            }}
                                                            alt={user.username}
                                                            src={userImageUrl(user.userImage)}
                                                        />
                                                        <Typography
                                                            component="span"
                                                            className="font-normal text-[14px] block mb-0 truncate whitespace-nowrap"
                                                        >
                                                            {user.username}
                                                        </Typography>
                                                    </div>
                                                </Box>
                                            </CardContent>))}
                            </Card>

                        ))}

                    </div>
                </DialogContent>

            </span>
        ))}
            <DialogActions
                sx={{
                    padding: "20px !important",
                    boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2)",
                }}
            >

                <Button
                    onClick={() => handleDeletePoll()}
                    className="min-w-[100px] min-h-[42px] font-600 text-[14px] rounded-lg capitalize"
                    variant="contained"
                    color="error"
                >
                      {t('poll_stop_btn')}
                </Button>
            </DialogActions>
        </>

    );
};
export default PollReview;
