import { Breadcrumbs, Typography } from '@mui/material'
import { motion } from "framer-motion";

type Props = {
    title?: string;
    titleLink?: string;
    firstLabel?: string;
    secondLabel?: string;
}

function OnionHeader({ title, titleLink, firstLabel, secondLabel }: Props) {

    return (
        <div>
            <div className=" flex md:flex-row flex-col justify-between md:items-center pb-24">
                <motion.span
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.2 } }}
                >
                    <Typography
                        component="h2"
                        className="flex-1 text-3xl md:text-4xl font-bold tracking-tight leading-7 sm:leading-10 truncate "
                    >
                        {title}
                    </Typography>
                </motion.span>
            </div>
        </div>)
}

export default OnionHeader