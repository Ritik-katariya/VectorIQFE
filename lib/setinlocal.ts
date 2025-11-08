

export function setInLocalStorage<T>(key: string, value: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }
  return null;
}
export function removeFromLocalStorage(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}