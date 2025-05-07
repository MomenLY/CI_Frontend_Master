import themesConfig from 'app/configs/themesConfig';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';

import i18n, { setI18nBackendUrl } from '../../i18n';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSettings } from 'app/shared-components/cache/cacheCallbacks';

const data = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));

setTimeout(() => {
	setI18nBackendUrl(data?.cloudFrontUrl || '');
}, 1000)

/**
 * The settingsConfig object is a configuration object for the Fuse application's settings.
 */
const settingsConfig: FuseSettingsConfigType = {
	/**
	 * The layout object defines the layout style and configuration for the application.
	 */
	layout: {
		/**
		 * The style property defines the layout style for the application.
		 */
		style: data?.layout?.style || 'layout1', // layout1 layout2 layout3
		/**
		 * The config property defines the layout configuration for the application.
		 * Check out default layout configs at app/theme-layouts for example app/theme-layouts/layout1/Layout1Config.js
		 */
		config: {
			mode: data?.layout?.config?.mode || 'container',
			containerWidth: data?.layout?.config?.containerWidth || 1570,
			// navbar: {
			// 	display: data.layout.config.navbar.display || true,
			// 	style: data.layout.config.navbar.style || "style-1",
			// 	folded: data.layout.config.navbar.folded || true,
			// 	position: data.layout.config.navbar.position || "left",
			// 	open: data.layout.config.navbar.open || true
			// },
			// toolbar: {
			// 	display: data.layout.config.toolbar.display || true,
			// 	style: data.layout.config.toolbar.style || "fixed"
			// },
			// footer: {
			// 	display: data.layout.config.footer.display || true,
			// 	style: data.layout.config.footer.style || "fixed",
			// },
			// leftSidePanel : {
			// 	display: data.layout.config.leftSidePanel.display || true,
			// },
			// rightSidePanel: {
			// 	display: data.layout.config.rightSidePanel.display || true,
			// }
		} // checkout default layout configs at app/theme-layouts for example  app/theme-layouts/layout1/Layout1Config.js
	},

	/**
	 * The customScrollbars property defines whether or not to use custom scrollbars in the application.
	 */
	customScrollbars: false,

	/**
	 * The direction property defines the text direction for the application.
	 */
	direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
	/**
	 * The theme object defines the color theme for the application.
	 */
	theme: {
		main: data?.theme?.main || themesConfig.default,
		navbar: data?.theme?.navbar || themesConfig.defaultDark,
		toolbar: data?.theme?.toolbar || themesConfig.default,
		footer: data?.theme?.footer || themesConfig.defaultDark
	},

	/**
	 * The defaultAuth property defines the default authorization roles for the application.
	 * To make the whole app auth protected by default set defaultAuth:['admin','staff','user']
	 * To make the whole app accessible without authorization by default set defaultAuth: null
	 * The individual route configs which have auth option won't be overridden.
	 */
	defaultAuth: ['admin','user','endUser'],

	/**
	 * The loginRedirectUrl property defines the default redirect URL for the logged-in user.
	 */
	loginRedirectUrl: '/',
	version: data?.version || 1
};

export default settingsConfig;

export const pageLayout:string = data?.authLayout || 'classic';// classic , modern ,modernReversed,fullscreen
