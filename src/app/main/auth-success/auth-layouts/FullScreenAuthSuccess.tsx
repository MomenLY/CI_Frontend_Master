
import FullScreenLayout from 'app/theme-layouts/shared-components/auth-layouts/FullScreenLayout';
import { ReactNode } from 'react';

type LayoutType ={
  children: ReactNode
}

function FullScreenAuthSuccess({children}: LayoutType) {
  return (
    <FullScreenLayout>
      {children}
    </FullScreenLayout>
  )
}

export default FullScreenAuthSuccess
