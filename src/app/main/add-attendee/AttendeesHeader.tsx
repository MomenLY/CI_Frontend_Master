import { Button } from '@mui/base';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LocalCache from 'src/utils/localCache';

type Props = {
    rules?: any
    heading?: string
}


function AttendeeHeader({ rules }: Props) {
    const { t } = useTranslation('attendees');
    const routeParams = useParams();
    return (
        <>
            <div className="px-40">
                <OnionCustomHeader
                    label={t('addAttendees_heading')}
                    search={false}
                    button={false}
                    buttonUrl='new'
                />
            </div>
        </>
    )
}

export default AttendeeHeader