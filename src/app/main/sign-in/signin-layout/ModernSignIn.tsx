
import ModernLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernLayout';
import JwtLoginTab from '../tabs/JwtSignInTab';

/**
 * The modern sign in page.
 */
function ModernSignIn() {

    return (
        <ModernLayout>
            <JwtLoginTab />
        </ModernLayout>
    );
}
export default ModernSignIn;
