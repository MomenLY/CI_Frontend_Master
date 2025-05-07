import LocalCache from "./localCache";

export const updateLocalCache = async(updatedUser) => {
    const cachedAdmins = await LocalCache.getItem("admins") || {};
    cachedAdmins[updatedUser._id] = updatedUser;
   await LocalCache.setItem("admins", cachedAdmins);
  };