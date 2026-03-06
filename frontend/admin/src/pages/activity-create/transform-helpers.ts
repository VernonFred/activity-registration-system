export function cleanScalar(value: unknown): unknown | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (Array.isArray(value)) {
    const cleaned: unknown[] = value
      .map((item) => cleanScalar(item))
      .filter((item) => item !== undefined)
    return cleaned.length ? cleaned : undefined
  }
  return value
}

export function cleanObject<T>(value: T): T | undefined {
  if (value == null) return undefined
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined)
    return (cleaned.length ? cleaned : undefined) as T | undefined
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, inner]) => [key, cleanObject(inner)] as const)
      .filter(([, inner]) => inner !== undefined)
    return (entries.length ? Object.fromEntries(entries) : undefined) as T | undefined
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return (trimmed ? trimmed : undefined) as T | undefined
  }
  return value
}

export function splitLegacyTime(rawTime?: unknown) {
  const value = typeof rawTime === 'string' ? rawTime.trim() : ''
  if (!value) return { time_start: '', time_end: '' }
  const [start, end] = value.split('-').map((item) => item.trim())
  return {
    time_start: start || '',
    time_end: end || start || '',
  }
}

export function createCompatId(...parts: Array<string | number>) {
  return parts.map((part) => String(part)).join('-')
}
