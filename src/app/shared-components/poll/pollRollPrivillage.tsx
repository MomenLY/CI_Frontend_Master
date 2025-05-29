import { cacheIndex } from "../cache/cacheIndex";
import { getTenantId } from "src/utils/tenantHelper";
import LocalCache from "src/utils/localCache";
import { getSingleExpoAPI, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { useLocation } from "react-router";
import { log } from "console";



export const checkSeesionStatus = async (routeParams, locations) => {

    const token = localStorage.getItem("jwt_access_token");
    if (!token) {
        return false;
    }

    const pathSegments = locations.pathname.split("/");
    let eventId = pathSegments[pathSegments.length - 1]; // "4YVY2V" will be the last segment
    let tenantId = getTenantId(routeParams);
    let expoDetails = await LocalCache.getItem(
        cacheIndex.expoDetails + "_" + routeParams.id,
        getSingleExpoAPI.bind(this, routeParams.id)
    );
    try {
        if (tenantId === undefined) {
            const _queryParams = new URLSearchParams(location.search);
            tenantId = _queryParams.get('t');
        }
        const queryParams = new URLSearchParams(location.search);
        const schedule = queryParams.get("schedule");
        let locaalTenantId = localStorage.getItem("tenant_id");
        if ( expoDetails.data.expo.expCode == eventId
            && (schedule !== null && schedule !== undefined && schedule !== "")

        ) {
            
            return true;
        } else {
            return false;
        }


    } catch (error) {
        return error;
    }
};

export const checkAdminStatus = async (routeParams) => {

    const token = localStorage.getItem("jwt_access_token");
    if (!token) {
        return false;
    }


    let tenantId = getTenantId(routeParams);
    const userData = await LocalCache.getItem(
        cacheIndex.userData,
        getUserSession.bind(this)
    );

    try {

        if (userData.role == "admin") {
            if (tenantId === undefined) {
                const _queryParams = new URLSearchParams(location.search);
                tenantId = _queryParams.get('t');
            }
            let locaalTenantId = localStorage.getItem("tenant_id");
            if (tenantId === locaalTenantId) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    } catch (error) {
        return error;
    }
};

export const checkSpeakerStatus = async (routeParams) => {
    const token = localStorage.getItem("jwt_access_token");
    if (!token) {
        return false;
    }
    let tenantId = getTenantId(routeParams);
    const userData = await LocalCache.getItem(
        cacheIndex.userData,
        getUserSession.bind(this)
    );

    try {
        if (userData.role == "admin") {
            if (tenantId === undefined) {
                const _queryParams = new URLSearchParams(location.search);
                tenantId = _queryParams.get('t');
            }
            let locaalTenantId = localStorage.getItem("tenant_id");
            let localUserRoleId = localStorage.getItem("userRoleId");

            if (tenantId === locaalTenantId && localUserRoleId == userData.roleId) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return error;
    }
};



