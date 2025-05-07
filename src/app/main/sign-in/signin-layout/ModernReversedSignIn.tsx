
import ModernReversedLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernReversedLayout';
import JwtLoginTab from '../tabs/JwtSignInTab';

/**
 * The modern reversed sign in page.
 */
function ModernReversedSignIn() {


    return (
        <ModernReversedLayout>
            <JwtLoginTab />
        </ModernReversedLayout>
    );
}

export default ModernReversedSignIn;
