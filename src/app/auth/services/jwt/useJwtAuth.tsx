import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import jwtDecode, { JwtPayload } from "jwt-decode";
import _ from "@lodash";
import { PartialDeep } from "type-fest";
import { getUserAPI } from "@mock-api/api/token-api";
import LocalCache from "src/utils/localCache";
import history from "@history";
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';

const defaultAuthConfig = {
	tokenStorageKey: "jwt_access_token",
	signInUrl: "api/auth/sign-in",
	signUpUrl: "api/auth/sign-up",
	tokenRefreshUrl: "api/auth/refresh",
	getUserUrl: "api/auth/user",
	updateUserUrl: "api/auth/user",
	updateTokenFromHeader: false,
};

export type JwtAuthProps<T> = {
	config: {
		tokenStorageKey: string;
		signInUrl: string;
		signUpUrl: string;
		tokenRefreshUrl: string;
		getUserUrl: string;
		updateUserUrl: string;
		/**
		 * If the response auth header contains a new access token, update the token
		 * in the Authorization header of the successful responses
		 */
		updateTokenFromHeader: boolean;
	};
	onSignedIn?: (U: T) => void;
	onSignedUp?: (U: T) => void;
	onSignedOut?: () => void;
	onUpdateUser?: (U: T) => void;
	onError?: (error: AxiosError) => void;
};

export type JwtAuth<User, SignInPayload, SignUpPayload> = {
	user: User;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (U: SignInPayload) => Promise<AxiosResponse<User, AxiosError>>;
	signOut: () => void;
	signUp: (U: SignUpPayload) => Promise<AxiosResponse<User, AxiosError>>;
	updateUser: (U: PartialDeep<User>) => void;
	refreshToken: () => void;
	setIsLoading: (isLoading: boolean) => void;
	enforcePasswordReset: boolean;
	refreshAccess: () => void;
};

/**
 * useJwtAuth hook
 * Description: This hook handles the authentication flow using JWT
 * It uses axios to make the HTTP requests
 * It uses jwt-decode to decode the access token
 * It uses localStorage to store the access token
 * It uses Axios interceptors to update the access token from the response headers
 * It uses Axios interceptors to sign out the user if the refresh token is invalid or expired
 */

