export const tenantPrefix = "tenant-";
export const tenantKey = "tenant_id";
export const getTenantId = (_route: Object) => {
    if (_route[tenantKey]?.startsWith(tenantPrefix)) {
        return _route[tenantKey].replace(tenantPrefix, '');
    }
    return _route[tenantKey];
};

export const getTenantSlug = (_route: Object) => {
    return _route[tenantKey];
};