
import ClassicLayout from 'app/theme-layouts/shared-components/auth-layouts/ClassicLayout';
import JwtLoginTab from '../tabs/JwtSignInTab';

/**
 * The classic sign in page.
 */
function ClassicSignIn() {

    return (
        <ClassicLayout>
            <JwtLoginTab />
        </ClassicLayout>
    );
}

export default ClassicSignIn;
