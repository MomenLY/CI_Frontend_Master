
import _ from '../../../../@lodash/@lodash';
import JwtSignUpTab from '../tabs/JwSignUpTab';
import ModernReversedLayout from 'app/theme-layouts/shared-components/auth-layouts/ModernReversedLayout';

/**
 * The modern reversed sign up page.
 */
function ModernReversedSignUp() {

    return (
        <ModernReversedLayout>
            <JwtSignUpTab />
        </ModernReversedLayout>
    );
}

export default ModernReversedSignUp;
