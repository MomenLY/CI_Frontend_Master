import axiosClient from "app/store/axiosService";

let altCache = { url: '', lng: '', data: null, timestamp: 0 };
let cache = { url: '', lng: '', ns: '', data: null, timestamp: 0 };

export const getLocales = (backendBaseUrl: string, lng: string, ns: string) => {
  return fetch(new URL(`/locales/${ns}/${lng}.json`, backendBaseUrl || window.location.origin).toString()).then(res => res.json());
};

export const getLocalesCached = (backendBaseUrl: string, lng: string, ns: string) => {
  if((backendBaseUrl === cache.url) && (lng === cache.lng) && (ns === cache.ns) && (Date.now() - cache.timestamp < 300000)) {
    return Promise.resolve(cache);
  }
  return getLocales(backendBaseUrl, lng, ns).then(response => {
    cache.data = { ...response.data };
    cache.timestamp = Date.now();
    cache.lng = lng;
    cache.ns = ns;
    cache.url = backendBaseUrl;
    return response;
  })
};

/**
 * get custom language definitions defined by the tenant
 * @param lng language code
 * @returns language definition json
 */
export const getAltLocales = (lng: string) => {
  // return axios({
  //   baseURL: backendBaseUrl,
  //   url: `/altlocales/${lng}.json`
  // });
  return axiosClient.get(`/languages/json/${lng}`, { headers: { 'responseformat': 'none' } });
};

export const getAltLocalesCached = (lng: string) => {
  if((lng === altCache.lng) && (Date.now() - altCache.timestamp < 300000)) {
    return Promise.resolve(altCache);
  }
  return getAltLocales(lng).then(response => {
    altCache.data = { ...response.data };
    altCache.timestamp = Date.now();
    altCache.lng = lng;
    return response;
  })
};
