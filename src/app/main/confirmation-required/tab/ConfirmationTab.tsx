import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

function ConfirmationTab() {
    const { t } = useTranslation();
  
    return (
        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
            <img
                className="w-48"
                src="assets/images/logo/logo.svg"
                alt="logo"
            />

            <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
                {t('confirmationRequired')}
            </Typography>
            <Typography className="mt-16">
              {t('confirmationContent')}
            </Typography>

            <Typography
                className="mt-32 text-md font-medium"
                color="text.secondary"
            >
                <span>{t('returnTo')}</span>
                <Link
                    className="text-primary-500 ml-4 hover:underline"
                    to="/sign-in"
                >
                    {t('signIn')}
                </Link>
            </Typography>
        </div>
    )
}

export default ConfirmationTab
