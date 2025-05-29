import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { CheckUser } from './apis/checkUser';
import { Box, Button, Typography } from '@mui/material';
import Error500Page from '../404/Error500Page';
import FuseLoading from '@fuse/core/FuseLoading';

function UserRegSuccess() {
    const routeParams = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        checkUserValid();
    }, []);

    const checkUserValid = async () => {
        try {
            const isUserValid = await CheckUser(routeParams.token);
            if (isUserValid.error === true) {
                setHasError(true);
            }
        } catch (error) {
            console.error('An error occurred while validating the user:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const navigatetoSign = () => {
        navigate('/sign-in');
    };

    if (isLoading) {
        return <FuseLoading />;
    }

    if (hasError) {
        return <Error500Page label='Issue in Validating Email' />;
    }

    const successImage = import.meta.env.VITE_VERIFY_EMAIL_IMAGE
    return (
        <Box
            className="min-h-screen min-w-screen relative"
            sx={{
                backgroundColor: "#F1F5F9",
            }}
        >
            <div className="flex items-center justify-center flex-col h-full max-w-[630px] mx-auto ">
                <div className="px-[15px] py-[50px] flex items-center justify-center flex-col">
                    <div className="mb-[20px]">
                        <img
                            src={successImage}
                            alt="beach"
                            style={{
                                maxWidth: "300px",
                                width: "100%",
                                // maxHeight: "400px",
                                // Height: "100%",
                            }}
                            className="rounded-6"
                        />
                    </div>
                    <Typography
                        className="text-[20px] leading-[30px] md:text-[26px] md:leading-[34px] font-semibold mb-[20px] text-center"
                        color="primary.main"
                    >
                        Your e-mail has been <br /> successfully verified
                    </Typography>

                    <Typography
                        className="text-[12px] :leading-[20px] md:text-[14px] md:leading-[22px] font-normal mb-[20px] text-center"
                        color="text.secondary"
                    >
                        You can login by clicking the button below.
                    </Typography>
                    <Button
                        className=" rounded-[10px] font-normal capitalize text-[12px] :leading-[12px] md:text-[13px] md:leading-[13px] leading-[14px] min-w-[131px] min-h-[41px]"
                        variant="contained"
                        color="primary" onClick={navigatetoSign}
                    >
                        <span className=" ">SIGN IN</span>
                    </Button>
                </div>
            </div>
        </Box>
    )
}

export default UserRegSuccess