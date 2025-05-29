import { Button, Card, Typography } from '@mui/material';
import { useAuth } from 'src/app/auth/AuthRouteProvider';

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { styled } from "@mui/material/styles";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from 'react';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';

type AuthSuccessType = {
    roles: any;
    onRoleClick: (role: any) => void;
}
const CustomRadioGroup = styled(RadioGroup)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "100%",
}));
const CustomFormControlLabel = styled(FormControlLabel)(
    ({ theme, checked }) => ({
        borderColor: checked ? theme.palette.text.disabled : theme.palette.text.disabled,
        border: "2px solid",
        borderRadius: "4px",
        margin: 0,
        minHeight: "50px",
        color: checked ? theme.palette.primary.main : theme.palette.text.disabled,
        paddingLeft: "10px",
        "& .MuiRadio-root": {
            color: checked ? theme.palette.primary.main : theme.palette.text.disabled,
            marginRight: "15px",
        },
        "& .MuiTypography-root": {
            fontSize: "14px",
            fontWeight: "600",
        },
    })
);

function AuthSuccesTab({ roles, onRoleClick }: AuthSuccessType) {
    const { signOut } = useAuth();
    const [selectedRole, setSelectedRole] = useState('');
    const { t } = useTranslation();


    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    const roleChangeConfirm = () => {
        if (selectedRole) {
            onRoleClick(roles[selectedRole])
        }
    }
    return (
        <>
            {/* <div className="mb-[20px]">
                <img
                    className="w-48"
                    src="assets/images/logo/logo.svg"
                    alt="Logo" />
            </div> */}

            <div className="mb-[25px] md:mb-[36px]">
                <Typography
                    color="text.primary"
                    component="h2"
                    className="text-3xl md:text-4xl font-[700]  leading-[40px] md:leading-[50px] "
                >
                    {t('AuthSuccess_selectYourRole')}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.disabled"
                    className="font-normal  block"
                >
                    {t('AuthSuccess_selectYourRoleHelperText')}
                </Typography>
            </div>
            <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320 h-full">
                <div className='flex h-full flex-col'>

                    <FormControl className="w-full ">
                        <CustomRadioGroup
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className='space-y-24 md:space-y-32'
                        >
                            {Object.keys(roles).length > 0 &&
                                Object.entries(roles).map(([roleKey, role]: [string, any]) => (
                                    <CustomFormControlLabel
                                        key={"role_id_" + roleKey}
                                        value={roleKey}
                                        control={<Radio />}
                                        label={role.name}
                                        checked={selectedRole === roleKey}
                                    />
                                ))
                            }
                        </CustomRadioGroup>
                    </FormControl>

                    <Box
                        className="p-[15px] md:p-[24px] text-right flex item-center justify-between"
                        sx={{
                            backgroundColor: "background.paper",
                        }}
                    >
                        <Button
                            className="min-w-[132px] min-h-[42px]"
                            variant="outlined"
                            color="error"
                            onClick={() => signOut()}
                        >
                            {t('signOut')}
                        </Button>
                        <Button
                            className="min-w-[132px] min-h-[42px]"
                            variant="contained"
                            color="primary"
                            disabled={selectedRole === ""}
                            onClick={() => roleChangeConfirm()}
                        >
                            {t('proceed')}
                        </Button>
                    </Box>
                </div>
            </div>
        </>

    )
}

export default AuthSuccesTab
