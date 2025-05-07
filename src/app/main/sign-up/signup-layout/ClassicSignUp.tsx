
import ClassicLayout from 'app/theme-layouts/shared-components/auth-layouts/ClassicLayout';
import JwtSignUpTab from '../tabs/JwSignUpTab';

/**
 * The classic sign up page.
 */
function ClassicSignUp() {

	return (
		<ClassicLayout>
            <JwtSignUpTab />
        </ClassicLayout>
	);
}

export default ClassicSignUp;
