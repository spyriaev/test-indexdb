export class IndexedDBHandler {
    private dbName: string;
    private storeName: string;
    private db: IDBDatabase | null = null;
  
    constructor(dbName: string, storeName: string) {
      this.dbName = dbName;
      this.storeName = storeName;
    }
  
    openDatabase(): Promise<void> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
  
        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
  
        request.onupgradeneeded = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.createObjectStore();
        };
  
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };
      });
    }
  
    private createObjectStore() {
      if (this.db) {
        this.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      }
    }
  
    insertRows(rowCount: number): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not open'));
          return;
        }
  
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
  
        for (let i = 0; i < rowCount; i++) {
          const newRow = { /* your data object here */ };
          const request = objectStore.add(newRow);
  
          request.onerror = (event) => {
            reject((event.target as IDBRequest).error);
          };
        }
  
        transaction.oncomplete = () => {
          resolve();
        };
      });
    }
  }
  

  