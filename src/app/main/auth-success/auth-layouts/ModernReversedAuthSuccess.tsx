
import ModernReversedLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernReversedLayout';
import { ReactNode } from 'react';

type LayoutType ={
  children: ReactNode
}
/**
 * The modern reversed sign in page.
 */
function ModernReversedAuthSuccess({children}: LayoutType) {

    return (
        <ModernReversedLayout>
         {children}
        </ModernReversedLayout>
    );
}

export default ModernReversedAuthSuccess;
