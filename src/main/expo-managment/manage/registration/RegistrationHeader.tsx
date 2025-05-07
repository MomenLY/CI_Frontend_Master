import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import React from "react";
import { useTranslation } from "react-i18next";



function RegistrationHeader() {
    const { t } = useTranslation('registration');
  return (
    <div className="p-0 md:p-0 mt-0">
      <OnionCustomHeader
        label={t("registration_heading")}
        search={false}
        button={false}
        // searchLabel={t("common_search")}
        // searchKeyword={keyword}
        // setSearchKeyword={setKeyword}
        // buttonLabel={t("common_add")}
        // button={rules?.addRole?.permission}
        buttonUrl="new"
      />
    </div>
  );
}

export default RegistrationHeader;
