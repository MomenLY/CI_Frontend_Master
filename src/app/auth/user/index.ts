import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';

/**
 * The type definition for a user object.
 */
export type User = {
	uuid: string;
	role: string[] | string | null;
	data: {
		displayName: string;
		photoURL?: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		shortcuts?: string[];
		settings?: Partial<FuseSettingsConfigType>;
		loginRedirectUrl?: string; // The URL to redirect to after login.,
		userImage?: string;
	};
	user: {
		firstName?: string;
		lastName?: string;
		email?: string;
	};
};
