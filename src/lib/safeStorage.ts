export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage may be blocked or full; degrade gracefully like the guarded read paths
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage may be blocked; degrade gracefully like the guarded read paths
  }
}
