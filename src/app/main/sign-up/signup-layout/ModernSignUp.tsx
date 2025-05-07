
import ModernLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernLayout';
import JwtSignUpTab from '../tabs/JwSignUpTab';

/**
 * The modern sign up page.
 */
function ModernSignUp() {

    return (
        <ModernLayout>
            <JwtSignUpTab />
        </ModernLayout>
    );
}

export default ModernSignUp;
