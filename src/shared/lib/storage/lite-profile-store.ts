import type { StoredLiteProfileConfiguration } from '../../types/lite';
import {
  LITE_DATABASE_NAME,
  LITE_DATABASE_VERSION,
  LITE_PROFILES_STORE_NAME,
  sanitizeStoredLiteProfile,
} from './lite-storage-contract';

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(
      LITE_DATABASE_NAME,
      LITE_DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(LITE_PROFILES_STORE_NAME)) {
        database.createObjectStore(LITE_PROFILES_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onerror = () =>
      reject(request.error ?? new Error('No se pudo abrir IndexedDB.'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Persistencia híbrida base: aquí SOLO viven perfiles/configuración no secreta.
 * Nunca debe aceptarse ni almacenarse una master password en este store.
 */
export async function upsertStoredLiteProfile(
  profile: StoredLiteProfileConfiguration,
) {
  const sanitized = sanitizeStoredLiteProfile(profile);

  if (!sanitized) {
    throw new Error(
      'El perfil Lite no cumple el contrato de persistencia no secreta.',
    );
  }

  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      LITE_PROFILES_STORE_NAME,
      'readwrite',
    );
    const store = transaction.objectStore(LITE_PROFILES_STORE_NAME);

    store.put(sanitized);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo guardar el perfil.'));
  });

  database.close();
}

export async function listStoredLiteProfiles() {
  const database = await openDatabase();

  const profiles = await new Promise<StoredLiteProfileConfiguration[]>(
    (resolve, reject) => {
      const transaction = database.transaction(
        LITE_PROFILES_STORE_NAME,
        'readonly',
      );
      const store = transaction.objectStore(LITE_PROFILES_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = (
          (request.result as StoredLiteProfileConfiguration[]) ?? []
        )
          .map((profile) => sanitizeStoredLiteProfile(profile))
          .filter(
            (profile): profile is StoredLiteProfileConfiguration =>
              profile !== null,
          );

        resolve(entries);
      };
      request.onerror = () =>
        reject(request.error ?? new Error('No se pudieron leer los perfiles.'));
    },
  );

  database.close();
  return profiles;
}

export async function replaceStoredLiteProfiles(
  profiles: StoredLiteProfileConfiguration[],
) {
  const sanitizedProfiles = profiles.map((profile) =>
    sanitizeStoredLiteProfile(profile),
  );

  if (sanitizedProfiles.some((profile) => !profile)) {
    throw new Error(
      'La importación Lite contiene perfiles fuera del contrato permitido.',
    );
  }

  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      LITE_PROFILES_STORE_NAME,
      'readwrite',
    );
    const store = transaction.objectStore(LITE_PROFILES_STORE_NAME);
    const clearRequest = store.clear();

    clearRequest.onerror = () =>
      reject(
        clearRequest.error ??
          new Error('No se pudieron reemplazar los perfiles.'),
      );
    clearRequest.onsuccess = () => {
      for (const profile of sanitizedProfiles) {
        store.put(profile);
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error('No se pudieron reemplazar los perfiles.'),
      );
  });

  database.close();
}

export async function deleteStoredLiteProfile(id: string): Promise<void> {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      LITE_PROFILES_STORE_NAME,
      'readwrite',
    );
    const store = transaction.objectStore(LITE_PROFILES_STORE_NAME);

    store.delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('No se pudo eliminar el perfil.'));
  });

  database.close();
}
