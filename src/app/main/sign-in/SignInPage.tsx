import React, { Suspense, useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { SettingsApi } from '../sign-up/apis/Settings-Api';
import Error404Page from '../404/Error404Page';
import { pageLayout } from 'app/configs/settingsConfig';

// Lazy-loaded components
// const ClassicSignIn = React.lazy(() => import('./signin-layout/ClassicSignIn'));
import ClassicSignIn from './signin-layout/ClassicSignIn';

const ModernSignIn = React.lazy(() => import('./signin-layout/ModernSignIn'));
const ModernReversedSignIn = React.lazy(() => import('./signin-layout/ModernReversedSignIn'));
const FullScreenSignIn = React.lazy(() => import('./signin-layout/FullScreenSignIn'));

// Fallback component for Suspense
function LoadingFallback() {
	return <FuseLoading />;
}

/**
 * The sign in page.
 */
type PrevPermissionData = {
	isSignUpEnabled: string;
	isLoginEnabled: string;
	layout: string;
	socialMediaLogin: {
		google: boolean;
		facebook: boolean;
		apple: boolean;
	};
};

function SignInPage() {
	const [permission, setPermission] = useState<PrevPermissionData>();
	const [loginEnabled, setLoginEnabled] = useState(true);
	const [loaded, setLoaded] = useState(false);

	// Define a map of page layout components
	const pageLayoutComponents = {
		'': ClassicSignIn,
		classic: ClassicSignIn,
		modern: ModernSignIn,
		modernReversed: ModernReversedSignIn,
		fullscreen: FullScreenSignIn
	};

	// Retrieve the appropriate component based on pageLayout
	const SelectedSignInComponent = pageLayoutComponents[pageLayout] || ClassicSignIn;

	useEffect(() => {
		const getPermissionData = async () => {
			if (SelectedSignInComponent) {
				try {
					const permissionData = await SettingsApi({ settingsKey: 'signin_signup' });

					if (permissionData) {
						setLoaded(true);
						setPermission(permissionData);
						setLoginEnabled(permissionData?.isLoginEnabled === 'true');
					}
				} catch (error) {
					setLoginEnabled(true);
				}
			};
		}
		getPermissionData();
	}, []);

	if (!loaded) {
		return <LoadingFallback />;
	}

	return (
		<Suspense fallback={<LoadingFallback />}>
			{loginEnabled ? <SelectedSignInComponent /> : <Error404Page />}
		</Suspense>
	);
}

export default SignInPage;
