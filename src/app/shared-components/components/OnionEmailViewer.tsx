import React, { useEffect, useState } from "react";
import { SettingsApi } from "src/app/main/settings/SettingsApi";

function OnionEmailViewer({ email }) {
  const [isEmailHidden, setIsEmailHidden] = useState(true);

  const getPermissionData = async () => {
		const permissionData = await SettingsApi({ settingsKey: 'masking' });
    setIsEmailHidden(permissionData.email);
	};

  useEffect(()=>{
    getPermissionData()
  },[])


  function masker(email, maskCount, startIndex) {
    let [localPart, domain] = email.split("@");

    if (startIndex >= localPart.length) {
      startIndex = localPart.length - 1;
    }
    if (maskCount > localPart.length - startIndex) {
      maskCount = localPart.length - startIndex;
    }

    let maskedLocalPart = localPart
      .split("")
      .map((char, index) => {
        if (index >= startIndex && index < startIndex + maskCount) {
          return "*";
        }
        return char;
      })
      .join("");

    return `${maskedLocalPart}@${domain}`;
  }

 
  



  return (
    <div className="flex items-center space-x-2 max-w-full">
      <div className="flex-grow min-w-0">
        <span className="block truncate text-[13px]">
          {isEmailHidden ? masker(email, 3, 2) : email}
        </span>
      </div>
    </div>
  );
}

export default OnionEmailViewer;
