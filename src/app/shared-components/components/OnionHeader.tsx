import { Breadcrumbs, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom';

type Props={
    title?: string;
    titleLink?: string;
    firstLabel?: string;
    secondLabel?: string;
}

function OnionHeader({title, titleLink, firstLabel, secondLabel}: Props) {
    
    return (
        <div>
            <div className=" flex md:flex-row flex-col justify-between md:items-center pb-24">
                <Typography
                    component="h2"
                    className="flex-1 text-3xl md:text-4xl font-extrabold tracking-tight leading-7 sm:leading-10 truncate "
                >
                    {title}
                </Typography>
            </div>
        </div>)
}

export default OnionHeader