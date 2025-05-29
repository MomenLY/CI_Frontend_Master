import React, { Suspense } from "react";
import { pageLayout } from "app/configs/settingsConfig";
import FuseLoading from "@fuse/core/FuseLoading";

// Lazy-loaded components
//const ClassicForgotPassword = React.lazy(() => import('./forgotPassword-layout/ClassicForgotPassword'));
import ClassicForgotPassword from "./forgotPassword-layout/ClassicForgotPassword";
const ModernForgotPassword = React.lazy(
  () => import("./forgotPassword-layout/ModernForgotPassword")
);
const ModernReversedForgotPassword = React.lazy(
  () => import("./forgotPassword-layout/ModernReversedForgotPassword")
);
const FullScreenForgotPassword = React.lazy(
  () => import("./forgotPassword-layout/FullScreenForgotPassword")
);

// Fallback component for Suspense
const LoadingFallback = () => <FuseLoading />;

/**
 * The sign in page.
 */
function ForgotPassword() {
  // Define a map of page layout components
  const pageLayoutComponents = {
    "": ClassicForgotPassword,
    classic: ClassicForgotPassword,
    modern: ModernForgotPassword,
    modernReversed: ModernReversedForgotPassword,
    fullscreen: FullScreenForgotPassword,
  };

  // Retrieve the appropriate component based on pageLayout
  const SelectedForgotPasswordComponent =
    pageLayoutComponents[pageLayout] || ClassicForgotPassword;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SelectedForgotPasswordComponent />
    </Suspense>
  );
}

export default ForgotPassword;
