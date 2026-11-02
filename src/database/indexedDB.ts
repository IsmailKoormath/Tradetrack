/** Thin promise wrapper over IndexedDB. Writes resolve only after the transaction commits. */
export type Store = 'accounts' | 'trades' | 'screenshots' | 'meta'
let dbp: Promise<IDBDatabase> | null = null
const open = () => (dbp ??= new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open('tradetrack', 1)
  r.onupgradeneeded = () => {
    for (const s of ['accounts', 'trades', 'screenshots']) r.result.createObjectStore(s, { keyPath: 'id' })
    r.result.createObjectStore('meta', { keyPath: 'key' })
  }
  r.onsuccess = () => res(r.result)
  r.onerror = () => rej(r.error)
}))
async function run<T>(store: Store, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest | void): Promise<T> {
  const db = await open()
  return new Promise<T>((res, rej) => {
    const t = db.transaction(store, mode)
    let out: unknown
    const r = fn(t.objectStore(store))
    if (r) r.onsuccess = () => { out = r.result }
    t.oncomplete = () => res(out as T)
    t.onerror = t.onabort = () => rej(t.error)
  })
}
export const getAll = <T>(s: Store) => run<T[]>(s, 'readonly', o => o.getAll())
export const get = <T>(s: Store, key: string) => run<T | undefined>(s, 'readonly', o => o.get(key))
export const put = (s: Store, v: unknown) => run<void>(s, 'readwrite', o => { o.put(v) })
export const putMany = (s: Store, vs: unknown[]) => run<void>(s, 'readwrite', o => { vs.forEach(v => o.put(v)) })
export const del = (s: Store, key: string) => run<void>(s, 'readwrite', o => { o.delete(key) })
export const clear = (s: Store) => run<void>(s, 'readwrite', o => { o.clear() })
