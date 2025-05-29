import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "./localCache";
import { getSettings } from "./settingsLibrary";

const localConfigs = await LocalCache.getItem(
  cacheIndex.settings,
  getSettings.bind(null)
);

export const bannerPath = localConfigs?.bannerPath;
export const expoPath = localConfigs?.expoPath;
export const speakerPath = localConfigs?.speakerPath;
export const userPath = localConfigs?.userPath;
export const logoPath = localConfigs?.logoPath;
export const customFilePath = localConfigs?.customFilePath || 'uploads/ci/ci_tenant_dev/customFilePath/';

export const defaultBannerPath = localConfigs?.defaultBannerPath;
export const defaultExpoPath = localConfigs?.defaultExpoPath;
export const defaultSpeakerPath = localConfigs?.defaultSpeakerPath;
export const defaultUserPath = localConfigs?.defaultUserPath;
export const defaultLogoPath = localConfigs?.defaultLogoPath;
export const defaultLayoutPath = localConfigs?.defaultLayoutPath;

export const assetURL = (path) => {
  const prefix = localConfigs?.assetUrl;
  return prefix + path;
};
export const bannerImageUrl = (bannerImageName, tenantName = "") => {
  const orgPath = assetURL(bannerPath + bannerImageName);
  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;
};
export const expoImageUrl = (expoImageName, tenantName = "") => {
  const orgPath = assetURL(expoPath + expoImageName);
  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;

};
export const speakerImageUrl = (speakerImageName, tenantName = "") => {
  const orgPath = assetURL(speakerPath + speakerImageName);
  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;
}
export const userImageUrl = (userImageName, tenantName = "") => {
  const orgPath = assetURL(userPath + userImageName);
  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;
}
export const logoImageUrl = (logoImageName, tenantName = "") => {
  const orgPath = assetURL(getLogoPath(tenantName) + logoImageName);
  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;
}
export const customFileUrl = (customFileName) => {
  return assetURL(customFilePath + customFileName);
}

export const defaultBannerImageUrl = (bannerImageName) => {
  return assetURL(defaultBannerPath + bannerImageName);
};
export const defaultExpoImageUrl = (expoImageName) => {
  return assetURL(defaultExpoPath + expoImageName);
};
export const defaultSpeakerImageUrl = (speakerImageName) => {
  return assetURL(defaultSpeakerPath + speakerImageName);
}
export const defaultUserImageUrl = (userImageName) => {
  return assetURL(defaultUserPath + userImageName);
}
export const defaultLogoImageUrl = (logoImageName) => {
  return assetURL(defaultLogoPath + logoImageName);
}
export const defaultLayoutImageUrl = (layoutImageName, folderName) => {
  return assetURL(defaultLayoutPath + folderName + "/" + layoutImageName);
}
export const userImageUrlWithTenant = (userImageName, tenantName) => {
  const orgPath = assetURL(userPath + userImageName);

  return tenantName ? getTenantSpecificUrl(orgPath, tenantName) : orgPath;
}
export const expoLayoutImageUrl = (expoImageName) => {
  return assetURL('uploads/cifront.enfinlabs.com/default/expo_layout_images/' + expoImageName);
}

export const expoBoothLogoImageUrl = (expoImageName, expTenantId) => {
  return assetURL(`uploads/ci/${expTenantId}/booths/booth_images/` + expoImageName);
}

export const expoBoothResourcesUrl = (expoImageName, expTenantId) => {
  return assetURL(`uploads/ci/${expTenantId}/booths/booth_resources/` + expoImageName);
}

export const expoBoothLayoutImageUrl = ( imageName ) => {
  return assetURL(`uploads/ci/default/booth-layout-images/${imageName}`);
}

export const boothLayoutHelper2 = async (url: string, layout: string) => {
  return assetURL('uploads/ci/default/layouts/booths/mobile/' + layout + '/' + url + '.webp')
};

export const userBoothLayoutImageUrl = ( imageName: string, layout: string ) => {
  return assetURL(`uploads/ci/default/layouts/booths/${layout}/${imageName}.webp`);
}

export const expoBillboardResoucesUrl = (billboardImageName, tenantName) => {
  return assetURL(`uploads/ci/${tenantName}/billboards/` + billboardImageName);
}
export const expoBillboardLayoutImageUrl = ( layoutId, imageName ) => {
  return assetURL(`uploads/ci/default/billboard/${imageName}`);
}

export const expoLayoutUrl = (imageName ) => {
  return assetURL(`uploads/ci/default/layouts/${imageName}`);
}
const getTenantSpecificUrl = (orgPath, tenantName) => {
  const parts = orgPath.split('/');
  if (parts.length > 2) {
    parts[5] = tenantName;
  }
  return parts.join('/');
};

export const getLogoPath = (tenantId) => {
  const logoPath = `uploads/ci/${tenantId}/logo/`;
  return logoPath;
}
