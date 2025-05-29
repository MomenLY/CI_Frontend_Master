import { cacheIndex } from "app/shared-components/cache/cacheIndex"
import LocalCache from "./localCache"
import { getSettings } from "app/shared-components/cache/cacheCallbacks";

export const getCurrency = async () => {
    const layout = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    return layout?.currency;
}