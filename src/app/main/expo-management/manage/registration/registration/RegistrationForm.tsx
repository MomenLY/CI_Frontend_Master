import OnionCustomFieldForm from "app/shared-components/onion-custom-field-form/OnionCustomFieldForm";
import React, { useEffect, useState } from "react";
import {
  setState,
  useProfileDispatch,
  useProfileSelector,
} from "src/app/main/settings/user-settings/profile-field-settings/ProfileFieldSettingsSlice";
import { getExpo } from "../../hall-management/apis/ExpoIdFinder";
import { useParams } from "react-router";

function RegistrationForm() {
  const [expoId, setExpoId] = useState();
  const routeParams = useParams();

  const getExpoId = async () => {
    const res = await getExpo(routeParams.id);
    setExpoId(res?.data?.expo?.id)
  };

  
  useEffect(() => {
    getExpoId();
  }, []);

  const dispatchRefresh = useProfileDispatch();
  const state = useProfileSelector((state) => state.state.value);
  return (
    <>
      <OnionCustomFieldForm
        endPoint="profile-fields"
        exitEndpoint={-1}
        type={`expo_${expoId}`}
        onSubmitComplete={() => dispatchRefresh(setState(!state))}
      />
    </>
  );
}

export default RegistrationForm;
