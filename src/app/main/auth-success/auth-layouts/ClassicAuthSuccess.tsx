
import ClassicLayout from 'app/theme-layouts/shared-components/auth-layouts/ClassicLayout';
import { ReactNode } from 'react';


type LayoutType ={
    children: ReactNode
  }
/**
 * The classic sign in page.
 */
function ClassicAuthSuccess({children}: LayoutType) {

    return (
        <ClassicLayout>
            {children}
        </ClassicLayout>
    );
}

export default ClassicAuthSuccess;
