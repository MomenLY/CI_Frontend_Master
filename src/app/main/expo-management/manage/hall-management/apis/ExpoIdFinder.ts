import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { useParams } from "react-router";
import LocalCache from "src/utils/localCache";

export const getExpo = async (expoID) => {
  const res = await LocalCache.getItem(
    cacheIndex.expoDetails + "_" + expoID,
    getSingleExpoAPI.bind(this, expoID)
  );

  return res;
};
