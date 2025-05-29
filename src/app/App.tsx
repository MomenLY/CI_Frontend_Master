import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider } from 'notistack';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache, { Options } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { selectCurrentLanguageDirection } from 'app/store/i18nSlice';
import themeLayouts from 'app/theme-layouts/themeLayouts';
import { selectMainTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import MockAdapterProvider from '@mock-api/MockAdapterProvider';
import { useAppSelector } from 'app/store/hooks';
import { useSelector } from 'react-redux';
import withAppProviders from './withAppProviders';
import { AuthRouteProvider } from './auth/AuthRouteProvider';
import { useEffect } from 'react';
import { setI18nBackendUrl } from 'src/i18n';

// import axios from 'axios';
/**
 * Axios HTTP Request defaults
 */
// axios.defaults.baseURL = "";
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
// axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AnalyticsProvider } from './shared-components/AnalyticsProvider';
import { HelmetProvider } from 'react-helmet-async';

const emotionCacheOptions = {
	rtl: {
		key: 'muirtl',
		stylisPlugins: [rtlPlugin],
		insertionPoint: document.getElementById('emotion-insertion-point')
	},
	ltr: {
		key: 'muiltr',
		stylisPlugins: [],
		insertionPoint: document.getElementById('emotion-insertion-point')
	}
};

const queryClient = new QueryClient();

/**
 * The main App component.
 */
function App() {	/**
	 * The language direction from the Redux store.
	 */
	const langDirection = useAppSelector(selectCurrentLanguageDirection);
	/**
	 * The main theme from the Redux store.
	 */
	const mainTheme = useSelector(selectMainTheme);

	return (
		<HelmetProvider>
		<MockAdapterProvider>
			<CacheProvider value={createCache(emotionCacheOptions[langDirection] as Options)}>
				<FuseTheme
					theme={mainTheme}
					direction={langDirection}
				>
					<AuthRouteProvider>
						<AnalyticsProvider
							trackingId=""
							userInfo={{}}
							isAuthenticated={false}
						>
							<QueryClientProvider client={queryClient}>
								<SnackbarProvider
									maxSnack={5}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right'
									}}
									classes={{
										containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99'
									}}
								>
									<FuseLayout layouts={themeLayouts} />
									<ReactQueryDevtools initialIsOpen={false} />
								</SnackbarProvider>
							</QueryClientProvider>
						</AnalyticsProvider>
					</AuthRouteProvider>
				</FuseTheme>
			</CacheProvider>
		</MockAdapterProvider>
		</HelmetProvider>
	);
}

export default withAppProviders(App);
