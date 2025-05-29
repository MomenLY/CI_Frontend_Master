import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OnionAclManager from 'app/shared-components/onion-acl-manager/OnionAclManager';
import { getRoleDetailsById } from '../apis/Get-Role-Api-By-Id';
import { updateRoleAcl } from '../apis/Update-Role-Acl';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getRoleModules } from 'app/shared-components/cache/cacheCallbacks';

function EditForm() {
    const { t } = useTranslation('roleManagement');
    const { id, roleType } = useParams();
    const [roleModules, setRoleModules] = useState([]);
    const [canSave, setCanSave] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [permission, setPermission] = useState({});
    const [roleAcl, setRoleAcl] = useState({});

    useEffect(() => {
        getRoleModule(roleType);
        getRoleDetailsAPI();
        const permissions = getModuleAccessRules('users', 'addUser');
        if (permissions) {
            setPermission(permissions);
        }
    }, [id])

    const getRoleDetailsAPI = async () => {
        const roleDetails = await getRoleDetailsById(id);
        setRoleAcl(roleDetails.data.acl);
    }

    const getRoleModule = async (id: string) => {
        let roleModules = await LocalCache.getItem(
            (
                roleType === 'admin' ? cacheIndex.roleModulesAdmin : cacheIndex.roleModulesEndUser),
            getRoleModules.bind(null, roleType)
        );
        const _roleModules = [];
        Object.entries(roleModules).forEach(([key, roleModule]) => {
            _roleModules.push(roleModule);
        });
        setRoleModules(_roleModules);
    }


    const saveMyAclData = async (res: any, response: any) => {
        const data = {
            _id: id,
            acl: res
        }
        const roleUpdation = await updateRoleAcl(data);
        if (roleUpdation.statusCode === 200) {
            dispatch(showMessage({ message: t('role_roleUpdate_success'), variant: "success" }));
            navigate('/admin/settings/user-settings/role-management');
        } else {
            dispatch(showMessage({ message: t('role_roleUpdate_failed'), variant: "error" }));
            navigate('/admin/settings/user-settings/role-management');
        }
    }

    return (
        <>
            {roleModules.length && <OnionAclManager
                modules={roleModules}
                onUpdate={saveMyAclData}
                acl={roleAcl}
                permissions={permission}
            />}
        </>
    )
}

export default EditForm