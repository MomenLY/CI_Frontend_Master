import { openDB } from 'idb';

export default class IDBHelper {
  private dbPromise;
  private selectedTable;

  constructor(dbName: string, version: number, tables: string[]) {
    this.selectedTable = tables[0];
    this.dbPromise = openDB(dbName, version, {
      upgrade(db) {
        for(const table of tables) {
          db.createObjectStore(table);
        }
      },
    });
  }
  get(key: string, table?: string) {
    return this.dbPromise.then(db => db.get(table || this.selectedTable, key))
  }
  set(key: string, val: any, table?: string) {
    return this.dbPromise.then(db => db.put(table || this.selectedTable, val, key))
  }
  del(key: string, table?: string) {
    return this.dbPromise.then(db => db.delete(table || this.selectedTable, key))
  }
  clear(table?: string) {
    return this.dbPromise.then(db => db.clear(table || this.selectedTable))
  }
  keys(table?: string) {
    return this.dbPromise.then(db => db.getAllKeys(table || this.selectedTable))
  }
}

