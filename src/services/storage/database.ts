const DATABASE_NAME = 'ciphergrid-local';
const DATABASE_VERSION = 1;
export type StoreName = 'history' | 'recipes' | 'batchJobs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of ['history', 'recipes', 'batchJobs'] as StoreName[]) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Local database could not be opened.'));
  });
}

export async function putRecord<T extends { id: string }>(storeName: StoreName, record: T): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(record);
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error('Local record could not be saved.'));
  });
  db.close();
}

export async function getRecords<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  const records = await new Promise<T[]>((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]); request.onerror = () => reject(new Error('Local records could not be loaded.'));
  });
  db.close(); return records;
}

export async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error('Local record could not be deleted.'));
  });
  db.close();
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).clear();
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error('Local records could not be cleared.'));
  });
  db.close();
}
