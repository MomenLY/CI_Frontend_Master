import OnionCustomFieldForm from 'app/shared-components/onion-custom-field-form/OnionCustomFieldForm';
import React from 'react'
import {setState, useProfileDispatch, useProfileSelector } from 'src/app/main/settings/user-settings/profile-field-settings/ProfileFieldSettingsSlice';

function RegistrationForm() {
  const dispatchRefresh = useProfileDispatch();
	const state = useProfileSelector((state) => state.state.value);
  return (
<>
      <OnionCustomFieldForm
        endPoint='profile-fields'
        exitEndpoint="/admin/settings/user-settings/profile-field-settings"
        type='profile'
        onSubmitComplete={()=>dispatchRefresh(setState(!state))}
      />
    </>  )
}

export default RegistrationForm