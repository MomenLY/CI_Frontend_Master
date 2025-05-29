import React from 'react'
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
function OnionNotFound({message}) {
  const { t } = useTranslation();

  return (
    <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        textAlign: 'center',
        flex:"1",
                // backgroundColor: '#f0f0f0', // Optional: Add a background color for better visibility
      }}>

        <Typography variant="h6" color="textSecondary">
          {message ? message : t('onionNoRecordFound')}
        </Typography>
      </div>
  )
}

export default OnionNotFound