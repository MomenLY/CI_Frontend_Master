// import createGenerateClassName from '@mui/styles/createGenerateClassName';
// import jssPreset from '@mui/styles/jssPreset';
// import { create } from 'jss';
// import jssExtend from 'jss-plugin-extend';
// import rtl from 'jss-rtl';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StyledEngineProvider } from '@mui/material/styles';
import routes from 'app/configs/routesConfig';
import { useMemo } from 'react';
import { Provider } from 'react-redux';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import AppContext from './AppContext';
import store from './store/store';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from './shared-components/cache/cacheIndex';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

type ComponentProps = {
	name?: string;
};

// Create a react query client object
export const queryClient = new QueryClient();

/**
 * A Higher Order Component that provides the necessary context providers for the app.
 */

function withAppProviders(Component: React.ComponentType<ComponentProps>) {
	/**
	 * The component that wraps the provided component with the necessary context providers.
	 */
	 function WithAppProviders(props: React.PropsWithChildren<ComponentProps>) {
		/**
		 * The value to pass to the AppContext provider.
		 */
		const val = useMemo(
			() => ({
				routes
			}),
			[routes]
		);

		return (
			<ErrorBoundary>
				 {/* Provide the react query client to your App */}
				 <QueryClientProvider client={queryClient}>
					<AppContext.Provider value={val}>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<Provider store={store}>
								<StyledEngineProvider injectFirst>
									<Component {...props} />
								</StyledEngineProvider>
							</Provider>
						</LocalizationProvider>
					</AppContext.Provider>
					{/* Provide the react query dev tools for debugging */}
					{/* <ReactQueryDevtools initialIsOpen={false} /> */}
				</QueryClientProvider>
			</ErrorBoundary>
		);
	}

	return WithAppProviders;
}

export default withAppProviders;
