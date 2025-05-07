import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-chained-backend';
import HttpApi from 'i18next-http-backend'; // have a own http fallback
import { getAltLocalesCached, getLocalesCached } from './i18n.api';
import { getLanguageFromStorage } from './utils/langHelper';

let backendBaseUrl = '';
let lastLoaded = {};

const lang = getLanguageFromStorage();

/**
 * i18n is initialized with the resources object and the language to use.
 * The keySeparator option is set to false because we do not use keys in form messages.welcome.
 * The interpolation option is set to false because we do not use interpolation in form messages.welcome.
 */
i18n.use(initReactI18next) // passes i18n down to react-i18next
	.use(Backend)
	.init({
		lng: lang,

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false // react already safes from xss
		},

		fallbackLng: 'en',
		ns: ['default'],
		defaultNS: 'default',
		fallbackNS: 'default',
		react: {
			useSuspense: false,
			bindI18nStore: 'added'
		},
		backend: {
			backends: [HttpApi],
			backendOptions: [
				{
					loadPath: '/locales/{{ns}}/{{lng}}.json' // http api load path for my own fallback
				}
			]
			// cacheHitMode: 'none' // (default)
			// cacheHitMode: 'refresh' // tries to refresh the cache by loading from the next backend and updates the cache
			// cacheHitMode: 'refreshAndUpdateStore' // tries to refresh the cache by loading from the next backend, updates the cache and also update the i18next resource store
			// reloadInterval: 60 * 60 * 1000 // can be used to reload resources in a specific interval (useful in server environments)
			// refreshExpirationTime: 7 * 24 * 60 * 60 * 1000 // In case of caching with 'refresh' or 'refreshAndUpdateStore', it will only fetch from the next backend if the cached namespace is expired. Only supported if the backend returns the saved timestamp, like i18next-fs-backend, i18next-localstorage-backend
		}
	});

export const setI18nBackendUrl = async (url: string) => {
	backendBaseUrl = url;
	if (Object.keys(lastLoaded).length > 0) {
		const loadedKeys = Object.keys(lastLoaded);
		if (!loadedKeys.length) {
			return;
		}
		const lng = loadedKeys[0];
		const nsKeys = Object.keys(lastLoaded[lng]);
		// console.log('lastLoaded', lastLoaded, lng, nsKeys)
		try {
			const responseAlt = await getAltLocalesCached(lng);
			for (const ns of nsKeys) {
				const response = await getLocalesCached(backendBaseUrl, lng, ns);
				i18n.addResources(lng, ns, response.data);
				i18n.addResources(lng, ns, responseAlt.data);
			}
			window.dispatchEvent(new Event("lang-updated"));
		} catch (error) {
			console.log(error);
		}
	}
}

export default i18n;

i18n.on('loaded', async (loaded) => {
	const loadedKeys = Object.keys(loaded);
	if (!loadedKeys.length) {
		return;
	}
	const lng = loadedKeys[0];
	const nsKeys = Object.keys(loaded[lng]);
	// console.log('loaded', loaded, lng, nsKeys)
	if (!lastLoaded[lng]) {
		lastLoaded = { [lng]: {} };
	}
	try {
		const responseAlt = await getAltLocalesCached(lng);
		for (const ns of nsKeys) {
			lastLoaded[lng][ns] = true;
			const response = await getLocalesCached(backendBaseUrl, lng, ns);
			i18n.addResources(lng, ns, response.data);
			i18n.addResources(lng, ns, responseAlt.data);
		}
		window.dispatchEvent(new Event("lang-updated"));
	} catch (error) {
		console.log(error);
	}
})