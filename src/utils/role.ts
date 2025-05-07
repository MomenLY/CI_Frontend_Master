import { RoleSelectorAPI } from "src/app/main/users/apis/Role-Selector-Api";
import LocalCache from "./localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";

export const getRoleObject = async () => {
    try {
        let roles = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
        const roleObj = roles.reduce((acc, role) => {
            acc[String(role._id)] = { name: role.name };
            return acc;
        }, {});
        return roleObj;
    } catch (e) {
        return {};
    }
};