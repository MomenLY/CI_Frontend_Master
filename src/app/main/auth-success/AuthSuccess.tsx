import FuseLoading from '@fuse/core/FuseLoading';
import React, { Suspense, useEffect, useState } from 'react'
import { pageLayout } from 'app/configs/settingsConfig';
import AuthSuccesTab from './tab/AuthSuccesTab';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSettings, getUserSession } from 'app/shared-components/cache/cacheCallbacks';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { getSessionRedirectUrl, resetSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
// Lazy-loaded components
const ClassicAuthSuccess = React.lazy(() => import('./auth-layouts/ClassicAuthSuccess'));
const ModernAuthSuccess = React.lazy(() => import('./auth-layouts/ModernAuthSuccess'));
const ModernReversedAuthSuccess = React.lazy(() => import('./auth-layouts/ModernReversedAuthSuccess'));
const FullScreenAuthSuccess = React.lazy(() => import('./auth-layouts/FullScreenAuthSuccess'));

function LoadingFallback() {
  return <FuseLoading />;
}

function AuthSuccess() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const dispatch: any = useAppDispatch();
  const [roles, setRoles] = useState({});
  const [loaded, setLoaded] = useState(false);
  const _roleId = localStorage.getItem(cacheIndex.userRoleId);
  const _token = localStorage.getItem('jwt_access_token');
  // if (!_token) {
  //   navigate("/sign-in");
  //   // window.location.href = "sign-in"
  // }
  useEffect(() => {
    if (!_token) {
      localStorage.removeItem(cacheIndex.userRoleId);
      signOut();
      navigate("/sign-in");
    }
  }, [_token, signOut, navigate, _roleId]);

  useEffect(() => {
    processUserRole();
  }, []);

  // useEffect(() => {
  //   if (!_token) {
  //     localStorage.removeItem(cacheIndex.userRoleId);
  //     signOut();
  //   }
  // }, [_roleId, _token]);

  const processUserRole = async () => {
    try {
      setLoaded(true);
      const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
      if (!localStorage.getItem(cacheIndex.userRoleId) && typeof userData.roles !== "undefined" && userData.roles.length > 1) {
        let _roles = {};
        Object.entries(userData.roles).forEach(([roleKey, role]: [string, any]) => {
          _roles[role._id] = role;
        });
        setRoles(_roles);
        setLoaded(false)
      } else {
        setLoaded(true);
        if (!userData.roleId) {
          localStorage.removeItem(cacheIndex.userRoleId);
          signOut();
        } else {
          localStorage.setItem(cacheIndex.userRoleId, userData.roleId);
          redirectUser(userData.role, userData.roleId);
        }
      }
    } catch (e) {
    }

  }

  // const redirectUser = async (roleType: string, roleId: string) => {
  //   const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
  //   // let boothManagerRoleId = settings?.boothManagerRoleId;
  //   debugger
  //   let speakerRoleId = settings?.speakerRoleId;

  //   let boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
  //   let signInRedirectURL = getSessionRedirectUrl();
  //   if (roleId === boothManagerRoleId || roleId === speakerRoleId) {

  //     if (!signInRedirectURL || signInRedirectURL === '/') {
  //       signInRedirectURL = "dashboard";
  //     }
  //   } else {
  //     if (!signInRedirectURL) {
  //       signInRedirectURL = roleType === "admin" ? "admin/dashboard" : "dashboard";
  //     } else {
  //       const isAdminURL = signInRedirectURL.includes("/admin/");
  //       const isAdmin = roleType === "admin";

  //       if (isAdmin !== isAdminURL) {
  //         signInRedirectURL = isAdmin ? "admin/dashboard" : "dashboard";
  //       }
  //     }
  //   }
  //   resetSessionRedirectUrl();
  //   window.location.href = signInRedirectURL;
  // };

  const redirectUser = async (roleType: string, roleId: string) => {
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));

    let speakerRoleId = settings?.speakerRoleId;
    let boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
    let signInRedirectURL = getSessionRedirectUrl() || "/";

    if (roleId === boothManagerRoleId || roleId === speakerRoleId) {
      signInRedirectURL = signInRedirectURL === '/' ? "dashboard" : signInRedirectURL;
    } else {
      const isAdminURL = signInRedirectURL.includes("/admin/");
      const isAdmin = roleType === "admin";

      signInRedirectURL = isAdmin ? "admin/dashboard" : "dashboard";

      if (isAdmin !== isAdminURL) {
        signInRedirectURL = isAdmin ? "admin/dashboard" : "dashboard";
      }
    }

    resetSessionRedirectUrl();
    window.location.href = signInRedirectURL; // Consider using a router navigation function in SPA
  };

  const handleRoleSelection = async (role: any) => {
    const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
    userData['role'] = role.roleType;
    userData['roleAcl'] = role.acl;
    userData['roleId'] = role._id;
    userData['isDefault'] = role.areIsDefault;
    await LocalCache.setItem(cacheIndex.userData, userData);
    localStorage.setItem(cacheIndex.userRoleId, role._id);
    redirectUser(role.roleType, userData.roleId);
  }
  // Define a map of page layout components
  const pageLayoutComponents = {
    '': ClassicAuthSuccess,
    classic: ClassicAuthSuccess,
    modern: ModernAuthSuccess,
    modernReversed: ModernReversedAuthSuccess,
    fullscreen: FullScreenAuthSuccess
  };

  // Retrieve the appropriate component based on pageLayout
  const SelectedAuthSuccessComponent = pageLayoutComponents[pageLayout] || ClassicAuthSuccess;

  if (loaded) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SelectedAuthSuccessComponent>
        <AuthSuccesTab roles={roles} onRoleClick={handleRoleSelection} />
      </SelectedAuthSuccessComponent>
    </Suspense>
  )
}

export default AuthSuccess
