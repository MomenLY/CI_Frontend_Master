import { pageLayout } from 'app/configs/settingsConfig';
import React, { Suspense } from 'react';

// Lazy-loaded components
const ClassicConfirmation = React.lazy(() => import('./confirmation-layout/ClassicConfirmation'));
const ModernConfirmation = React.lazy(() => import('./confirmation-layout/ModernConfirmation'));
const ModernReversedConfirmation = React.lazy(() => import('./confirmation-layout/ModernReversedConfirmation'));
const FullScreenConfirmation = React.lazy(() => import('./confirmation-layout/FullScreenConfirmation'));

// Fallback component for Suspense
const LoadingFallback = () => <div>Loading...</div>;

function Confirmation() {
  // Define a map of page layout components
  const pageLayoutComponents = {
    '': ClassicConfirmation,
    'classic': ClassicConfirmation,
    'modern': ModernConfirmation,
    'modernReversed': ModernReversedConfirmation,
    'fullscreen': FullScreenConfirmation
};

// Retrieve the appropriate component based on pageLayout
const SelectedConfirmationComponent = pageLayoutComponents[pageLayout] || ClassicConfirmation;

return (
    <Suspense fallback={<LoadingFallback />}>
        <SelectedConfirmationComponent />
    </Suspense>
);
}

export default Confirmation
