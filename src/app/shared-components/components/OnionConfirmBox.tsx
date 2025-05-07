import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Avatar, Button, Container, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Variants = 'warning' | 'info'

type Props = {
    confirmButtonLabel?: string;
    cancelButtonLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    subTitle?: string;
    variant?: Variants;
    children?: ReactNode
}

function OnionConfirmBox({
    onCancel,
    onConfirm,
    title,
    subTitle,
    confirmButtonLabel,
    cancelButtonLabel,
    variant = 'info',
    children
}: Props) {
    const { t } = useTranslation();

    const ConfirmButton = () => {
        return (
            <Button
                onClick={onConfirm}
                color={variant === 'info' ? "secondary" : "error"}
                autoFocus
                variant="contained"
                fullWidth
            >
                {confirmButtonLabel ? confirmButtonLabel : t('yes')}
            </Button>
        )
    }
    const CancelButton = () => {
        return (
            <Button
                onClick={onCancel}
                color="inherit"
                variant='outlined'
                fullWidth
            >
                {cancelButtonLabel ? cancelButtonLabel : t('no')}
            </Button>
        )
    }
    return (
        <>
            <div className='relative max-w-[460px] md:min-w-[460px] min-h-[290px] px-[40px] md:px-[50px] py-[25px] flex flex-col'>
                <div className='modal-Header  w-full '>
                    <Typography
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'pre-line',
                        }}
                        className='text-center font-semibold truncate leading-6'
                        variant="h6">{title}</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onCancel}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 18,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <FuseSvgIcon color='inherit'>material-outline:close</FuseSvgIcon>
                    </IconButton>
                </div>
                <div className='modal-body flex-1 py-24 flex flex-col justify-center'>
                    {children && <div className='w-full overflow-hidden text-10'>
                        {children}
                    </div>}
                    {subTitle &&
                        <Typography
                            variant='body1'
                            className='text-center'
                            color='text.secondary'
                        >{subTitle}</Typography>
                    }
                </div>
                <div className='modal-footer w-full flex flex-row space-x-[20px]'>
                    {variant === 'info' ? <><CancelButton /><ConfirmButton /></> : <><ConfirmButton /><CancelButton /></>}
                </div>
            </div>
        </>
    )
}

export default OnionConfirmBox
