import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { Box, Button, CircularProgress, Container, IconButton, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface ContentProps {
    children: ReactNode;
    title: string;
    subTitle?: string;
    footer?: boolean;
    footerButtonLabel?: string;
    footerButtonDisabled?: boolean;
    isFooterButtonLoading?: boolean;
    footerButtonClick?: () => void;
    exitEndpoint: string;
    footerButtonSize?: 'full' | 'large' | 'medium' | 'small';
    sidebarWidth: 'full' | 'medium' | 'small';
}

function OnionSidebar({
    title,
    subTitle,
    children,
    footer,
    footerButtonDisabled,
    footerButtonLabel,
    isFooterButtonLoading,
    footerButtonClick,
    exitEndpoint,
    footerButtonSize = 'small',
    sidebarWidth = 'small',
}: ContentProps) {
    return (
        <div className={`flex flex-col flex-auto rounded-lg ${sidebarWidth === 'small' && 'w-full md:w-[48rem]'} ${sidebarWidth === 'medium' && 'w-full md:w-[64rem]'} ${sidebarWidth === 'full' && 'w-full md:w-[98rem]'} max-w-full`}>
            <Box
                sx={{
                    backgroundColor: 'background.paper'
                }}
                className='pt-36 pb-16 px-44 sticky top-0 z-30'>
                <Typography color="text" className="text-[18px] font-semibold block leading-8">
                    {title}
                </Typography>
                {subTitle && <Typography variant="caption" className="font-normal">
                    {subTitle}
                </Typography>}
                <IconButton
                    className="absolute top-28 right-16  m-0 z-99"
                    sx={{ color: "text.primary" }}
                    component={NavLinkAdapter}
                    to={exitEndpoint}
                    size="large"
                >
                    <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
                </IconButton>
            </Box>
            <Container className={`pt-16 pb-88 px-44`}>
                {children}
            </Container>
            {footer && <Box
                className={`py-16 px-44 fixed bottom-0 z-30 shadow-[0_2px_10px_0px_rgba(0,0,0,0.18)] ${sidebarWidth === 'small' && 'w-full md:w-[48rem]'} ${sidebarWidth === 'medium' && 'w-full md:w-[64rem]'} ${sidebarWidth === 'full' && 'w-full md:w-[98rem]'}`}
                sx={{ bgcolor: 'background.paper', p: 2, position: 'fixed', bottom: 0, width: '100%', justifyContent: 'flex-end' }}>
                <div className=" flex !justify-end">
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        disabled={footerButtonDisabled || isFooterButtonLoading}
                        onClick={footerButtonClick}
                        className={`${footerButtonSize === 'medium' && 'w-1/3'} ${footerButtonSize === 'small' && 'w-auto'} ${footerButtonSize === 'full' && 'w-full'} ${footerButtonSize === 'large' && 'w-2/3'}`}
                    >
                        {isFooterButtonLoading === true ? (
                            <CircularProgress
                                size={25}
                                color="inherit"
                            />
                        ) : (
                            footerButtonLabel
                        )}
                    </Button>
                </div>
            </Box>}
        </div>
    )
}

export default OnionSidebar