import UserSettingsHeader from '../UserSettingsHeader'
import { useTranslation } from 'react-i18next';
import OnionCustomFields from 'app/shared-components/onion-custom-fields/OnionCustomFields';
import { Button, Typography } from '@mui/material';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';
import { useProfileSelector } from './ProfileFieldSettingsSlice';
import { useEffect } from 'react';

function ProfileFieldSettingsContent() {
  const { t } = useTranslation();
  const state = useProfileSelector((state) => state.state.value);

  return (
    <OnionPageOverlay>
      <UserSettingsHeader
        title={t('profileFieldSettings')}
        subTitle={t('profileFieldSettings')}
      />
      <div className="mt-5 mb-24 flex flex-col md:flex-row w-full">
        <div>
          <Typography
            component="h4"
            className="flex-1 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate "
          >
            {t('profileFieldSettings')}
          </Typography>
          <div className="mt-5 md:w-2xl text-base">{t('profileFieldSettings_Content')}</div>
        </div>
        <div className='flex w-full justify-center'>
          <Button className="mx-8"
            variant="contained"
            color="success"
            component={NavLinkAdapter}
            to={'new'}
          >
            <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
            <span className="mx-8">{t('Add')}</span>
          </Button>
        </div>
      </div>
      <div className='md:w-1/2 mt-36'>
      <OnionCustomFields
        endPoint='profile-fields'
        loader
        enableStatusSwitch
        enableDelete
        type={'profile'}
        refresh={state}
      />
      </div>
    </OnionPageOverlay>
  )
}

export default ProfileFieldSettingsContent
