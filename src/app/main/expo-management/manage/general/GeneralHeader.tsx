import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import React from "react";
import { useTranslation } from "react-i18next";



function GeneralHeader() {
    const { t } = useTranslation('general');
  return (
    <div className="p-0 md:p-0 mt-0">
      <OnionCustomHeader
        label={t("gen_settings_title")}
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

export default GeneralHeader;
