import { DatabaseRecord } from '../types.ts';

const LOCAL_STORAGE_KEY = 'bioscan_detections_db_v1';

export async function fetchDatabaseRecords(): Promise<DatabaseRecord[]> {
  try {
    const res = await fetch('/api/database');
    if (res.ok) {
      const data = await res.json();
      if (data.records && Array.isArray(data.records)) {
        // Cache to localStorage for offline / instant reload
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.records));
        } catch (e) {
          // ignore
        }
        return data.records;
      }
    }
  } catch (err) {
    console.warn('Backend database fetch error, falling back to local store:', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.error('LocalStorage parse error:', e);
  }

  return [];
}

export async function persistDetectionRecord(record: DatabaseRecord): Promise<{ success: boolean; totalCount?: number }> {
  // 1. Save to local storage first for instant responsiveness
  try {
    const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: DatabaseRecord[] = localStr ? JSON.parse(localStr) : [];
    // Avoid exact duplicate within 2 seconds
    const isDupe = existing.some(
      (r) => r.speciesId === record.speciesId && Math.abs(new Date(r.isoDate).getTime() - new Date(record.isoDate).getTime()) < 2500
    );
    if (!isDupe) {
      const updated = [record, ...existing].slice(0, 150);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Persist to server database endpoint
  try {
    const res = await fetch('/api/database', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, totalCount: data.count };
    }
  } catch (err) {
    console.warn('Server database POST failed, data preserved locally:', err);
  }

  return { success: true };
}

export async function clearAllDatabaseRecords(): Promise<boolean> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    await fetch('/api/database', { method: 'DELETE' });
    return true;
  } catch (err) {
    console.error('Clear database error:', err);
    return false;
  }
}
