import { cacheIndex } from "app/shared-components/cache/cacheIndex"
import LocalCache from "./localCache"
import { getSettings } from "app/shared-components/cache/cacheCallbacks"

export const getTimeZoneSettings = async () => {
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    if (settings?.timeZone === undefined || settings?.timeZone === null || !settings?.timeZone) {
        return ''
    }
    return settings?.timeZone;
} 