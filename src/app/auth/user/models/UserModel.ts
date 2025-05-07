import _ from '@lodash';
import { PartialDeep } from 'type-fest';
import { User } from 'src/app/auth/user';

/**
 * Creates a new user object with the specified data.
 */
function UserModel(data: PartialDeep<User>): User {
	data = data || {};

	return _.defaults(data, {
		uuid: '',
		role: null, // guest
		data: {
			displayName: 'Guest User',
			firstName: '',
			lastName: '',
			photoURL: '',
			email: '',
			shortcuts: [],
			settings: {}
		},
		user: {
			firstName: '',
			lastName: '',
			email: ''
		}
	});
}

export default UserModel;
