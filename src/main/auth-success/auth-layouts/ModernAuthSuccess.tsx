
import ModernLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernLayout';
import { ReactNode } from 'react';


type LayoutType ={
    children: ReactNode
  }
/**
 * The modern sign in page.
 */
function ModernAuthSuccess({children}: LayoutType) {

    return (
        <ModernLayout>
           {children}
        </ModernLayout>
    );
}
export default ModernAuthSuccess;
