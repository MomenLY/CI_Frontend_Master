import OnionCustomFieldForm from 'app/shared-components/onion-custom-field-form/OnionCustomFieldForm'
import { setState, useProfileDispatch, useProfileSelector } from '../ProfileFieldSettingsSlice';


function AddFieldForm() {
  const dispatchRefresh = useProfileDispatch();
	const state = useProfileSelector((state) => state.state.value);

  return (
    <>
      <OnionCustomFieldForm
        endPoint='profile-fields'
        exitEndpoint="/expo-management/manage/registration"
        type='profile'
        onSubmitComplete={()=>dispatchRefresh(setState(!state))}
      />
    </>
  )
}

export default AddFieldForm
