import React, { useEffect, useState } from 'react'
import { SettingsApi } from 'src/app/main/settings/SettingsApi';

function OnionPhoneNumberViewer({phoneNumber}) {
    const [isNumberHidden, setIsNumberHidden] = useState(true);

  const getPermissionData = async () => {
		const permissionData = await SettingsApi({ settingsKey: 'masking' });
        setIsNumberHidden(permissionData.phoneNumber);
	};

    function maskPhoneNumber(phoneNumber) {
        if (phoneNumber.length < 5) {
          return phoneNumber; // If the phone number is too short, return it as is.
        }
      
        const startPart = phoneNumber.slice(0, 1);
        const endPart = phoneNumber.slice(-1);
      
        return `${startPart}***${endPart}`;
        console.log(phoneNumber,"phoneNumber");
        
      }

  useEffect(()=>{
    getPermissionData()
  },[])
  return (
    <div>
        {isNumberHidden ? maskPhoneNumber(phoneNumber) : phoneNumber}
    </div>
  )
}

export default OnionPhoneNumberViewer