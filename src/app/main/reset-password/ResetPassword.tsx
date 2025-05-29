import React, { Suspense } from 'react';
import { pageLayout } from 'app/configs/settingsConfig';
import FuseLoading from '@fuse/core/FuseLoading';

// Lazy-loaded components
//const ClassicResetPassword = React.lazy(() => import('./resetPassword-layout/ClassicResetPassword'));
import ClassicResetPassword from './resetPassword-layout/ClassicResetPassword';

// Fallback component for Suspense
const ModernResetPassword = React.lazy(() => import('./resetPassword-layout/ModernResetPassword'));
const ModernReversedResetPassword = React.lazy(() => import('./resetPassword-layout/ModernReversedResetPassword'));
const FullScreenResetPassword = React.lazy(() => import('./resetPassword-layout/FullScreenResetPassword'));

// Fallback component for Suspense
function LoadingFallback() {
	return <FuseLoading />;
}

/**
 * The sign in page.
 */
function ResetPassword() {
	// Define a map of page layout components
	const pageLayoutComponents = {
		'': ClassicResetPassword,
		classic: ClassicResetPassword,
		modern: ModernResetPassword,
		modernReversed: ModernReversedResetPassword,
		fullscreen: FullScreenResetPassword
	};

	// Retrieve the appropriate component based on pageLayout
	const SelectedResetPasswordComponent = pageLayoutComponents[pageLayout] || ClassicResetPassword;

	return (
		<Suspense fallback={<LoadingFallback />}>
			<SelectedResetPasswordComponent />
		</Suspense>
	);
}

export default ResetPassword;
