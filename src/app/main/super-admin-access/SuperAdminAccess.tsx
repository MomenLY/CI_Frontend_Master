import FuseLoading from '@fuse/core/FuseLoading'
import { useEffect } from 'react'
import { TokenValidateAPI } from './apis/Token-Validate-api';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { useNavigate } from 'react-router';

type Props = {
    email: string;
    password: string;
};

type User = {
    id: string;
    name: string;
    email: string;
};

type SignUpPayload = {
    email: string;
    password: string;
    name: string;
};

function SuperAdminAccess() {
    
    const { jwtService } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams(window.location.search);
            const encodedData = params.get('data');
            if (encodedData) {
                await getInitialDetails(encodedData);
            }
        };
    
        fetchData();
    }, []);

    const getInitialDetails = async (encodedData) => {

        try {
            const tenantData = await JSON.parse(decodeURIComponent(encodedData));
            const response = await TokenValidateAPI(tenantData);
            if (response.statusCode === 201) {
                const accessToken = response.data.access_token;
                const user = response.data.user;
                const userData = {
                    uuid: user.uuid,
                    role: user.role ? (user.role === 'enduser' ? 'user' : 'admin') : (user.roles[0]?.roleType === 'endUser' ? 'user' : 'admin'),
                    roles: user.roles ? user.roles : [],
                    roleAcl: user.roleAcl ? user.roleAcl : "",
                    ...((user.roleId) ? { roleId: user.roleId } : null),
                    isDefault: user.isDefault ? user.isDefault : "",
                    data: {
                        displayName: user?.data?.displayName,
                        email: user?.data?.email,
                        userImage: user?.data?.userImage,
                        tenant: user?.data?.tenant
                    },
                };
                const enforcePasswordReset = response.data.resetPassword;
                const tenantId = response.data.tenant;
                const _token = await localStorage.getItem('jwt_access_token');
                if (!_token) {
                    await LocalCache.setItem(cacheIndex.userData, userData);
                    await LocalCache.deleteItem(cacheIndex.userProfile);
                    await LocalCache.deleteItem(cacheIndex.settings);
                    jwtService.handleUpdateDetails(accessToken, userData, enforcePasswordReset, tenantId)
                } else {
                    localStorage.clear();
                    sessionStorage.clear();
                    await LocalCache.setItem(cacheIndex.userData, userData);
                    await LocalCache.deleteItem(cacheIndex.userProfile);
                    await LocalCache.deleteItem(cacheIndex.settings);
                    jwtService.handleSuperAdminAccess(accessToken, userData, enforcePasswordReset, tenantId)
                }
            }
        } catch (error) {
            if (error) {
                navigate('/sign-in')
            }
        }

    }

    return (
        <FuseLoading />
    )
}

export default SuperAdminAccess