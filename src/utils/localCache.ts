import IDBHelper from "./idbHelper";

class LocalCache {
  private static maxCacheAge = 3600000;
  private static idb = new IDBHelper("onion", 1, ["default", "settings"]);
  /**
   * Retrieves an item from localStorage.
   * @param {string} key - The key of the item to retrieve.
   * @returns {string | null} - The string value if successful, otherwise null.
   */
  static async getItem(
    key: string,
    callback?: any,
    table?: string
  ): Promise<any | null> {
    try {
      const currentTime = new Date().getTime();
      let cachedItem = await this.idb.get(key, table);
      if (!cachedItem) {
        if (callback) {
          cachedItem = await callback();
          this.setItem(key, cachedItem);
          return cachedItem;
        } else {
          return null;
        }
      } else {
        const cachedTime = cachedItem?.timestamp;
        const cacheAge = currentTime - cachedTime;
        if (cacheAge > this.maxCacheAge) {
          await this.deleteItem(key);
          if (callback) {
            cachedItem = await callback();
            this.setItem(key, cachedItem);
            return cachedItem;
          } else {
            return null;
          }
        } else {
          return cachedItem.data;
        }
      }
    } catch (error) {
      console.error(
        `Error retrieving item from localStorage with key "${key}":`,
        error
      );
      return null;
    }
  }

  /**
   * Sets an item in localStorage.
   * @param {string} key - The key of the item to set.
   * @param {T} value - The value to set, which will be stringified to JSON.
   * @returns {boolean} - Returns true if the item was set successfully, otherwise false.
   */
  static async setItem<T>(
    key: string,
    value: T,
    table?: string
  ): Promise<boolean> {
    try {
      let _value = {
        data: value,
        timestamp: new Date().getTime(),
      };
      await this.idb.set(key, _value, table);
      return true;
    } catch (error) {
      console.error(
        `Error setting item in localStorage with key "${key}":`,
        error
      );
      return false;
    }
  }

  /**
   * Retrieves an item from localStorage.
   * @param {string} key - The key of the item to retrieve.
   * @returns {string | null} - The boolean value.
   */
  static async deleteItem(key: string, table?: string): Promise<any | null> {
    try {
      await this.idb.del(key, table);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async clearAll(): Promise<boolean> {
    try {
      const db = await this.idb.getDB();
      const transaction = db.transaction(db.objectStoreNames, "readwrite");
  
      for (const storeName of db.objectStoreNames) {
        transaction.objectStore(storeName).clear();
      }
  
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(false);
      });
    } catch (error) {
      console.error("Error clearing all data from IndexedDB:", error);
      return false;
    }
  }
  
}


export default LocalCache;
