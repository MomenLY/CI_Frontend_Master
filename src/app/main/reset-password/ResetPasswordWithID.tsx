import React, { Suspense, useEffect, useState } from 'react'
import { TokenValidatorApi } from './apis/Token-Validator-Api';
import { useParams } from 'react-router';
import FuseLoading from '@fuse/core/FuseLoading';
import Error500Page from '../404/Error500Page';
import ResetPassword from './ResetPassword';

function LoadingFallback() {
	return <FuseLoading />;
}

function ResetPasswordWithID() {
    const { id } = useParams();

    const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
	const [loaded, setLoaded] = useState<boolean>(false);
    useEffect(() => {
		const tokenValidator = async () => {
			try {
				const IsTokenValid = await TokenValidatorApi({ data: id });

				if (IsTokenValid) {
					setLoaded(true);
					setIsTokenValid(true);
				}
			} catch (err) {

	
				setLoaded(true);
				setIsTokenValid(false);
			}
		};
		tokenValidator();
	}, []);

    if (!loaded) {
		return <LoadingFallback />;
	}
    return (
		<Suspense fallback={<LoadingFallback />}>
			{isTokenValid ? (
				<ResetPassword />
			) : (
				<Error500Page label="The reset link has already been utilized." />
			)}
		</Suspense>
	);
}

export default ResetPasswordWithID