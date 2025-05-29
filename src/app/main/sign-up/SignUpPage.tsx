import React, { Suspense } from 'react';
import { pageLayout } from 'app/configs/settingsConfig';
import FuseLoading from '@fuse/core/FuseLoading';

// Lazy-loaded components
//const ClassicSignUp = React.lazy(() => import('./signup-layout/ClassicSignUp'));
import ClassicSignUp from './signup-layout/ClassicSignUp';
const ModernSignUp = React.lazy(() => import('./signup-layout/ModernSignUp'));
const ModernReversedSignUp = React.lazy(() => import('./signup-layout/ModernReversedSignUp'));
const FullScreenSignUp = React.lazy(() => import('./signup-layout/FullScreenSignUp'));

// Fallback component for Suspense
const LoadingFallback = () => <FuseLoading />;

/**
 * The sign in page.
 */
function SignUpPage() {
    // Define a map of page layout components
    const pageLayoutComponents = {
        '': ClassicSignUp,
        'classic': ClassicSignUp,
        'modern': ModernSignUp,
        'modernReversed': ModernReversedSignUp,
        'fullscreen': FullScreenSignUp
    };

    // Retrieve the appropriate component based on pageLayout
    const SelectedSignInComponent = pageLayoutComponents[pageLayout] || ClassicSignUp;

    return (
        <Suspense fallback={<LoadingFallback />}>
            <SelectedSignInComponent />
        </Suspense>
    );
}

export default SignUpPage;