const useJwtAuth = <User, SignInPayload, SignUpPayload>(
	props: JwtAuthProps<User>
): JwtAuth<User, SignInPayload, SignUpPayload> => {
	const { config, onSignedIn, onSignedOut, onSignedUp, onError, onUpdateUser } = props;

	// Merge default config with the one from the props
	const authConfig = _.defaults(config, defaultAuthConfig);

	const [user, setUser] = useState<User>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [enforcePasswordReset, setEnforcePasswordReset] = useState<boolean>(null);
	const [_user, _setUser] = useState<User>(null);

	/**
	 * Set session
	 */
	const setSession = useCallback((accessToken: string) => {
		if (accessToken) {
			localStorage.setItem(authConfig.tokenStorageKey, accessToken);
			axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
		}
	}, []);

	const resetSession = useCallback(() => {
		localStorage.removeItem(authConfig.tokenStorageKey);
		delete axios.defaults.headers.common.Authorization;
	}, []);

	/**
	 * Get access token from local storage
	 */
	const getAccessToken = useCallback(() => {
		return localStorage.getItem(authConfig.tokenStorageKey);
	}, []);

	const setTenantId = useCallback((tenantId: string) => {
		if (tenantId) {
			localStorage.setItem('tenant_id', tenantId);
			axios.defaults.headers.common['x-tenant-id'] = tenantId;
		}
	}, []);

	const resetTenantId = useCallback(() => {
		localStorage.removeItem('tenant_id');
		delete axios.defaults.headers.common['x-tenant-id'];
	}, []);

	/**
	 * Handle sign-in success
	 */

	const handleSignInSuccess = useCallback(async (userData: User, accessToken: string, enforcePasswordReset?: boolean) => {

		setSession(accessToken);
		_setUser(userData)

		if (enforcePasswordReset === true) {
			setTimeout(() => history.push('/reset-password'), 0);
			setUser(userData);
		} else {
			setIsAuthenticated(true);
			setUser(userData);
			onSignedIn(userData);
		}

	}, []);
	/**
	 * Handle sign-up success
	 */


	const handleSignUpSuccess = useCallback((userData: User) => {
		// setSession(accessToken);

		setIsAuthenticated(false);

		setUser(userData);

		onSignedUp(userData);
	}, []);

	/**
	 * Handle sign-in failure
	 */
	const handleSignInFailure = useCallback((error: AxiosError) => {
		resetSession();
		resetTenantId();

		setIsAuthenticated(false);
		setUser(null);

		handleError(error);
	}, []);

	/**
	 * Handle sign-up failure
	 */
	const handleSignUpFailure = useCallback((error: AxiosError) => {
		resetSession();
		resetTenantId();

		setIsAuthenticated(false);
		setUser(null);

		handleError(error);
	}, []);

	/**
	 * Handle error
	 */
	const handleError = useCallback((error: AxiosError) => {
		onError(error);
	}, []);

	/**
	 * Check if the access token is valid
	 */
	const isTokenValid = useCallback((accessToken: string) => {
		if (accessToken) {
			try {
				const decoded = jwtDecode<JwtPayload>(accessToken);
				// const currentTime = Date.now() / 1000;
				// return decoded.exp > currentTime;
				return true;
			} catch (error) {
				return false;
			}
		}

		return false;
	}, []);

	/**
	 * Check if the access token exist and is valid on mount
	 * If it is, set the user and isAuthenticated states
	 * If not, clear the session
	 */
	useEffect(() => {
		const attemptAutoLogin = async () => {
			const accessToken = getAccessToken();

			if (accessToken) {
				try {
					setIsLoading(true);
					const User = await getUserAPI();
					const _user = User?.data?.user;
					const userData: any = {
						uuid: _user.uuid,
						role: _user.role ? (_user.role === 'endUser' ? 'user' : 'admin') : (_user.roles[0]?.roleType === 'endUser' ? 'user' : 'admin'),
						roles: _user.roles ? _user.roles : [],
						roleAcl: _user.roleAcl ? _user.roleAcl : "",
						...((_user.roleId) ? { roleId: _user.roleId } : null),
						isDefault: _user.isDefault ? _user.isDefault : "",
						data: {
							displayName: _user.displayName,
							email: _user.email,
						},
					}
					let enforcePasswordReset;

					if (User?.data?.user?.data?.enforcePasswordReset === 1) {
						setTimeout(() => history.push('/reset-password'), 0);
					}
					handleSignInSuccess(userData, accessToken, enforcePasswordReset);
					return true;
				} catch (error) {
					const axiosError = error as AxiosError;
					handleSignInFailure(axiosError);
					return false;
				}
			} else {
				resetSession();
				resetTenantId();
				return false;
			}
		};

		if (!isAuthenticated) {
			attemptAutoLogin().then(() => {
				setIsLoading(false);
			});
		}
	}, [
		isTokenValid,
		setSession,
		handleSignInSuccess,
		handleSignInFailure,
		handleError,
		getAccessToken,
		isAuthenticated
	]);

	/**
	 * Sign in
	 */
	const signIn = async (credentials: SignInPayload) => {
		const response = axios.post(authConfig.signInUrl, credentials);

		response.then(
			(
				res: AxiosResponse<{ user: User; access_token: string; enforcePasswordReset: boolean; tenant: string }>
			) => {
				const userData = res?.data?.user;
				const accessToken = res?.data?.access_token;
				const tenantId = res?.data?.tenant;
				const enforcePasswordReset = res?.data?.enforcePasswordReset;
				setEnforcePasswordReset(enforcePasswordReset)
				handleSignInSuccess(userData, accessToken, enforcePasswordReset);
				setTenantId(tenantId);

				return userData;
			},
			(error) => {
				const axiosError = error as AxiosError;

				handleSignInFailure(axiosError);

				return axiosError;
			}
		);
		return response;
	};



	/**
	 * Sign up
	 */
	const signUp = useCallback((data: SignUpPayload) => {
		const response = axios.post(authConfig.signUpUrl, data);
		response.then(
			(res: AxiosResponse<{ user: User }>) => {
				const userData = res?.data?.user;
				// handleSignUpSuccess(userData);
				return userData;
			},
			(error) => {
				const axiosError = error as AxiosError;

				handleSignUpFailure(axiosError);

				return axiosError;
			}
		);
		return response;
	}, []);

	/**
	 * Sign out
	 */
	const signOut = useCallback(async () => {
		resetSession();
		resetTenantId();

		setIsAuthenticated(false);
		setEnforcePasswordReset(null)
		setUser(null);
		await LocalCache.deleteItem(cacheIndex.userData);
		onSignedOut();
		localStorage.removeItem(cacheIndex.userRoleId);
		window.location.href = "/sign-in";
	}, []);

	/**
	 * Update user
	 */
	const updateUser = useCallback(async (userData: PartialDeep<User>) => {
		try {
			const response: AxiosResponse<User, PartialDeep<User>> = await axios.put(
				authConfig.updateUserUrl,
				userData
			);

			const updatedUserData = response?.data;

			onUpdateUser(updatedUserData);

			return null;
		} catch (error) {
			const axiosError = error as AxiosError;

			handleError(axiosError);
			return axiosError;
		}
	}, []);

	const refreshAccess = async () => {
		const accessToken = getAccessToken();
		if (accessToken) {
			handleSignInSuccess(_user, accessToken)
		}
	}
	/**
	 * Refresh access token
	 */
	const refreshToken = async () => {

		// const accesstoken = getAccessToken();
		// setIsLoading(true);
		// try {
		//  //const response: AxiosResponse<string> = await axios.post(authConfig.tokenRefreshUrl);

		//  //const accessToken = response?.headers?.['New-Access-Token'] as string;
		//  const accessToken = accesstoken;

		//  if (accessToken) {
		//      setSession(accessToken);
		//      return accessToken;
		//  }

		//  return null;
		// } catch (error) {
		//  const axiosError = error as AxiosError;

		//  handleError(axiosError);
		//  return axiosError;
		// }
	};

	/**
	 * if a successful response contains a new Authorization header,
	 * updates the access token from it.
	 *
	 */
	useEffect(() => {
		if (authConfig.updateTokenFromHeader && isAuthenticated) {
			axios.interceptors.response.use(
				(response) => {
					const newAccessToken = response?.headers?.['New-Access-Token'] as string;

					if (newAccessToken) {
						setSession(newAccessToken);
					}

					return response;
				},
				(error) => {
					const axiosError = error as AxiosError;

					if (axiosError?.response?.status === 401) {
						signOut();
						// eslint-disable-next-line no-console
						console.warn('Unauthorized request. User was signed out.');
					}

					return Promise.reject(axiosError);
				}
			);
		}
	}, [isAuthenticated]);
	return {
		user,
		isAuthenticated,
		isLoading,
		enforcePasswordReset,
		signIn,
		signUp,
		signOut,
		updateUser,
		refreshToken,
		setIsLoading,
		refreshAccess,
	};
};

export default useJwtAuth;
