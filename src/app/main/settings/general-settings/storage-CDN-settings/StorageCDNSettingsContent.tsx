import React from 'react'
import GeneralSettingsHeader from '../GeneralSettingsHeader'
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay'

function StorageCDNSettingsContent() {
    return (
       <OnionPageOverlay>
            <GeneralSettingsHeader
                title='Storage CDN'
                subTitle='Storage CDN'
            />
       </OnionPageOverlay>
    )
}

export default StorageCDNSettingsContent