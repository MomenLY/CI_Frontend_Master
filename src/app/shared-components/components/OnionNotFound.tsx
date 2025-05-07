import React from 'react'
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
function OnionNotFound() {
  const { t } = useTranslation();

  return (
    <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100vw',
        textAlign: 'center',
        // backgroundColor: '#f0f0f0', // Optional: Add a background color for better visibility
      }}>

        <Typography variant="h6" color="textSecondary">
          {t('onionNoRecordFound')}
        </Typography>
      </div>
  )
}

export default OnionNotFound