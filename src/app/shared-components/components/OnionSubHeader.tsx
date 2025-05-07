import { Typography } from '@mui/material'

type Props ={
    title:string;
    subTitle?:string;
}
function OnionSubHeader({title, subTitle}: Props) {
    return (
        <>
            {title && <Typography className="font-semibold text-[13px] block mb-6">
                {title}
            </Typography>}
            {subTitle && <Typography variant="caption" className="font-normal text-[11px] block">
                {subTitle}
            </Typography>}
        </>
    )
}

export default OnionSubHeader