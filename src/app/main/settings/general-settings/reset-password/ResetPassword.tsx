import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import ResetPasswordContent from './ResetPasswordContent';

const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {},
    '& .FusePageSimple-content': {
        backgroundColor: theme.palette.background.paper
    },
    '& .FusePageSimple-sidebarHeader': {},
    '& .FusePageSimple-sidebarContent': {}
}));

function Reset_Password() {
    return <Root content={<ResetPasswordContent />} />;
}

export default Reset_Password;
