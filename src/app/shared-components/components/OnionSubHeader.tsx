import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next';

type Props = {
    title: string;
    subTitle?: string;
    button?: boolean;
    buttonLabel?: string;
    buttonIcon?: string;
    onClick?: () => void;
}
function OnionSubHeader({ title, subTitle, button, buttonLabel, buttonIcon, onClick }: Props) {
    const {t} = useTranslation();
    return (
        <>
        <div className='flex item-center py-10'>
            <div className=' flex-1 me-10'>
            {title && <Typography className="font-semibold text-[13px] block mb-6 truncate">
                {title}
            </Typography>}
            {subTitle && <Typography variant="caption" className="font-normal text-[11px] block">
                {subTitle}
            </Typography>}
            </div>
            {button && <Button
                className="mx-4 rounded-[10px] font-medium uppercase"
                variant="contained"
                color="primary"
                onClick={onClick}
            >
                {button && <FuseSvgIcon size={20}>{buttonIcon ? buttonIcon : 'heroicons-outline:plus'}</FuseSvgIcon>}
                <span className="sm:flex mx-4 ">{buttonLabel ? buttonLabel : t('common_add')}</span>
            </Button>}
        </div>

          
            
        </>
    )
}

export default OnionSubHeader