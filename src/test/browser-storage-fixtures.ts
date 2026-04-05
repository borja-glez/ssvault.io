type StoreRecord = Map<string, unknown>;

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();

  get length() {
    return this.entries.size;
  }

  clear() {
    this.entries.clear();
  }

  getItem(key: string) {
    return this.entries.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.entries.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.entries.delete(key);
  }

  setItem(key: string, value: string) {
    this.entries.set(key, value);
  }
}

function cloneRecord<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

class FakeIDBRequest<T> {
  error: DOMException | null = null;
  onsuccess: ((this: IDBRequest<T>, event: Event) => void) | null = null;
  onerror: ((this: IDBRequest<T>, event: Event) => void) | null = null;
  result!: T;

  succeed(result: T) {
    this.result = result;
    queueMicrotask(() =>
      this.onsuccess?.call(
        this as unknown as IDBRequest<T>,
        new Event('success'),
      ),
    );
  }
}

class FakeIDBOpenRequest extends FakeIDBRequest<IDBDatabase> {
  onblocked:
    | ((this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void)
    | null = null;
  onupgradeneeded:
    | ((this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void)
    | null = null;

  upgrade(result: IDBDatabase) {
    this.result = result;
    queueMicrotask(() =>
      this.onupgradeneeded?.call(
        this as unknown as IDBOpenDBRequest,
        new Event('upgradeneeded') as IDBVersionChangeEvent,
      ),
    );
  }
}

class FakeIDBTransaction {
  error: DOMException | null = null;
  onabort: ((this: IDBTransaction, event: Event) => void) | null = null;
  oncomplete: ((this: IDBTransaction, event: Event) => void) | null = null;
  onerror: ((this: IDBTransaction, event: Event) => void) | null = null;
  private completionScheduled = false;

  constructor(
    private readonly stores: Map<string, StoreRecord>,
    private readonly storeName: string,
  ) {}

  objectStore(name: string) {
    if (name !== this.storeName) {
      throw new Error(`Unknown object store: ${name}`);
    }

    return new FakeIDBObjectStore(
      this,
      this.stores.get(name) ?? new Map<string, unknown>(),
    );
  }

  scheduleCompletion() {
    if (this.completionScheduled) {
      return;
    }

    this.completionScheduled = true;
    queueMicrotask(() =>
      this.oncomplete?.call(
        this as unknown as IDBTransaction,
        new Event('complete'),
      ),
    );
  }
}

class FakeIDBObjectStore {
  constructor(
    private readonly transaction: FakeIDBTransaction,
    private readonly records: StoreRecord,
  ) {}

  clear() {
    const request = new FakeIDBRequest<undefined>();

    queueMicrotask(() => {
      this.records.clear();
      request.succeed(undefined);
      this.transaction.scheduleCompletion();
    });

    return request as unknown as IDBRequest<undefined>;
  }

  getAll() {
    const request = new FakeIDBRequest<unknown[]>();

    queueMicrotask(() => {
      request.succeed(
        Array.from(this.records.values(), (value) => cloneRecord(value)),
      );
      this.transaction.scheduleCompletion();
    });

    return request as unknown as IDBRequest<unknown[]>;
  }

  put(value: unknown) {
    const record = cloneRecord(value as Record<string, unknown>);
    const key = record.id;

    if (typeof key !== 'string') {
      throw new Error('Stored Lite profiles require an id key.');
    }

    this.records.set(key, record);
    this.transaction.scheduleCompletion();
    return new FakeIDBRequest<IDBValidKey>() as unknown as IDBRequest<IDBValidKey>;
  }
}

class FakeIDBDatabase {
  readonly objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  } as DOMStringList;

  constructor(private readonly stores: Map<string, StoreRecord>) {}

  close() {}

  createObjectStore(name: string) {
    const store = new Map<string, unknown>();
    this.stores.set(name, store);
    return new FakeIDBObjectStore(
      new FakeIDBTransaction(this.stores, name),
      store,
    ) as unknown as IDBObjectStore;
  }

  transaction(name: string) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map<string, unknown>());
    }

    return new FakeIDBTransaction(
      this.stores,
      name,
    ) as unknown as IDBTransaction;
  }
}

class FakeIndexedDBFactory {
  private readonly databases = new Map<
    string,
    { version: number; stores: Map<string, StoreRecord> }
  >();

  open(name: string, version?: number) {
    const request = new FakeIDBOpenRequest();

    queueMicrotask(() => {
      const current = this.databases.get(name);
      const nextVersion = version ?? current?.version ?? 1;
      const requiresUpgrade = !current || nextVersion > current.version;
      const entry = current ?? {
        version: nextVersion,
        stores: new Map<string, StoreRecord>(),
      };

      entry.version = nextVersion;
      this.databases.set(name, entry);

      const database = new FakeIDBDatabase(
        entry.stores,
      ) as unknown as IDBDatabase;

      if (requiresUpgrade) {
        request.upgrade(database);
      }

      request.succeed(database);
    });

    return request as unknown as IDBOpenDBRequest;
  }
}

export function createBrowserStorageFixture() {
  return {
    localStorage: new MemoryStorage(),
    indexedDB: new FakeIndexedDBFactory() as unknown as IDBFactory,
  };
}
