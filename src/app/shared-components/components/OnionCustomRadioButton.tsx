import { FormControlLabel, Radio } from '@mui/material'
import React from 'react'

function OnionCustomRadioButton({ label, value }) {
  return (
    <>
      <FormControlLabel value={value} control={<Radio />} label={label} />
    </>
  )
}

export default OnionCustomRadioButton