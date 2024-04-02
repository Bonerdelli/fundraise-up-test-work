import { PersistStorage } from '../types'

export class LocalStorage implements PersistStorage {
  private storage: Storage
  private keyPrefix: string

  constructor(keyPrefix: string) {
    this.storage = window.localStorage
    this.keyPrefix = keyPrefix
  }

  getItem<T = unknown>(key: string): T {
    const item = this.storage.getItem(this.keyPrefix + key)
    return item ? JSON.parse(item) : null
  }

  setItem<T = unknown>(key: string, value: T): void {
    this.storage.setItem(this.keyPrefix + key, JSON.stringify(value))
  }

  removeItem(key: string): void {
    this.storage.removeItem(this.keyPrefix + key)
  }
}
