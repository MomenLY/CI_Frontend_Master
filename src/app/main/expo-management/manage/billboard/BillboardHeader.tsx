import { Button } from '@mui/base';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import MainHeader from 'app/shared-components/components/MainHeader';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LocalCache from 'src/utils/localCache';

type Props = {
    rules?: any
    heading?: string
}


function BillboardHeader({ rules }: Props) {
    const { t } = useTranslation('billboard');
    const routeParams = useParams();
    return (
        <>
            <div className="">
                <OnionCustomHeader
                    label={t('billboard_heading')}
                    search={false}
                    button={false}
                    buttonUrl='new'
                />
            </div>

            {/* <div className="p-[26px] pb-[15px]">
                <MainHeader
                    heading={t("billboard_heading")}
                    searchBar={false}
                    sortIcon={false}
                    addBtn={false}
                    downloadIcon={false}
                />
            </div> */}
        </>
    )
}

export default BillboardHeader